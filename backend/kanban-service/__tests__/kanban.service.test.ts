import { PrismaClient } from '@prisma/client';
import kanbanService from '../src/services/kanban.service';

const prisma = new PrismaClient();

describe('Kanban Service Tests', () => {
    let testBoardId: string;
    let testColumnId: string;
    let testTaskId: string;
    let testUserId: string;
    let testWorkspaceId: string;
    let testProjectId: string;

    beforeAll(async () => {
        await prisma.$connect();
        testUserId = 'test-user-123';
        testWorkspaceId = 'test-workspace-123';
        testProjectId = 'test-project-123';
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.activity.deleteMany();
        await prisma.taskLabel.deleteMany();
        await prisma.comment.deleteMany();
        await prisma.attachment.deleteMany();
        await prisma.timeEntry.deleteMany();
        await prisma.task.deleteMany();
        await prisma.sprint.deleteMany();
        await prisma.epic.deleteMany();
        await prisma.label.deleteMany();
        await prisma.boardMember.deleteMany();
        await prisma.column.deleteMany();
        await prisma.board.deleteMany();
    });

    describe('Board Operations', () => {
        it('should create a new board', async () => {
            const boardData = {
                name: 'Test Board',
                description: 'A test board',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            };

            const board = await kanbanService.createBoard(boardData);

            expect(board).toHaveProperty('id');
            expect(board.name).toBe(boardData.name);
            expect(board.columns).toHaveLength(4); // Default columns
            testBoardId = board.id;
        });

        it('should create default columns for new board', async () => {
            const board = await kanbanService.createBoard({
                name: 'Board with Columns',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });

            const columns = await prisma.column.findMany({
                where: { boardId: board.id },
                orderBy: { order: 'asc' }
            });

            expect(columns).toHaveLength(4);
            expect(columns[0].name).toBe('To Do');
            expect(columns[1].name).toBe('In Progress');
            expect(columns[2].name).toBe('Review');
            expect(columns[3].name).toBe('Done');
        });

        it('should get board by id', async () => {
            const board = await kanbanService.createBoard({
                name: 'Get Board Test',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });

            const retrieved = await kanbanService.getBoard(board.id, testUserId);

            expect(retrieved).toHaveProperty('id', board.id);
            expect(retrieved.name).toBe(board.name);
        });

        it('should update board', async () => {
            const board = await kanbanService.createBoard({
                name: 'Original Name',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });

            const updated = await kanbanService.updateBoard(board.id, {
                name: 'Updated Name',
                description: 'Updated description'
            });

            expect(updated.name).toBe('Updated Name');
            expect(updated.description).toBe('Updated description');
        });

        it('should delete board', async () => {
            const board = await kanbanService.createBoard({
                name: 'To Delete',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });

            await kanbanService.deleteBoard(board.id);

            const deleted = await prisma.board.findUnique({
                where: { id: board.id }
            });

            expect(deleted).toBeNull();
        });

        it('should get boards by workspace', async () => {
            await kanbanService.createBoard({
                name: 'Workspace Board 1',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });

            await kanbanService.createBoard({
                name: 'Workspace Board 2',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });

            const boards = await kanbanService.getBoardsByWorkspace(testWorkspaceId, testUserId);

            expect(boards).toHaveLength(2);
        });
    });

    describe('Column Operations', () => {
        beforeEach(async () => {
            const board = await kanbanService.createBoard({
                name: 'Column Test Board',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });
            testBoardId = board.id;
            testColumnId = board.columns[0].id;
        });

        it('should create column', async () => {
            const column = await kanbanService.createColumn(testBoardId, {
                name: 'New Column',
                color: '#FF0000'
            });

            expect(column).toHaveProperty('id');
            expect(column.name).toBe('New Column');
            expect(column.color).toBe('#FF0000');
        });

        it('should update column', async () => {
            const updated = await kanbanService.updateColumn(testColumnId, {
                name: 'Updated Column',
                limit: 5
            });

            expect(updated.name).toBe('Updated Column');
            expect(updated.limit).toBe(5);
        });

        it('should delete column', async () => {
            const column = await kanbanService.createColumn(testBoardId, {
                name: 'To Delete'
            });

            await kanbanService.deleteColumn(column.id);

            const deleted = await prisma.column.findUnique({
                where: { id: column.id }
            });

            expect(deleted).toBeNull();
        });

        it('should reorder columns', async () => {
            const columns = await prisma.column.findMany({
                where: { boardId: testBoardId },
                orderBy: { order: 'asc' }
            });

            const newOrder = columns.reverse().map((col, index) => ({
                id: col.id,
                order: index + 1
            }));

            await kanbanService.reorderColumns(testBoardId, newOrder);

            const reordered = await prisma.column.findMany({
                where: { boardId: testBoardId },
                orderBy: { order: 'asc' }
            });

            expect(reordered[0].id).toBe(columns[0].id);
        });
    });

    describe('Task Operations', () => {
        beforeEach(async () => {
            const board = await kanbanService.createBoard({
                name: 'Task Test Board',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });
            testBoardId = board.id;
            testColumnId = board.columns[0].id;
        });

        it('should create task', async () => {
            const task = await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Test Task',
                description: 'Task description',
                reporterId: testUserId,
                priority: 'HIGH'
            });

            expect(task).toHaveProperty('id');
            expect(task.title).toBe('Test Task');
            expect(task.priority).toBe('HIGH');
            expect(task.key).toMatch(/^[A-Z]+-\d+$/);
            testTaskId = task.id;
        });

        it('should generate unique task key', async () => {
            const task1 = await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Task 1',
                reporterId: testUserId
            });

            const task2 = await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Task 2',
                reporterId: testUserId
            });

            expect(task1.key).not.toBe(task2.key);
        });

        it('should get task by id', async () => {
            const task = await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Get Task Test',
                reporterId: testUserId
            });

            const retrieved = await kanbanService.getTask(task.id);

            expect(retrieved).toHaveProperty('id', task.id);
            expect(retrieved!.title).toBe(task.title);
        });

        it('should update task', async () => {
            const task = await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Original Title',
                reporterId: testUserId
            });

            const updated = await kanbanService.updateTask(
                task.id,
                { title: 'Updated Title', priority: 'HIGHEST' },
                testUserId
            );

            expect(updated.title).toBe('Updated Title');
            expect(updated.priority).toBe('HIGHEST');
        });

        it('should move task to different column', async () => {
            const task = await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Move Task',
                reporterId: testUserId
            });

            const columns = await prisma.column.findMany({
                where: { boardId: testBoardId }
            });
            const newColumnId = columns[1].id;

            const moved = await kanbanService.moveTask(task.id, newColumnId, 1, testUserId);

            expect(moved.columnId).toBe(newColumnId);
        });

        it('should delete task', async () => {
            const task = await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'To Delete',
                reporterId: testUserId
            });

            await kanbanService.deleteTask(task.id, testUserId);

            const deleted = await prisma.task.findUnique({
                where: { id: task.id }
            });

            expect(deleted).toBeNull();
        });

        it('should filter tasks', async () => {
            await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'High Priority Task',
                reporterId: testUserId,
                priority: 'HIGH'
            });

            await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Low Priority Task',
                reporterId: testUserId,
                priority: 'LOW'
            });

            const highPriorityTasks = await kanbanService.getTasksByBoard(testBoardId, {
                priority: 'HIGH'
            });

            expect(highPriorityTasks).toHaveLength(1);
            expect(highPriorityTasks[0].priority).toBe('HIGH');
        });
    });

    describe('Sprint Operations', () => {
        beforeEach(async () => {
            const board = await kanbanService.createBoard({
                name: 'Sprint Test Board',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });
            testBoardId = board.id;
        });

        it('should create sprint', async () => {
            const sprint = await kanbanService.createSprint({
                boardId: testBoardId,
                name: 'Sprint 1',
                goal: 'Complete features',
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            });

            expect(sprint).toHaveProperty('id');
            expect(sprint.name).toBe('Sprint 1');
            expect(sprint.status).toBe('PLANNED');
        });

        it('should start sprint', async () => {
            const sprint = await kanbanService.createSprint({
                boardId: testBoardId,
                name: 'Sprint to Start',
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            });

            const started = await kanbanService.startSprint(sprint.id, testUserId);

            expect(started.status).toBe('ACTIVE');
        });

        it('should complete sprint', async () => {
            const sprint = await kanbanService.createSprint({
                boardId: testBoardId,
                name: 'Sprint to Complete',
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            });

            await kanbanService.startSprint(sprint.id, testUserId);
            const completed = await kanbanService.completeSprint(sprint.id, testUserId);

            expect(completed.status).toBe('COMPLETED');
        });

        it('should calculate sprint velocity', async () => {
            const sprint = await kanbanService.createSprint({
                boardId: testBoardId,
                name: 'Velocity Sprint',
                startDate: new Date(),
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            });

            const velocity = await kanbanService.getSprintVelocity(testBoardId, 5);

            expect(velocity).toHaveProperty('sprints');
            expect(velocity).toHaveProperty('avgVelocity');
        });
    });

    describe('Label Operations', () => {
        beforeEach(async () => {
            const board = await kanbanService.createBoard({
                name: 'Label Test Board',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });
            testBoardId = board.id;
        });

        it('should create label', async () => {
            const label = await kanbanService.createLabel(testBoardId, {
                name: 'Bug',
                color: '#FF0000',
                description: 'Bug label'
            });

            expect(label).toHaveProperty('id');
            expect(label.name).toBe('Bug');
            expect(label.color).toBe('#FF0000');
        });

        it('should get labels by board', async () => {
            await kanbanService.createLabel(testBoardId, {
                name: 'Feature',
                color: '#00FF00'
            });

            await kanbanService.createLabel(testBoardId, {
                name: 'Enhancement',
                color: '#0000FF'
            });

            const labels = await kanbanService.getLabelsByBoard(testBoardId);

            expect(labels).toHaveLength(2);
        });
    });

    describe('Comment Operations', () => {
        beforeEach(async () => {
            const board = await kanbanService.createBoard({
                name: 'Comment Test Board',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });
            testBoardId = board.id;
            testColumnId = board.columns[0].id;

            const task = await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Task with Comments',
                reporterId: testUserId
            });
            testTaskId = task.id;
        });

        it('should add comment', async () => {
            const comment = await kanbanService.addComment({
                taskId: testTaskId,
                userId: testUserId,
                content: 'Test comment'
            });

            expect(comment).toHaveProperty('id');
            expect(comment.content).toBe('Test comment');
        });

        it('should update comment', async () => {
            const comment = await kanbanService.addComment({
                taskId: testTaskId,
                userId: testUserId,
                content: 'Original content'
            });

            const updated = await kanbanService.updateComment(comment.id, 'Updated content');

            expect(updated.content).toBe('Updated content');
            expect(updated.isEdited).toBe(true);
        });

        it('should delete comment', async () => {
            const comment = await kanbanService.addComment({
                taskId: testTaskId,
                userId: testUserId,
                content: 'To delete'
            });

            await kanbanService.deleteComment(comment.id);

            const deleted = await prisma.comment.findUnique({
                where: { id: comment.id }
            });

            expect(deleted).toBeNull();
        });
    });

    describe('Time Tracking', () => {
        beforeEach(async () => {
            const board = await kanbanService.createBoard({
                name: 'Time Test Board',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });
            testBoardId = board.id;
            testColumnId = board.columns[0].id;

            const task = await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Task with Time',
                reporterId: testUserId
            });
            testTaskId = task.id;
        });

        it('should log time entry', async () => {
            const entry = await kanbanService.logTime({
                taskId: testTaskId,
                userId: testUserId,
                hours: 2.5,
                description: 'Working on feature',
                date: new Date()
            });

            expect(entry).toHaveProperty('id');
            expect(entry.hours).toBe(2.5);
        });

        it('should get time entries for task', async () => {
            await kanbanService.logTime({
                taskId: testTaskId,
                userId: testUserId,
                hours: 2,
                date: new Date()
            });

            await kanbanService.logTime({
                taskId: testTaskId,
                userId: testUserId,
                hours: 3,
                date: new Date()
            });

            const entries = await kanbanService.getTimeEntries(testTaskId);

            expect(entries).toHaveLength(2);
        });
    });

    describe('Board Analytics', () => {
        beforeEach(async () => {
            const board = await kanbanService.createBoard({
                name: 'Analytics Test Board',
                projectId: testProjectId,
                workspaceId: testWorkspaceId,
                createdBy: testUserId
            });
            testBoardId = board.id;
            testColumnId = board.columns[0].id;
        });

        it('should get board analytics', async () => {
            await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Task 1',
                reporterId: testUserId,
                priority: 'HIGH'
            });

            await kanbanService.createTask({
                boardId: testBoardId,
                columnId: testColumnId,
                title: 'Task 2',
                reporterId: testUserId,
                priority: 'LOW'
            });

            const analytics = await kanbanService.getBoardAnalytics(testBoardId);

            expect(analytics).toHaveProperty('totalTasks');
            expect(analytics).toHaveProperty('completedTasks');
            expect(analytics).toHaveProperty('completionRate');
            expect(analytics.totalTasks).toBe(2);
        });
    });
});
