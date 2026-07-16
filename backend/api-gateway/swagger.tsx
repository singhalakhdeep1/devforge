import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: any) {
  const config = new DocumentBuilder()
    .setTitle('DevHub API')
    .setDescription('Complete developer platform API with microservices architecture')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('projects', 'Project management endpoints')
    .addTag('teams', 'Team collaboration endpoints')
    .addTag('files', 'File storage and management endpoints')
    .addTag('analytics', 'Analytics and reporting endpoints')
    .addTag('notifications', 'Notification management endpoints')
    .addTag('webhooks', 'Webhook configuration endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'DevHub API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  return document;
}
