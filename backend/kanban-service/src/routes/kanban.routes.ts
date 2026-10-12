import { Router } from 'express';
import kanbanService from '../services/kanban.service';
import { z } from 'zod';

const router = Router();

// ==================== VALIDATION SCHEMAS ====================

const createBoardSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    projectId: z.string().uuid(),
    workspaceId: z.string().uuid(),
    visibility: z.enum(['PRIVATE', 'TEAM', 'PUBLIC']).optional()
});

const createTaskSchema = z.object({
    boardId: z.string().uuid(),
    columnId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    type: z.enum(['TASK', 'BUG', 'STORY', 'EPIC', 'SUBTASK']).optional(),
    priority: z.enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST']).optional(),
    assigneeId: z.string().uuid().optional(),
    sprintId: z.string().uuid().optional(),
    points: z.number().int().min(0).max(100).optional(),
    dueDate: z.string().datetime().optional(),
    parentId: z.string().uuid().optional(),
    epicId: z.string().uuid().optional(),
    tags: z.array(z.string()).optional()
});

const createSprintSchema = z.object({
    boardId: z.string().uuid(),
    name: z.string().min(1).max(100),
    goal: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
});

// ==================== BOARD ROUTES ====================

// Create board
router.post('/boards', async (req, res) => {
    try {
        const data = createBoardSchema.parse(req.body);
        const userId = req.headers['x-user-id'] as string;

        const board = await kanbanService.createBoard({
            ...data,
            createdBy: userId
        });

        res.status(201).json(board);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get board
router.get('/boards/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const board = await kanbanService.getBoard(req.params.id, userId);
        res.json(board);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
});

// Update board
router.patch('/boards/:id', async (req, res) => {
    try {
        const board = await kanbanService.updateBoard(req.params.id, req.body);
        res.json(board);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Delete board
router.delete('/boards/:id', async (req, res) => {
    try {
        await kanbanService.deleteBoard(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get boards by workspace
router.get('/workspaces/:workspaceId/boards', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const boards = await kanbanService.getBoardsByWorkspace(req.params.workspaceId, userId);
        res.json(boards);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get board analytics
router.get('/boards/:id/analytics', async (req, res) => {
    try {
        const analytics = await kanbanService.getBoardAnalytics(req.params.id);
        res.json(analytics);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== COLUMN ROUTES ====================

// Create column
router.post('/columns', async (req, res) => {
    try {
        const { boardId, name, color, limit } = req.body;
        const column = await kanbanService.createColumn(boardId, { name, color, limit });
        res.status(201).json(column);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Update column
router.patch('/columns/:id', async (req, res) => {
    try {
        const column = await kanbanService.updateColumn(req.params.id, req.body);
        res.json(column);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Delete column
router.delete('/columns/:id', async (req, res) => {
    try {
        await kanbanService.deleteColumn(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Reorder columns
router.post('/boards/:boardId/columns/reorder', async (req, res) => {
    try {
        const { columnOrders } = req.body;
        await kanbanService.reorderColumns(req.params.boardId, columnOrders);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== TASK ROUTES ====================

// Create task
router.post('/tasks', async (req, res) => {
    try {
        const data = createTaskSchema.parse(req.body);
        const userId = req.headers['x-user-id'] as string;

        const task = await kanbanService.createTask({
            ...data,
            reporterId: userId,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined
        });

        res.status(201).json(task);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get task
router.get('/tasks/:id', async (req, res) => {
    try {
        const task = await kanbanService.getTask(req.params.id);
        res.json(task);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
});

// Update task
router.patch('/tasks/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const task = await kanbanService.updateTask(req.params.id, req.body, userId);
        res.json(task);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Move task
router.post('/tasks/:id/move', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { columnId, order } = req.body;
        const task = await kanbanService.moveTask(req.params.id, columnId, order, userId);
        res.json(task);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Delete task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        await kanbanService.deleteTask(req.params.id, userId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get tasks by board
router.get('/boards/:boardId/tasks', async (req, res) => {
    try {
        const filters = {
            columnId: req.query.columnId as string,
            sprintId: req.query.sprintId as string,
            assigneeId: req.query.assigneeId as string,
            type: req.query.type as string,
            priority: req.query.priority as string,
            search: req.query.search as string
        };

        const tasks = await kanbanService.getTasksByBoard(req.params.boardId, filters);
        res.json(tasks);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== SPRINT ROUTES ====================

// Create sprint
router.post('/sprints', async (req, res) => {
    try {
        const data = createSprintSchema.parse(req.body);
        const sprint = await kanbanService.createSprint({
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate)
        });
        res.status(201).json(sprint);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get sprint
router.get('/sprints/:id', async (req, res) => {
    try {
        const sprint = await kanbanService.getSprint(req.params.id);
        res.json(sprint);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
});

// Update sprint
router.patch('/sprints/:id', async (req, res) => {
    try {
        const sprint = await kanbanService.updateSprint(req.params.id, req.body);
        res.json(sprint);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Start sprint
router.post('/sprints/:id/start', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const sprint = await kanbanService.startSprint(req.params.id, userId);
        res.json(sprint);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Complete sprint
router.post('/sprints/:id/complete', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const sprint = await kanbanService.completeSprint(req.params.id, userId);
        res.json(sprint);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get sprints by board
router.get('/boards/:boardId/sprints', async (req, res) => {
    try {
        const sprints = await kanbanService.getSprintsByBoard(req.params.boardId);
        res.json(sprints);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Add task to sprint
router.post('/sprints/:sprintId/tasks/:taskId', async (req, res) => {
    try {
        await kanbanService.addTaskToSprint(req.params.taskId, req.params.sprintId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Remove task from sprint
router.delete('/sprints/:sprintId/tasks/:taskId', async (req, res) => {
    try {
        await kanbanService.removeTaskFromSprint(req.params.taskId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get sprint velocity
router.get('/boards/:boardId/velocity', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 5;
        const velocity = await kanbanService.getSprintVelocity(req.params.boardId, limit);
        res.json(velocity);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get burndown chart
router.get('/sprints/:id/burndown', async (req, res) => {
    try {
        const burndown = await kanbanService.getBurndownChart(req.params.id);
        res.json(burndown);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== LABEL ROUTES ====================

// Create label
router.post('/labels', async (req, res) => {
    try {
        const { boardId, name, color, description } = req.body;
        const label = await kanbanService.createLabel(boardId, { name, color, description });
        res.status(201).json(label);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Update label
router.patch('/labels/:id', async (req, res) => {
    try {
        const label = await kanbanService.updateLabel(req.params.id, req.body);
        res.json(label);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Delete label
router.delete('/labels/:id', async (req, res) => {
    try {
        await kanbanService.deleteLabel(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get labels by board
router.get('/boards/:boardId/labels', async (req, res) => {
    try {
        const labels = await kanbanService.getLabelsByBoard(req.params.boardId);
        res.json(labels);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Add label to task
router.post('/tasks/:taskId/labels/:labelId', async (req, res) => {
    try {
        await kanbanService.addLabelToTask(req.params.taskId, req.params.labelId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Remove label from task
router.delete('/tasks/:taskId/labels/:labelId', async (req, res) => {
    try {
        await kanbanService.removeLabelFromTask(req.params.taskId, req.params.labelId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== COMMENT ROUTES ====================

// Add comment
router.post('/comments', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { taskId, content, mentions } = req.body;
        const comment = await kanbanService.addComment({ taskId, userId, content, mentions });
        res.status(201).json(comment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Update comment
router.patch('/comments/:id', async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await kanbanService.updateComment(req.params.id, content);
        res.json(comment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Delete comment
router.delete('/comments/:id', async (req, res) => {
    try {
        await kanbanService.deleteComment(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== ATTACHMENT ROUTES ====================

// Add attachment
router.post('/attachments', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const attachment = await kanbanService.addAttachment({ ...req.body, userId });
        res.status(201).json(attachment);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Delete attachment
router.delete('/attachments/:id', async (req, res) => {
    try {
        await kanbanService.deleteAttachment(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== TIME TRACKING ROUTES ====================

// Log time
router.post('/time-entries', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { taskId, hours, description, date } = req.body;
        const entry = await kanbanService.logTime({
            taskId,
            userId,
            hours: parseFloat(hours),
            description,
            date: new Date(date)
        });
        res.status(201).json(entry);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get time entries for task
router.get('/tasks/:taskId/time-entries', async (req, res) => {
    try {
        const entries = await kanbanService.getTimeEntries(req.params.taskId);
        res.json(entries);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get time entries by user
router.get('/users/:userId/time-entries', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const entries = await kanbanService.getTimeEntriesByUser(
            req.params.userId,
            new Date(startDate as string),
            new Date(endDate as string)
        );
        res.json(entries);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== BOARD MEMBER ROUTES ====================

// Add board member
router.post('/boards/:boardId/members', async (req, res) => {
    try {
        const { userId, role } = req.body;
        const member = await kanbanService.addBoardMember(req.params.boardId, userId, role);
        res.status(201).json(member);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Update member role
router.patch('/boards/:boardId/members/:userId', async (req, res) => {
    try {
        const { role } = req.body;
        const member = await kanbanService.updateBoardMemberRole(req.params.boardId, req.params.userId, role);
        res.json(member);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Remove board member
router.delete('/boards/:boardId/members/:userId', async (req, res) => {
    try {
        await kanbanService.removeBoardMember(req.params.boardId, req.params.userId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
