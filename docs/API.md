# VividP API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <supabase_access_token>
```

---

## Endpoints

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "k8sConfigured": true
}
```

---

### Deploy Application
```http
POST /deploy
```
**Request Body:**
```json
{
  "appName": "my-app",
  "image": "nginx:latest",
  "containerPort": "80"
}
```
**Response:**
```json
{
  "success": true,
  "namespace": "vividp-username",
  "deploymentName": "my-app",
  "url": "http://my-app-username.vividp.internal"
}
```

---

### List Deployments
```http
GET /deployments
```
**Response:**
```json
{
  "deployments": [
    {
      "name": "my-app",
      "namespace": "vividp-username",
      "image": "nginx:latest",
      "status": "Running",
      "replicas": 1,
      "url": "http://my-app-username.vividp.internal",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### Delete Deployment
```http
DELETE /deployments/:namespace/:appName
```
**Response:**
```json
{
  "success": true,
  "message": "Deleted my-app from vividp-username"
}
```

---

### Restart Deployment
```http
POST /deployments/:namespace/:appName/restart
```
**Response:**
```json
{
  "success": true,
  "message": "Restarted my-app"
}
```

---

### Get Deployment Status
```http
GET /status/:namespace/:appName
```
**Response:**
```json
{
  "status": "Running",
  "reason": "",
  "ready": true
}
```

---

### List Pods
```http
GET /pods
```
**Response:**
```json
{
  "pods": [
    {
      "name": "my-app-abc123",
      "namespace": "vividp-username",
      "status": "Running",
      "reason": "",
      "restarts": 0,
      "ip": "10.0.0.5",
      "node": "node-1",
      "age": "2024-01-01T12:00:00.000Z",
      "containers": [
        {
          "name": "my-app",
          "image": "nginx:latest",
          "ports": [80]
        }
      ]
    }
  ],
  "namespace": "vividp-username"
}
```

---

### Get Pod Logs
```http
GET /pods/:podName/logs?tail=100
```
**Query Parameters:**
- `tail` (optional): Number of lines to return (default: 100)
- `container` (optional): Container name for multi-container pods

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2024-01-01T12:00:00.000Z",
      "message": "Starting nginx..."
    }
  ],
  "podName": "my-app-abc123",
  "namespace": "vividp-username"
}
```

---

### Delete Pod
```http
DELETE /pods/:podName
```
**Response:**
```json
{
  "success": true,
  "message": "Deleted pod my-app-abc123"
}
```

---

### List Services
```http
GET /services
```
**Response:**
```json
{
  "services": [
    {
      "name": "my-app",
      "namespace": "vividp-username",
      "type": "ClusterIP",
      "clusterIP": "10.96.0.10",
      "ports": [
        { "port": 80, "targetPort": 80, "protocol": "TCP" }
      ],
      "age": "2024-01-01T12:00:00.000Z"
    }
  ],
  "namespace": "vividp-username"
}
```

---

### Delete Service
```http
DELETE /services/:serviceName
```
**Response:**
```json
{
  "success": true,
  "message": "Deleted service my-app"
}
```

---

### Get Namespace Summary
```http
GET /namespace/summary
```
**Response:**
```json
{
  "namespace": "vividp-username",
  "summary": {
    "deployments": { "total": 2, "ready": 2 },
    "pods": { "total": 2, "running": 2 },
    "services": { "total": 2 }
  }
}
```

---

## Error Responses

All errors return JSON with an `error` field:
```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (accessing other user's resources)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Kubernetes not configured
