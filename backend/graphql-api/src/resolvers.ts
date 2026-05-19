import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
import DataLoader from 'dataloader';
import { PrismaClient } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';

const prisma = new PrismaClient();
const pubsub = new PubSub();

// ==================== DATALOADERS ====================

const createUserLoader = () => new DataLoader(async (userIds: readonly string[]) => {
    const users = await prisma.user.findMany({
        where: { id: { in: [...userIds] } }
    });
    return userIds.map(id => users.find(u => u.id === id));
});

const createBoardLoader = () => new DataLoader(async (boardIds: readonly string[]) => {
    const boards = await prisma.board.findMany({
        where: { id: { in: [...boardIds] } }
    });
    return boardIds.map(id => boards.find(b => b.id === id));
});

const createTaskLoader = () => new DataLoader(async (taskIds: readonly string[]) => {
    const tasks = await prisma.task.findMany({
        where: { id: { in: [...taskIds] } }
    });
    return taskIds.map(id => tasks.find(t => t.id === id));
});

const createColumnLoader = () => new DataLoader(async (columnIds: readonly string[]) => {
    const columns = await prisma.column.findMany({
        where: { id: { in: [...columnIds] } }
    });
    return columnIds.map(id => columns.find(c => c.id === id));
});

// ==================== CUSTOM SCALARS ====================

const DateTimeScalar = new GraphQLScalarType({
    name: 'DateTime',
    description: 'DateTime custom scalar type',
    serialize(value: any) {
        return value instanceof Date ? value.toISOString() : value;
    },
    parseValue(value: any) {
        return new Date(value);
    }
});

const JSONScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value: any) {
        return value;
    },
    parseValue(value: any) {
        return value;
    }
});

// ==================== QUERY RESOLVERS ====================

const Query = {
    me: async (_: any, __: any, context: any) => {
        return await context.loaders.user.load(context.userId);
    },

    user: async (_: any, { id }: any, context: any) => {
        return await context.loaders.user.load(id);
    },

    users: async (_: any, { filter, limit = 50, offset = 0 }: any) => {
        const where: any = {};
        if (filter?.role) where.role = filter.role;
        if (filter?.search) {
            where.OR = [
                { name: { contains: filter.search, mode: 'insensitive' } },
                { email: { contains: filter.search, mode: 'insensitive' } }
            ];
        }

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({ where, take: limit, skip: offset }),
            prisma.user.count({ where })
        ]);

        return {
            edges: users.map((user, index) => ({
                node: user,
                cursor: Buffer.from(`${offset + index}`).toString('base64')
            })),
            pageInfo: {
                hasNextPage: offset + limit < totalCount,
                hasPreviousPage: offset > 0,
                startCursor: users.length > 0 ? Buffer.from(`${offset}`).toString('base64') : null,
                endCursor: users.length > 0 ? Buffer.from(`${offset + users.length - 1}`).toString('base64') : null
            },
            totalCount
        };
    },

    board: async (_: any, { id }: any, context: any) => {
        return await context.loaders.board.load(id);
    },

    boards: async (_: any, { workspaceId, filter }: any, context: any) => {
        const where: any = { workspaceId };

        if (filter?.visibility) where.visibility = filter.visibility;
        if (filter?.search) {
            where.OR = [
                { name: { contains: filter.search, mode: 'insensitive' } },
                { description: { contains: filter.search, mode: 'insensitive' } }
            ];
        }

        // Check access
        where.OR = [
            ...(where.OR || []),
            { createdBy: context.userId },
            { members: { some: { userId: context.userId } } },
            { visibility: 'PUBLIC' }
        ];

        return await prisma.board.findMany({
            where,
            include: {
                columns: true,
                members: true
            },
            orderBy: { updatedAt: 'desc' }
        });
    },

    task: async (_: any, { id }: any, context: any) => {
        return await context.loaders.task.load(id);
    },

    tasks: async (_: any, { boardId, filter }: any) => {
        const where: any = { boardId };

        if (filter?.columnId) where.columnId = filter.columnId;
        if (filter?.sprintId) where.sprintId = filter.sprintId;
        if (filter?.assigneeId) where.assigneeId = filter.assigneeId;
        if (filter?.type) where.type = filter.type;
        if (filter?.priority) where.priority = filter.priority;
        if (filter?.status) where.status = filter.status;
        if (filter?.search) {
            where.OR = [
                { title: { contains: filter.search, mode: 'insensitive' } },
                { description: { contains: filter.search, mode: 'insensitive' } },
                { key: { contains: filter.search, mode: 'insensitive' } }
            ];
        }
        if (filter?.dueDate) {
            where.dueDate = {
                gte: filter.dueDate.from,
                lte: filter.dueDate.to
            };
        }

        return await prisma.task.findMany({
            where,
            include: {
                column: true,
                taskLabels: { include: { label: true } }
            },
            orderBy: { order: 'asc' }
        });
    },

    myTasks: async (_: any, { filter }: any, context: any) => {
        const where: any = { assigneeId: context.userId };

        if (filter?.type) where.type = filter.type;
        if (filter?.priority) where.priority = filter.priority;
        if (filter?.status) where.status = filter.status;

        return await prisma.task.findMany({
            where,
            include: {
                column: true,
                board: true,
                taskLabels: { include: { label: true } }
            },
            orderBy: [
                { dueDate: 'asc' },
                { priority: 'desc' }
            ]
        });
    },

    sprint: async (_: any, { id }: any) => {
        return await prisma.sprint.findUnique({
            where: { id },
            include: { tasks: true }
        });
    },

    sprints: async (_: any, { boardId }: any) => {
        return await prisma.sprint.findMany({
            where: { boardId },
            include: { tasks: true },
            orderBy: { startDate: 'desc' }
        });
    },

    boardAnalytics: async (_: any, { boardId }: any) => {
        const [totalTasks, completedTasks, tasksInProgress, tasksByColumn, tasksByPriority, tasksByType] = await Promise.all([
            prisma.task.count({ where: { boardId } }),
            prisma.task.count({ where: { boardId, status: 'DONE' } }),
            prisma.task.count({ where: { boardId, status: 'IN_PROGRESS' } }),
            prisma.task.groupBy({
                by: ['columnId'],
                where: { boardId },
                _count: true
            }),
            prisma.task.groupBy({
                by: ['priority'],
                where: { boardId },
                _count: true
            }),
            prisma.task.groupBy({
                by: ['type'],
                where: { boardId },
                _count: true
            })
        ]);

        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const columns = await prisma.column.findMany({
            where: { boardId },
            select: { id: true, name: true }
        });

        return {
            totalTasks,
            completedTasks,
            tasksInProgress,
            completionRate,
            tasksByColumn: tasksByColumn.map((tc: any) => ({
                columnId: tc.columnId,
                columnName: columns.find(c => c.id === tc.columnId)?.name || 'Unknown',
                count: tc._count
            })),
            tasksByPriority: tasksByPriority.map((tp: any) => ({
                priority: tp.priority,
                count: tp._count
            })),
            tasksByType: tasksByType.map((tt: any) => ({
                type: tt.type,
                count: tt._count
            })),
            tasksByAssignee: []
        };
    },

    searchTasks: async (_: any, { query, boardId, limit = 20 }: any) => {
        const where: any = {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { key: { contains: query, mode: 'insensitive' } }
            ]
        };

        if (boardId) where.boardId = boardId;

        return await prisma.task.findMany({
            where,
            take: limit,
            include: {
                column: true,
                board: true,
                taskLabels: { include: { label: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });
    },

    notifications: async (_: any, { limit = 50, offset = 0 }: any, context: any) => {
        const where = { userId: context.userId };

        const [notifications, totalCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.notification.count({ where })
        ]);

        return {
            edges: notifications.map((notif, index) => ({
                node: notif,
                cursor: Buffer.from(`${offset + index}`).toString('base64')
            })),
            pageInfo: {
                hasNextPage: offset + limit < totalCount,
                hasPreviousPage: offset > 0
            },
            totalCount
        };
    },

    unreadNotificationsCount: async (_: any, __: any, context: any) => {
        return await prisma.notification.count({
            where: { userId: context.userId, read: false }
        });
    }
};

// ==================== MUTATION RESOLVERS ====================

const Mutation = {
    createBoard: async (_: any, { input }: any, context: any) => {
        const slug = input.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

        const board = await prisma.board.create({
            data: {
                ...input,
                slug,
                createdBy: context.userId,
                columns: {
                    create: [
                        { name: 'To Do', order: 1, color: '#808080', isDefault: true },
                        { name: 'In Progress', order: 2, color: '#3B82F6' },
                        { name: 'Review', order: 3, color: '#F59E0B' },
                        { name: 'Done', order: 4, color: '#10B981' }
                    ]
                },
                members: {
                    create: {
                        userId: context.userId,
                        role: 'OWNER'
                    }
                }
            },
            include: { columns: true, members: true }
        });

        pubsub.publish('BOARD_CREATED', { boardCreated: board });
        return board;
    },

    createTask: async (_: any, { input }: any, context: any) => {
        const board = await prisma.board.findUnique({
            where: { id: input.boardId },
            select: { slug: true }
        });

        const taskCount = await prisma.task.count({ where: { boardId: input.boardId } });
        const key = `${board?.slug.split('-')[0].toUpperCase()}-${taskCount + 1}`;

        const maxOrder = await prisma.task.findFirst({
            where: { columnId: input.columnId },
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        const task = await prisma.task.create({
            data: {
                ...input,
                key,
                reporterId: context.userId,
                order: (maxOrder?.order || 0) + 1,
                status: 'TODO'
            },
            include: {
                column: true,
                board: true,
                taskLabels: { include: { label: true } }
            }
        });

        pubsub.publish(`TASK_CREATED_${input.boardId}`, { taskCreated: task });
        return task;
    },

    updateTask: async (_: any, { id, input }: any, context: any) => {
        const task = await prisma.task.update({
            where: { id },
            data: input,
            include: {
                column: true,
                taskLabels: { include: { label: true } }
            }
        });

        pubsub.publish(`TASK_UPDATED_${id}`, { taskUpdated: task });
        pubsub.publish(`BOARD_UPDATED_${task.boardId}`, {
            boardUpdated: { type: 'TASK_UPDATED', data: task }
        });

        return task;
    },

    moveTask: async (_: any, { id, columnId, order }: any, context: any) => {
        const task = await prisma.task.update({
            where: { id },
            data: { columnId, order },
            include: {
                column: true,
                taskLabels: { include: { label: true } }
            }
        });

        pubsub.publish(`TASK_MOVED_${task.boardId}`, { taskMoved: task });
        return task;
    },

    assignTask: async (_: any, { id, userId }: any) => {
        const task = await prisma.task.update({
            where: { id },
            data: { assigneeId: userId },
            include: {
                column: true,
                taskLabels: { include: { label: true } }
            }
        });

        pubsub.publish(`TASK_UPDATED_${id}`, { taskUpdated: task });
        return task;
    },

    addComment: async (_: any, { input }: any, context: any) => {
        const comment = await prisma.comment.create({
            data: {
                ...input,
                userId: context.userId
            }
        });

        pubsub.publish(`COMMENT_ADDED_${input.taskId}`, { commentAdded: comment });
        return comment;
    },

    createSprint: async (_: any, { input }: any) => {
        return await prisma.sprint.create({
            data: {
                ...input,
                status: 'PLANNED'
            }
        });
    },

    startSprint: async (_: any, { id }: any) => {
        return await prisma.sprint.update({
            where: { id },
            data: { status: 'ACTIVE' }
        });
    },

    markNotificationRead: async (_: any, { id }: any) => {
        return await prisma.notification.update({
            where: { id },
            data: { read: true }
        });
    },

    markAllNotificationsRead: async (_: any, __: any, context: any) => {
        await prisma.notification.updateMany({
            where: { userId: context.userId, read: false },
            data: { read: true }
        });
        return true;
    }
};

// ==================== TYPE RESOLVERS ====================

const User = {
    boards: async (parent: any) => {
        return await prisma.board.findMany({
            where: {
                OR: [
                    { createdBy: parent.id },
                    { members: { some: { userId: parent.id } } }
                ]
            }
        });
    },

    assignedTasks: async (parent: any) => {
        return await prisma.task.findMany({
            where: { assigneeId: parent.id, status: { not: 'DONE' } }
        });
    },

    workload: async (parent: any) => {
        return await prisma.task.count({
            where: { assigneeId: parent.id, status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] } }
        });
    }
};

const Board = {
    columns: async (parent: any) => {
        return await prisma.column.findMany({
            where: { boardId: parent.id },
            orderBy: { order: 'asc' }
        });
    },

    tasks: async (parent: any) => {
        return await prisma.task.findMany({
            where: { boardId: parent.id }
        });
    },

    sprints: async (parent: any) => {
        return await prisma.sprint.findMany({
            where: { boardId: parent.id },
            orderBy: { startDate: 'desc' }
        });
    },

    labels: async (parent: any) => {
        return await prisma.label.findMany({
            where: { boardId: parent.id }
        });
    },

    members: async (parent: any) => {
        return await prisma.boardMember.findMany({
            where: { boardId: parent.id }
        });
    },

    activities: async (parent: any) => {
        return await prisma.activity.findMany({
            where: { boardId: parent.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    },

    activeSprint: async (parent: any) => {
        return await prisma.sprint.findFirst({
            where: { boardId: parent.id, status: 'ACTIVE' }
        });
    },

    tasksCount: async (parent: any) => {
        return await prisma.task.count({ where: { boardId: parent.id } });
    },

    completedTasksCount: async (parent: any) => {
        return await prisma.task.count({
            where: { boardId: parent.id, status: 'DONE' }
        });
    }
};

const Task = {
    board: async (parent: any, _: any, context: any) => {
        return await context.loaders.board.load(parent.boardId);
    },

    column: async (parent: any, _: any, context: any) => {
        return await context.loaders.column.load(parent.columnId);
    },

    sprint: async (parent: any) => {
        if (!parent.sprintId) return null;
        return await prisma.sprint.findUnique({ where: { id: parent.sprintId } });
    },

    parent: async (parent: any) => {
        if (!parent.parentId) return null;
        return await prisma.task.findUnique({ where: { id: parent.parentId } });
    },

    subtasks: async (parent: any) => {
        return await prisma.task.findMany({
            where: { parentId: parent.id }
        });
    },

    comments: async (parent: any) => {
        return await prisma.comment.findMany({
            where: { taskId: parent.id },
            orderBy: { createdAt: 'desc' }
        });
    },

    attachments: async (parent: any) => {
        return await prisma.attachment.findMany({
            where: { taskId: parent.id }
        });
    },

    timeEntries: async (parent: any) => {
        return await prisma.timeEntry.findMany({
            where: { taskId: parent.id },
            orderBy: { date: 'desc' }
        });
    },

    labels: async (parent: any) => {
        const taskLabels = await prisma.taskLabel.findMany({
            where: { taskId: parent.id },
            include: { label: true }
        });
        return taskLabels.map(tl => tl.label);
    },

    assignee: async (parent: any, _: any, context: any) => {
        if (!parent.assigneeId) return null;
        return await context.loaders.user.load(parent.assigneeId);
    },

    reporter: async (parent: any, _: any, context: any) => {
        return await context.loaders.user.load(parent.reporterId);
    },

    commentsCount: async (parent: any) => {
        return await prisma.comment.count({ where: { taskId: parent.id } });
    },

    attachmentsCount: async (parent: any) => {
        return await prisma.attachment.count({ where: { taskId: parent.id } });
    },

    subtasksCount: async (parent: any) => {
        return await prisma.task.count({ where: { parentId: parent.id } });
    },

    completedSubtasksCount: async (parent: any) => {
        return await prisma.task.count({
            where: { parentId: parent.id, status: 'DONE' }
        });
    },

    progress: async (parent: any) => {
        const total = await prisma.task.count({ where: { parentId: parent.id } });
        if (total === 0) return 0;

        const completed = await prisma.task.count({
            where: { parentId: parent.id, status: 'DONE' }
        });

        return (completed / total) * 100;
    },

    isOverdue: (parent: any) => {
        if (!parent.dueDate) return false;
        return new Date(parent.dueDate) < new Date() && parent.status !== 'DONE';
    }
};

const Sprint = {
    tasks: async (parent: any) => {
        return await prisma.task.findMany({
            where: { sprintId: parent.id }
        });
    },

    tasksCount: async (parent: any) => {
        return await prisma.task.count({ where: { sprintId: parent.id } });
    },

    completedTasksCount: async (parent: any) => {
        return await prisma.task.count({
            where: { sprintId: parent.id, status: 'DONE' }
        });
    },

    totalPoints: async (parent: any) => {
        const tasks = await prisma.task.findMany({
            where: { sprintId: parent.id },
            select: { points: true }
        });
        return tasks.reduce((sum, task) => sum + (task.points || 0), 0);
    }
};

// ==================== SUBSCRIPTION RESOLVERS ====================

const Subscription = {
    boardUpdated: {
        subscribe: (_: any, { boardId }: any) => {
            return pubsub.asyncIterator(`BOARD_UPDATED_${boardId}`);
        }
    },

    taskCreated: {
        subscribe: (_: any, { boardId }: any) => {
            return pubsub.asyncIterator(`TASK_CREATED_${boardId}`);
        }
    },

    taskUpdated: {
        subscribe: (_: any, { taskId }: any) => {
            return pubsub.asyncIterator(`TASK_UPDATED_${taskId}`);
        }
    },

    commentAdded: {
        subscribe: (_: any, { taskId }: any) => {
            return pubsub.asyncIterator(`COMMENT_ADDED_${taskId}`);
        }
    },

    notificationReceived: {
        subscribe: (_: any, __: any, context: any) => {
            return pubsub.asyncIterator(`NOTIFICATION_${context.userId}`);
        }
    }
};

// ==================== RESOLVERS EXPORT ====================

export const resolvers = {
    Query,
    Mutation,
    Subscription,
    User,
    Board,
    Task,
    Sprint,
    DateTime: DateTimeScalar,
    JSON: JSONScalar
};

export const createContext = (req: any) => ({
    userId: req.headers['x-user-id'] || '1',
    loaders: {
        user: createUserLoader(),
        board: createBoardLoader(),
        task: createTaskLoader(),
        column: createColumnLoader()
    },
    prisma,
    pubsub
});
