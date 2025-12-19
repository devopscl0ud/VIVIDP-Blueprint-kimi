# VividP - User Onboarding Guide

Welcome to **VividP**, your AI-Native Internal Developer Platform!

---

## 🚀 Quick Start

### 1. Create Your Account
1. Navigate to `/signup`
2. Enter your email and create a password
3. Or use **Google** / **GitHub** login for one-click signup

### 2. Your Personal Namespace
Once logged in, VividP automatically creates a Kubernetes namespace for you:
```
vividp-<your-username>
```
All your deployments live in this isolated namespace.

---

## 📦 Deploy Your First App

### Method 1: Quick Deploy Templates
1. Go to **Portal** → **Overview**
2. Click a template (Nginx, Node.js, Redis, PostgreSQL)
3. Customize the name if needed
4. Click **Deploy Now**

### Method 2: Custom Deployment
1. Go to **Portal**
2. Click **+ Deploy** button
3. Fill in:
   - **Application Name**: lowercase, alphanumeric (e.g., `my-app`)
   - **Docker Image**: public image (e.g., `nginx:latest`)
   - **Container Port**: the port your app listens on
4. Click **Deploy Now**

### After Deployment
Your app gets:
- A **Deployment** (manages the pods)
- A **Service** (internal load balancer)
- An **Ingress** (external URL)

---

## 📊 Monitoring Your Resources

### Portal Tabs
- **Overview**: Resource counts, quick actions
- **Deployments**: All your apps with status
- **Pods**: Running containers (can restart individually)
- **Services**: Network endpoints
- **Logs**: Real-time pod logs

### Status Indicators
| Status | Meaning |
|--------|---------|
| 🟢 Running | Healthy and serving traffic |
| 🟡 Pending | Starting up |
| 🔵 ContainerCreating | Pulling image |
| 🔴 Error/CrashLoop | Something's wrong |

---

## 🔧 Managing Resources

### Restart a Deployment
Click 🔄 on any deployment to trigger a rolling restart.

### View Pod Logs
1. Go to **Pods** tab
2. Click 📜 on a pod
3. Logs appear in the terminal viewer
4. Use the filter box to search

### Delete Resources
1. Click 🗑️ on any resource
2. Confirm the deletion
3. **Warning**: This cannot be undone!

---

## ⚙️ Settings

### Profile
Update your name, bio, and role in **Settings → Profile**.

### Theme
Toggle between **Dark** and **Light** mode using:
- The header icon (🌙/☀️)
- The toggle in the sidebar

### Security
- Reset your password via email
- View active sessions
- Sign out securely

---

## 💡 Tips for Developers

1. **Use alpine images** - Faster pulls, smaller footprint
2. **Check logs** if pods are in CrashLoop
3. **Restart** if config changes aren't applying
4. **Delete unused resources** to stay organized

---

## 🆘 Need Help?

- **Dashboard**: AI chat assistant (bottom-right 🤖)
- **API Docs**: See `/docs/API.md`
- **Support**: Contact your platform admin

---

Happy Deploying! 🎉
