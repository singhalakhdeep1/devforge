// GraphQL Subscriptions resolvers for devforge

import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const resolvers = {
  Subscription: {
    documentUpdated: {
      subscribe: (_: any, { documentId }: { documentId: string }) => {
        return pubsub.asyncIterator(`DOCUMENT_UPDATED_${documentId}`);
      },
    },
    documentCreated: {
      subscribe: (_: any, { userId }: { userId: string }) => {
        return pubsub.asyncIterator(`DOCUMENT_CREATED_${userId}`);
      },
    },
    cardAdded: {
      subscribe: (_: any, { boardId }: { boardId: string }) => {
        return pubsub.asyncIterator(`CARD_ADDED_${boardId}`);
      },
    },
    cardUpdated: {
      subscribe: (_: any, { cardId }: { cardId: string }) => {
        return pubsub.asyncIterator(`CARD_UPDATED_${cardId}`);
      },
    },
    cardDeleted: {
      subscribe: (_: any, { cardId }: { cardId: string }) => {
        return pubsub.asyncIterator(`CARD_DELETED_${cardId}`);
      },
    },
    notificationReceived: {
      subscribe: (_: any, { userId }: { userId: string }) => {
        return pubsub.asyncIterator(`NOTIFICATION_${userId}`);
      },
    },
    analyticsUpdated: {
      subscribe: (_: any, { userId }: { userId: string }) => {
        return pubsub.asyncIterator(`ANALYTICS_${userId}`);
      },
    },
    userOnline: {
      subscribe: (_: any, { userId }: { userId: string }) => {
        return pubsub.asyncIterator(`USER_ONLINE_${userId}`);
      },
    },
    userOffline: {
      subscribe: (_: any, { userId }: { userId: string }) => {
        return pubsub.asyncIterator(`USER_OFFLINE_${userId}`);
      },
    },
  },
};

// Helper functions to publish events
export const publishDocumentUpdate = (documentId: string, update: any) => {
  pubsub.publish(`DOCUMENT_UPDATED_${documentId}`, { documentUpdated: update });
};

export const publishDocumentCreated = (userId: string, document: any) => {
  pubsub.publish(`DOCUMENT_CREATED_${userId}`, { documentCreated: document });
};

export const publishCardAdded = (boardId: string, card: any) => {
  pubsub.publish(`CARD_ADDED_${boardId}`, { cardAdded: card });
};

export const publishCardUpdated = (cardId: string, card: any) => {
  pubsub.publish(`CARD_UPDATED_${cardId}`, { cardUpdated: card });
};

export const publishCardDeleted = (cardId: string) => {
  pubsub.publish(`CARD_DELETED_${cardId}`, { cardDeleted: cardId });
};

export const publishNotification = (userId: string, notification: any) => {
  pubsub.publish(`NOTIFICATION_${userId}`, { notificationReceived: notification });
};

export const publishAnalyticsUpdate = (userId: string, analytics: any) => {
  pubsub.publish(`ANALYTICS_${userId}`, { analyticsUpdated: analytics });
};

export const publishUserOnline = (userId: string, presence: any) => {
  pubsub.publish(`USER_ONLINE_${userId}`, { userOnline: presence });
};

export const publishUserOffline = (userId: string, presence: any) => {
  pubsub.publish(`USER_OFFLINE_${userId}`, { userOffline: presence });
};
