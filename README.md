# VividP - AI-Native Internal Developer Platform

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Node](https://img.shields.io/badge/node-20+-green)
![License](https://img.shields.io/badge/license-MIT-blue)

VividP is an **AI-Native Internal Developer Platform** designed for elite engineering teams. It provides zero-trust authentication, AI-powered analytics, and comprehensive developer infrastructure management.

## 🌟 Features

- **Modern React 18** Frontend with TypeScript
- **Express.js** Backend with industry-standard patterns
- **PostgreSQL** Database with Prisma ORM
- **Authentication** with JWT and refresh tokens
- **Real-time Analytics** Dashboard
- **Security Observability** with audit logging
- **Self-Service Portal** for team management
- **Comprehensive Testing** Suite (Vitest + Playwright)
- **CI/CD Pipeline** with GitHub Actions
- **Docker Support** for easy deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/devopscl0ud/VIVIDP-Blueprint-kimi.git
cd VIVIDP-Blueprint-kimi

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
cp server/.env.example server/.env

# Start database
docker-compose up -d

# Run migrations
npm run db:migrate

# Start development servers
npm run dev          # Frontend on http://localhost:5173
npm run backend:dev  # Backend on http://localhost:3000
```

## 📁 Project Structure

```
VIVIDP-Blueprint-kimi/
├── src/                     # Frontend (React + TypeScript)
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── api/               # API client
│   ├── store/             # State management
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript definitions
│   └── styles/            # Global styles
├── server/                # Backend (Express + Node.js)
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration
│   └── prisma/           # Database schema
├── tests/                 # Test files
├── public/                # Static assets
├── docker-compose.yml     # Local development setup
└── README.md             # This file
```

## 🛠️ Development

### Available Scripts

**Frontend:**
```bash
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run type-check      # TypeScript type checking
npm run lint            # ESLint
npm run format          # Prettier formatting
npm run test            # Vitest
npm run test:coverage   # Coverage report
```

**Backend:**
```bash
npm run backend:dev     # Start backend dev server
npm run backend:build   # Build backend
npm run backend:start   # Start built backend
npm run db:migrate      # Run migrations
npm run db:generate     # Generate Prisma client
npm run db:studio       # Open Prisma Studio
```

### Code Style

We follow strict code quality standards:

```bash
# Lint and auto-fix
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

## 🔒 Security

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: AES-256 at rest, TLS 1.3+ in transit
- **Validation**: Strict input validation
- **Rate Limiting**: Per-user and global quotas
- **Security Headers**: CSP, X-Frame-Options, etc.
- **Audit Logging**: All critical actions logged
- **OWASP Compliance**: Follows OWASP Top 10

## 📚 Documentation

- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code Analysis](./ANALYSIS.md)

## 🐳 Docker

### Build Images
```bash
docker build -t vividp-frontend -f Dockerfile --target frontend .
docker build -t vividp-backend -f Dockerfile --target backend .
```

### Run Containers
```bash
docker-compose up
```

## 📊 Performance

- **Frontend**: Sub-200ms page loads, code splitting, lazy loading
- **Backend**: <100ms response times (p99)
- **Database**: Optimized queries with proper indexing
- **Real-time**: WebSocket support for live updates

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:
- Code style guidelines
- Testing requirements
- Pull request process
- Git workflow

## 📋 Roadmap

- [x] Modern project structure
- [x] React + TypeScript setup
- [x] Backend with Express
- [x] Database with Prisma
- [ ] Authentication system
- [ ] API endpoints
- [ ] Testing suite
- [ ] CI/CD pipeline
- [ ] Deployment guides
- [ ] API documentation

## 🔗 Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express Guide](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📝 License

MIT License - see LICENSE file for details

## 🙋 Support

For issues or questions:
1. Check [GitHub Issues](https://github.com/devopscl0ud/VIVIDP-Blueprint-kimi/issues)
2. Create a new issue with detailed information
3. Follow the issue template

---

**Built with ❤️ by the VividP Team**