// gRPC server for devforge

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = __dirname + '/devforge.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const devforgeProto = grpc.loadPackageDefinition(packageDefinition).devforge;

// Analytics service
const analyticsService = {
  GetAnalytics: (call, callback) => {
    const { userId, startDate, endDate } = call.request;
    callback(null, {
      userId,
      pageViews: 1250,
      uniqueVisitors: 450,
      bounceRate: 0.35,
      avgSessionDuration: 180,
    });
  },
};

// Editor service
const editorService = {
  SaveDocument: (call, callback) => {
    const { documentId, content, title } = call.request;
    callback(null, {
      success: true,
      documentId,
      savedAt: new Date().toISOString(),
    });
  },
  GetDocument: (call, callback) => {
    const { documentId } = call.request;
    callback(null, {
      documentId,
      title: 'Sample Document',
      content: 'Document content here...',
      updatedAt: new Date().toISOString(),
    });
  },
};

// Kanban service
const kanbanService = {
  GetBoard: (call, callback) => {
    const { boardId } = call.request;
    callback(null, {
      boardId,
      name: 'Project Board',
      columns: [
        { id: '1', name: 'To Do' },
        { id: '2', name: 'In Progress' },
        { id: '3', name: 'Done' },
      ],
    });
  },
  CreateCard: (call, callback) => {
    const { columnId, title, description } = call.request;
    callback(null, {
      success: true,
      cardId: 'new-card-id',
      columnId,
    });
  },
};

// Auth service
const authService = {
  Login: (call, callback) => {
    const { email, password } = call.request;
    callback(null, {
      success: true,
      token: 'jwt-token-here',
      user: { id: '1', email },
    });
  },
  Register: (call, callback) => {
    const { email, password, name } = call.request;
    callback(null, {
      success: true,
      userId: '1',
      email,
      name,
    });
  },
};

// Start gRPC server
const server = new grpc.Server();
server.addService(devforgeProto.Analytics.service, analyticsService);
server.addService(devforgeProto.Editor.service, editorService);
server.addService(devforgeProto.Kanban.service, kanbanService);
server.addService(devforgeProto.Auth.service, authService);

const PORT = process.env.GRPC_PORT || 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(`Failed to start gRPC server: ${error}`);
    return;
  }
  console.log(`gRPC server running on port ${port}`);
});
