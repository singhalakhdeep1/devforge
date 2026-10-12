// tRPC router for devforge

import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const appRouter = t.router({
  // Analytics
  getAnalytics: t.procedure
    .input(z.object({ userId: z.string(), dateRange: z.object({ start: z.string(), end: z.string() }) }))
    .query(({ input }) => {
      return {
        userId: input.userId,
        pageViews: 1250,
        uniqueVisitors: 450,
        bounceRate: 0.35,
        avgSessionDuration: 180,
      };
    }),

  // Editor
  saveDocument: t.procedure
    .input(z.object({ documentId: z.string(), content: z.string(), title: z.string() }))
    .mutation(({ input }) => {
      return { success: true, documentId: input.documentId, savedAt: new Date().toISOString() };
    }),

  getDocument: t.procedure
    .input(z.object({ documentId: z.string() }))
    .query(({ input }) => {
      return {
        documentId: input.documentId,
        title: 'Sample Document',
        content: 'Document content here...',
        updatedAt: new Date().toISOString(),
      };
    }),

  // Kanban
  getBoard: t.procedure
    .input(z.object({ boardId: z.string() }))
    .query(({ input }) => {
      return {
        boardId: input.boardId,
        name: 'Project Board',
        columns: [
          { id: '1', name: 'To Do', cards: [] },
          { id: '2', name: 'In Progress', cards: [] },
          { id: '3', name: 'Done', cards: [] },
        ],
      };
    }),

  createCard: t.procedure
    .input(z.object({ columnId: z.string(), title: z.string(), description: z.string() }))
    .mutation(({ input }) => {
      return { success: true, cardId: 'new-card-id', columnId: input.columnId };
    }),

  // Auth
  login: t.procedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(({ input }) => {
      return { success: true, token: 'jwt-token-here', user: { id: '1', email: input.email } };
    }),

  register: t.procedure
    .input(z.object({ email: z.string().email(), password: z.string(), name: z.string() }))
    .mutation(({ input }) => {
      return { success: true, userId: '1', email: input.email, name: input.name };
    }),

  // Notifications
  getNotifications: t.procedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      return {
        userId: input.userId,
        notifications: [
          { id: '1', message: 'Document updated', read: false },
          { id: '2', message: 'New comment', read: true },
        ],
      };
    }),
});

export type AppRouter = typeof appRouter;
