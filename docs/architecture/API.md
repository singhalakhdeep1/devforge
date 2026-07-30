# 📡 API Documentation

## Base URL

- **Development**: `http://localhost:4000`
- **Production**: `https://api.devhub.com`

## API Version

All endpoints are prefixed with `/api/v1`

---

## Authentication

### Register
**POST** `/api/v1/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  },
  "message": "User registered successfully"
}
```

### Login
**POST** `/api/v1/auth/login`

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "123",
      "email": "user@example.com",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

### Refresh Token
**POST** `/api/v1/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

### Logout
**POST** `/api/v1/auth/logout`

Logout user (invalidate tokens).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Users

### Get Current User
**GET** `/api/v1/users/me`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "123",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "USER"
  }
}
```

### Get User by ID
**GET** `/api/v1/users/:id`

Get specific user's public profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://..."
  }
}
```

### Update User
**PUT** `/api/v1/users/:id`

Update user profile.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "avatar": "https://..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "message": "User updated successfully"
}
```

### Delete User (Admin Only)
**DELETE** `/api/v1/users/:id`

Delete a user account.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Projects

### Get All Projects
**GET** `/api/v1/projects`

Get paginated list of projects.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `search` (string, optional)
- `sort` (string, optional: name, createdAt)
- `order` (string: asc, desc, default: desc)

**Example:**
```
GET /api/v1/projects?page=1&limit=20&search=ecommerce&sort=createdAt&order=desc
```

**Response (200):**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Create Project
**POST** `/api/v1/projects`

Create a new project.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "name": "E-commerce Platform",
  "description": "Full-stack e-commerce application",
  "visibility": "PRIVATE",
  "tags": ["react", "nodejs", "mongodb"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "project-uuid",
    "name": "E-commerce Platform",
    "description": "Full-stack e-commerce application",
    "visibility": "PRIVATE",
    "tags": ["react", "nodejs", "mongodb"]
  },
  "message": "Project created successfully"
}
```

### Get Project by ID
**GET** `/api/v1/projects/:id`

Get project details.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "project-uuid",
    "name": "E-commerce Platform",
    "description": "Full-stack e-commerce application",
    "ownerId": "user-id",
    "members": [],
    "status": "ACTIVE",
    "visibility": "PRIVATE"
  }
}
```

### Update Project
**PUT** `/api/v1/projects/:id`

Update project details.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "ARCHIVED"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "project-uuid",
    "name": "Updated Project Name"
  },
  "message": "Project updated successfully"
}
```

### Delete Project (Admin Only)
**DELETE** `/api/v1/projects/:id`

Delete a project.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## Email Service

### Send Email
**POST** `/api/v1/email/send`

Queue an email to be sent.

**Request Body:**
```json
{
  "to": "user@example.com",
  "subject": "Welcome to DevHub",
  "template": "WELCOME",
  "data": {
    "name": "John Doe"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "jobId": "job-uuid"
}
```

**Available Templates:**
- `WELCOME` - Welcome email
- `PASSWORD_RESET` - Password reset link
- `EMAIL_VERIFICATION` - Email verification link
- `PROJECT_INVITE` - Project invitation

---

## Health Checks

### API Gateway Health
**GET** `/health`

Check API Gateway health status.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "service": "api-gateway",
  "checks": {
    "redis": "connected",
    "memory": {
      "used": 50000000,
      "total": 100000000
    }
  }
}
```

### Readiness Probe
**GET** `/health/ready`

Check if service is ready to accept traffic.

**Response (200):**
```json
{
  "ready": true
}
```

### Liveness Probe
**GET** `/health/live`

Check if service is alive.

**Response (200):**
```json
{
  "alive": true
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error: Invalid email format"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found",
  "path": "/api/v1/users/invalid-id",
  "method": "GET"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "correlationId": "1234567890-abc"
}
```

---

## Rate Limiting

Default rate limits:
- **Window**: 15 minutes
- **Max Requests**: 100

Exceeding rate limits returns `429 Too Many Requests`.

---

## CORS

Allowed origins (configurable):
- `http://localhost:3000`
- `http://localhost:3001`
- Production domain

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:4006', {
  auth: { token: 'your_jwt_token' }
});
```

### Events

#### Join Room
```javascript
socket.emit('join_room', 'room-id');
```

#### Leave Room
```javascript
socket.emit('leave_room', 'room-id');
```

#### Send Message
```javascript
socket.emit('message', {
  roomId: 'room-id',
  content: 'Hello!',
  type: 'TEXT'
});
```

#### Receive Message
```javascript
socket.on('message', (data) => {
  console.log('New message:', data);
});
```

#### Typing Indicator
```javascript
socket.emit('typing', {
  roomId: 'room-id',
  isTyping: true
});
```

#### Presence
```javascript
socket.emit('presence', 'online');

socket.on('presence', (data) => {
  console.log(`User ${data.userId} is ${data.status}`);
});
```

#### Notification
```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

---

## Authentication Headers

All protected endpoints require:

```http
Authorization: Bearer {your_jwt_access_token}
```

---

## Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Projects Example
```bash
curl -X GET http://localhost:4000/api/v1/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Testing with JavaScript/Fetch

```javascript
// Login
const response = await fetch('http://localhost:4000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const data = await response.json();
const accessToken = data.data.tokens.accessToken;

// Use token for authenticated requests
const projects = await fetch('http://localhost:4000/api/v1/projects', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

---

## Pagination Standard

All paginated endpoints follow this pattern:

**Request:**
```
GET /api/v1/resource?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

**For complete API testing, consider using:**
- Postman Collection (export available)
- Swagger/OpenAPI documentation (when enabled)
- GraphQL Playground (if GraphQL is implemented)

---

**API Version: 1.0.0**  
**Last Updated: December 2024**
