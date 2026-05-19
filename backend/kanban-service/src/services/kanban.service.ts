import { PrismaClient } from '@prisma/client';
import { createClient, RedisClientType } from 'redis';
import { Server as SocketServer } from 'socket.io';
import winston from 'winston';

const prisma = new PrismaClient();
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
let io: SocketServer | null = null;

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'kanban.log' })
    ]
});

export class KanbanService {
    // ==================== BOARD OPERATIONS ====================

    async createBoard(data: {
        name: string;
        description?: string;
        projectId: string;
        workspaceId: string;
        createdBy: string;
        visibility?: 'PRIVATE' | 'TEAM' | 'PUBLIC';
    }) {
        const slug = data.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

        const board = await prisma.board.create({
            data: {
                ...data,
                slug,
                columns: {
                    create: [
                        { name: 'To Do', order: 1, color: '#808080', isDefault: true },
                        { name: 'In Progress', order: 2, color: '#3B82F6' },
                        { name: 'Review', order: 3, color: '#F59E0B' },
                        { name: 'Done', order: 4, color: '#10B981' }
                    ]
                }
            },
            include: {
                columns: true,
                members: true
            }
        });

        await this.logActivity({
            boardId: board.id,
            userId: data.createdBy,
            action: 'BOARD_CREATED',
            metadata: { boardName: board.name }
        });

        logger.info(`Board created: ${board.id}`);
        return board;
    }

    async getBoard(id: string, userId: string) {
        const board = await prisma.board.findUnique({
            where: { id },
            include: {
                columns: { orderBy: { order: 'asc' } },
                members: true,
                labels: true,
                sprints: {
                    where: { status: 'ACTIVE' },
                    orderBy: { startDate: 'desc' }
                }
            }
        });

        if (!board) throw new Error('Board not found');

        // Check access
        await this.checkBoardAccess(id, userId);

        return board;
    }

    async updateBoard(id: string, data: Partial<{ name: string; description: string; visibility: string }>) {
        return await prisma.board.update({
            where: { id },
            data,
            include: { columns: true }
        });
    }

    async deleteBoard(id: string) {
        return await prisma.board.delete({ where: { id } });
    }

    async getBoardsByWorkspace(workspaceId: string, userId: string) {
        return await prisma.board.findMany({
            where: {
                workspaceId,
                OR: [
                    { createdBy: userId },
                    { members: { some: { userId } } },
                    { visibility: 'PUBLIC' }
                ]
            },
            include: {
                columns: true,
                members: true,
                _count: {
                    select: { tasks: true, sprints: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    // ==================== COLUMN OPERATIONS ====================

    async createColumn(boardId: string, data: { name: string; color?: string; limit?: number }) {
        const maxOrder = await prisma.column.findFirst({
            where: { boardId },
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        return await prisma.column.create({
            data: {
                ...data,
                boardId,
                order: (maxOrder?.order || 0) + 1
            }
        });
    }

    async updateColumn(id: string, data: Partial<{ name: string; color: string; limit: number }>) {
        return await prisma.column.update({
            where: { id },
            data
        });
    }

    async deleteColumn(id: string) {
        // Move all tasks to first column
        const column = await prisma.column.findUnique({ where: { id }, select: { boardId: true } });
        if (!column) throw new Error('Column not found');

        const firstColumn = await prisma.column.findFirst({
            where: { boardId: column.boardId },
            orderBy: { order: 'asc' }
        });

        if (firstColumn && firstColumn.id !== id) {
            await prisma.task.updateMany({
                where: { columnId: id },
                data: { columnId: firstColumn.id }
            });
        }

        return await prisma.column.delete({ where: { id } });
    }

    async reorderColumns(boardId: string, columnOrders: { id: string; order: number }[]) {
        const updates = columnOrders.map(({ id, order }) =>
            prisma.column.update({
                where: { id },
                data: { order }
            })
        );

        return await prisma.$transaction(updates);
    }

    // ==================== TASK OPERATIONS ====================

    async createTask(data: {
        boardId: string;
        columnId: string;
        title: string;
        description?: string;
        type?: 'TASK' | 'BUG' | 'STORY' | 'EPIC' | 'SUBTASK';
        priority?: 'LOWEST' | 'LOW' | 'MEDIUM' | 'HIGH' | 'HIGHEST';
        assigneeId?: string;
        reporterId: string;
        sprintId?: string;
        points?: number;
        dueDate?: Date;
        parentId?: string;
        epicId?: string;
        tags?: string[];
    }) {
        // Generate task key
        const board = await prisma.board.findUnique({
            where: { id: data.boardId },
            select: { slug: true }
        });

        const taskCount = await prisma.task.count({ where: { boardId: data.boardId } });
        const key = `${board?.slug.split('-')[0].toUpperCase()}-${taskCount + 1}`;

        // Get max order in column
        const maxOrder = await prisma.task.findFirst({
            where: { columnId: data.columnId },
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        const task = await prisma.task.create({
            data: {
                ...data,
                key,
                order: (maxOrder?.order || 0) + 1,
                status: 'TODO'
            },
            include: {
                column: true,
                taskLabels: { include: { label: true } },
                subtasks: true
            }
        });

        await this.logActivity({
            boardId: data.boardId,
            taskId: task.id,
            userId: data.reporterId,
            action: 'TASK_CREATED',
            metadata: { taskKey: task.key, title: task.title }
        });

        // Emit real-time update
        this.emitBoardUpdate(data.boardId, 'task:created', task);

        logger.info(`Task created: ${task.key}`);
        return task;
    }

    async getTask(id: string) {
        return await prisma.task.findUnique({
            where: { id },
            include: {
                column: true,
                sprint: true,
                epic: true,
                parent: true,
                subtasks: {
                    include: {
                        column: true,
                        taskLabels: { include: { label: true } }
                    }
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    take: 50
                },
                attachments: true,
                timeEntries: {
                    orderBy: { date: 'desc' }
                },
                taskLabels: {
                    include: { label: true }
                },
                watchers: true,
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });
    }

    async updateTask(id: string, data: Partial<{
        title: string;
        description: string;
        type: string;
        priority: string;
        points: number;
        estimatedHours: number;
        assigneeId: string;
        dueDate: Date;
        tags: string[];
        customFields: any;
    }>, userId: string) {
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) throw new Error('Task not found');

        const updated = await prisma.task.update({
            where: { id },
            data,
            include: {
                column: true,
                taskLabels: { include: { label: true } }
            }
        });

        // Log field changes
        for (const [field, newValue] of Object.entries(data)) {
            await this.logActivity({
                boardId: task.boardId,
                taskId: id,
                userId,
                action: 'TASK_UPDATED',
                field,
                oldValue: String(task[field as keyof typeof task]),
                newValue: String(newValue)
            });
        }

        this.emitBoardUpdate(task.boardId, 'task:updated', updated);
        return updated;
    }

    async moveTask(taskId: string, newColumnId: string, newOrder: number, userId: string) {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) throw new Error('Task not found');

        const oldColumn = await prisma.column.findUnique({ where: { id: task.columnId } });
        const newColumn = await prisma.column.findUnique({ where: { id: newColumnId } });

        // Update task
        const updated = await prisma.task.update({
            where: { id: taskId },
            data: {
                columnId: newColumnId,
                order: newOrder,
                status: newColumnId !== task.columnId ? this.getStatusFromColumn(newColumn?.name) : task.status
            },
            include: {
                column: true,
                taskLabels: { include: { label: true } }
            }
        });

        // Reorder other tasks
        await this.reorderTasksInColumn(newColumnId, taskId, newOrder);

        await this.logActivity({
            boardId: task.boardId,
            taskId,
            userId,
            action: 'TASK_MOVED',
            field: 'column',
            oldValue: oldColumn?.name,
            newValue: newColumn?.name
        });

        this.emitBoardUpdate(task.boardId, 'task:moved', updated);
        return updated;
    }

    async deleteTask(id: string, userId: string) {
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) throw new Error('Task not found');

        await prisma.task.delete({ where: { id } });

        await this.logActivity({
            boardId: task.boardId,
            userId,
            action: 'TASK_DELETED',
            metadata: { taskKey: task.key, title: task.title }
        });

        this.emitBoardUpdate(task.boardId, 'task:deleted', { id });
        logger.info(`Task deleted: ${task.key}`);
    }

    async getTasksByBoard(boardId: string, filters?: {
        columnId?: string;
        sprintId?: string;
        assigneeId?: string;
        type?: string;
        priority?: string;
        search?: string;
    }) {
        const where: any = { boardId };

        if (filters?.columnId) where.columnId = filters.columnId;
        if (filters?.sprintId) where.sprintId = filters.sprintId;
        if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
        if (filters?.type) where.type = filters.type;
        if (filters?.priority) where.priority = filters.priority;
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { key: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        return await prisma.task.findMany({
            where,
            include: {
                column: true,
                taskLabels: { include: { label: true } },
                subtasks: true,
                _count: {
                    select: { comments: true, attachments: true }
                }
            },
            orderBy: [
                { order: 'asc' }
            ]
        });
    }

    // ==================== SPRINT OPERATIONS ====================

    async createSprint(data: {
        boardId: string;
        name: string;
        goal?: string;
        startDate: Date;
        endDate: Date;
    }) {
        return await prisma.sprint.create({
            data: {
                ...data,
                status: 'PLANNED'
            }
        });
    }

    async getSprint(id: string) {
        return await prisma.sprint.findUnique({
            where: { id },
            include: {
                tasks: {
                    include: {
                        column: true,
                        taskLabels: { include: { label: true } }
                    }
                }
            }
        });
    }

    async updateSprint(id: string, data: Partial<{ name: string; goal: string; startDate: Date; endDate: Date }>) {
        return await prisma.sprint.update({
            where: { id },
            data
        });
    }

    async startSprint(id: string, userId: string) {
        const sprint = await prisma.sprint.update({
            where: { id },
            data: { status: 'ACTIVE' }
        });

        await this.logActivity({
            boardId: sprint.boardId,
            userId,
            action: 'SPRINT_STARTED',
            metadata: { sprintName: sprint.name }
        });

        return sprint;
    }

    async completeSprint(id: string, userId: string) {
        const sprint = await prisma.sprint.findUnique({
            where: { id },
            include: {
                tasks: { where: { status: 'DONE' } }
            }
        });

        if (!sprint) throw new Error('Sprint not found');

        const completedPoints = sprint.tasks.reduce((sum, task) => sum + (task.points || 0), 0);

        const updated = await prisma.sprint.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completedPoints,
                velocity: completedPoints
            }
        });

        await this.logActivity({
            boardId: sprint.boardId,
            userId,
            action: 'SPRINT_COMPLETED',
            metadata: { sprintName: sprint.name, completedPoints }
        });

        return updated;
    }

    async getSprintsByBoard(boardId: string) {
        return await prisma.sprint.findMany({
            where: { boardId },
            include: {
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: { startDate: 'desc' }
        });
    }

    async addTaskToSprint(taskId: string, sprintId: string) {
        return await prisma.task.update({
            where: { id: taskId },
            data: { sprintId }
        });
    }

    async removeTaskFromSprint(taskId: string) {
        return await prisma.task.update({
            where: { id: taskId },
            data: { sprintId: null }
        });
    }

    // ==================== LABEL OPERATIONS ====================

    async createLabel(boardId: string, data: { name: string; color: string; description?: string }) {
        return await prisma.label.create({
            data: {
                ...data,
                boardId
            }
        });
    }

    async updateLabel(id: string, data: Partial<{ name: string; color: string; description: string }>) {
        return await prisma.label.update({
            where: { id },
            data
        });
    }

    async deleteLabel(id: string) {
        return await prisma.label.delete({ where: { id } });
    }

    async getLabelsByBoard(boardId: string) {
        return await prisma.label.findMany({
            where: { boardId },
            include: {
                _count: {
                    select: { taskLabels: true }
                }
            }
        });
    }

    async addLabelToTask(taskId: string, labelId: string) {
        return await prisma.taskLabel.create({
            data: { taskId, labelId }
        });
    }

    async removeLabelFromTask(taskId: string, labelId: string) {
        return await prisma.taskLabel.deleteMany({
            where: { taskId, labelId }
        });
    }

    // ==================== COMMENT OPERATIONS ====================

    async addComment(data: {
        taskId: string;
        userId: string;
        content: string;
        mentions?: string[];
    }) {
        const comment = await prisma.comment.create({
            data
        });

        const task = await prisma.task.findUnique({ where: { id: data.taskId } });

        await this.logActivity({
            boardId: task!.boardId,
            taskId: data.taskId,
            userId: data.userId,
            action: 'COMMENT_ADDED',
            metadata: { commentPreview: data.content.slice(0, 50) }
        });

        this.emitBoardUpdate(task!.boardId, 'comment:added', comment);
        return comment;
    }

    async updateComment(id: string, content: string) {
        return await prisma.comment.update({
            where: { id },
            data: { content, isEdited: true }
        });
    }

    async deleteComment(id: string) {
        return await prisma.comment.delete({ where: { id } });
    }

    // ==================== ATTACHMENT OPERATIONS ====================

    async addAttachment(data: {
        taskId: string;
        userId: string;
        filename: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
    }) {
        const attachment = await prisma.attachment.create({ data });

        const task = await prisma.task.findUnique({ where: { id: data.taskId } });

        await this.logActivity({
            boardId: task!.boardId,
            taskId: data.taskId,
            userId: data.userId,
            action: 'ATTACHMENT_ADDED',
            metadata: { filename: data.filename }
        });

        return attachment;
    }

    async deleteAttachment(id: string) {
        return await prisma.attachment.delete({ where: { id } });
    }

    // ==================== TIME TRACKING ====================

    async logTime(data: {
        taskId: string;
        userId: string;
        hours: float;
        description?: string;
        date: Date;
    }) {
        const entry = await prisma.timeEntry.create({ data });

        // Update task actual hours
        const totalHours = await prisma.timeEntry.aggregate({
            where: { taskId: data.taskId },
            _sum: { hours: true }
        });

        await prisma.task.update({
            where: { id: data.taskId },
            data: { actualHours: totalHours._sum.hours || 0 }
        });

        return entry;
    }

    async getTimeEntries(taskId: string) {
        return await prisma.timeEntry.findMany({
            where: { taskId },
            orderBy: { date: 'desc' }
        });
    }

    async getTimeEntriesByUser(userId: string, startDate: Date, endDate: Date) {
        return await prisma.timeEntry.findMany({
            where: {
                userId,
                date: { gte: startDate, lte: endDate }
            },
            include: {
                task: {
                    select: { key: true, title: true, boardId: true }
                }
            },
            orderBy: { date: 'desc' }
        });
    }

    // ==================== BOARD MEMBERS ====================

    async addBoardMember(boardId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' = 'MEMBER') {
        return await prisma.boardMember.create({
            data: { boardId, userId, role }
        });
    }

    async updateBoardMemberRole(boardId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER') {
        return await prisma.boardMember.update({
            where: { boardId_userId: { boardId, userId } },
            data: { role }
        });
    }

    async removeBoardMember(boardId: string, userId: string) {
        return await prisma.boardMember.delete({
            where: { boardId_userId: { boardId, userId } }
        });
    }

    // ==================== ANALYTICS ====================

    async getBoardAnalytics(boardId: string) {
        const [totalTasks, completedTasks, tasksInProgress, tasksByColumn, tasksByPriority] = await Promise.all([
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
            })
        ]);

        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
            totalTasks,
            completedTasks,
            tasksInProgress,
            completionRate,
            tasksByColumn,
            tasksByPriority
        };
    }

    async getSprintVelocity(boardId: string, limit: number = 5) {
        const sprints = await prisma.sprint.findMany({
            where: {
                boardId,
                status: 'COMPLETED'
            },
            orderBy: { endDate: 'desc' },
            take: limit,
            select: {
                name: true,
                completedPoints: true,
                velocity: true,
                startDate: true,
                endDate: true
            }
        });

        const avgVelocity = sprints.length > 0
            ? sprints.reduce((sum, s) => sum + (s.velocity || 0), 0) / sprints.length
            : 0;

        return { sprints, avgVelocity };
    }

    async getBurndownChart(sprintId: string) {
        const sprint = await prisma.sprint.findUnique({
            where: { id: sprintId },
            include: {
                tasks: {
                    select: {
                        points: true,
                        completedAt: true
                    }
                }
            }
        });

        if (!sprint) throw new Error('Sprint not found');

        const totalPoints = sprint.tasks.reduce((sum, t) => sum + (t.points || 0), 0);
        const days: { date: string; remainingPoints: number }[] = [];

        // Calculate remaining points per day
        // Implementation would track daily progress

        return { totalPoints, days };
    }

    // ==================== HELPER METHODS ====================

    private async checkBoardAccess(boardId: string, userId: string) {
        const board = await prisma.board.findUnique({
            where: { id: boardId },
            include: { members: { where: { userId } } }
        });

        if (!board) throw new Error('Board not found');

        if (board.visibility === 'PRIVATE' && board.createdBy !== userId && board.members.length === 0) {
            throw new Error('Access denied');
        }
    }

    private async reorderTasksInColumn(columnId: string, movedTaskId: string, newOrder: number) {
        const tasks = await prisma.task.findMany({
            where: { columnId },
            orderBy: { order: 'asc' }
        });

        const updates = tasks
            .filter(t => t.id !== movedTaskId)
            .map((task, index) => {
                const order = index >= newOrder ? index + 1 : index;
                return prisma.task.update({
                    where: { id: task.id },
                    data: { order }
                });
            });

        await prisma.$transaction(updates);
    }

    private getStatusFromColumn(columnName?: string): TaskStatus {
        if (!columnName) return 'TODO';

        const lower = columnName.toLowerCase();
        if (lower.includes('progress')) return 'IN_PROGRESS';
        if (lower.includes('review')) return 'IN_REVIEW';
        if (lower.includes('test')) return 'TESTING';
        if (lower.includes('done') || lower.includes('complete')) return 'DONE';
        if (lower.includes('block')) return 'BLOCKED';
        return 'TODO';
    }

    private async logActivity(data: {
        boardId?: string;
        taskId?: string;
        userId: string;
        action: string;
        field?: string;
        oldValue?: string;
        newValue?: string;
        metadata?: any;
    }) {
        return await prisma.activity.create({ data: data as any });
    }

    private emitBoardUpdate(boardId: string, event: string, data: any) {
        if (io) {
            io.to(`board:${boardId}`).emit(event, data);
        }
    }

    public setSocketServer(socketServer: SocketServer) {
        io = socketServer;
    }
}

export default new KanbanService();
