# VividP - Development Guidelines

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- Docker & Docker Compose (for PostgreSQL)
- Git

### Quick Start

1. **Clone and Install**
```bash
git clone <repository-url>
cd VIVIDP-Blueprint-kimi
npm install
```

2. **Setup Database**
```bash
# Using Docker Compose
docker-compose up -d

# Run migrations
npm run db:migrate
```

3. **Start Development Servers**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run backend:dev
```

## Project Structure

```
.
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── common/              # Reusable components
│   │   └── ui/                  # UI component library
│   ├── pages/                    # Page components
│   ├── hooks/                    # Custom React hooks
│   ├── store/                    # State management (Zustand)
│   ├── api/                      # API client and endpoints
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── styles/                   # Global styles
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
├── server/                       # Backend source code
│   ├── src/
│   │   ├── routes/              # Express routes
│   │   ├── controllers/         # Route handlers
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Express middleware
│   │   ├── config/              # Configuration
│   │   └── utils/               # Utility functions
│   ├── prisma/                  # Prisma ORM
│   └── index.ts                 # Server entry point
├── public/                       # Static assets
└── tests/                        # Test files

```

## Code Style & Standards

### ESLint & Prettier
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### TypeScript
```bash
# Type checking
npm run type-check
```

## Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

## Git Workflow

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add user authentication
fix: resolve login page styling issue
docs: update setup guide
refactor: extract API client logic
test: add user service tests
```

### Pull Request Process
1. Create feature branch from `dev`
2. Make commits with conventional messages
3. Push to remote and create PR
4. Ensure CI/CD passes
5. Request code review
6. Merge after approval

## Environment Variables

### Frontend (.env.local)
```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=VividP
VITE_ENABLE_ANALYTICS=true
```

### Backend (server/.env)
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
CORS_ORIGIN=http://localhost:5173
```

## Database

### Migrations
```bash
# Create new migration
npx prisma migrate dev --name add_user_table

# Apply migrations to production
npm run db:migrate

# Reset database (dev only!)
npx prisma migrate reset
```

### Prisma Studio
```bash
npm run db:studio
```

## Debugging

### Frontend
- Use React Developer Tools extension
- Use Redux DevTools (once Redux is added)
- Open DevTools with F12

### Backend
```bash
# Debug mode
node --inspect server/index.ts

# Use VS Code debugger with launch.json config
```

## Performance Best Practices

### Frontend
- Use React.memo for expensive components
- Implement code splitting with React.lazy
- Use React Query for server state
- Implement virtual scrolling for large lists
- Use image optimization

### Backend
- Use database indexes wisely
- Implement caching strategies
- Use pagination for large datasets
- Monitor query performance
- Use connection pooling

## Security Checklist

- [ ] Sanitize user inputs
- [ ] Use HTTPS in production
- [ ] Rotate secrets regularly
- [ ] Keep dependencies updated
- [ ] Run security audits
- [ ] Implement rate limiting
- [ ] Add CORS properly
- [ ] Use secure cookies (httpOnly, secure)
- [ ] Implement proper authentication
- [ ] Add audit logging

## Troubleshooting

### Node modules issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection
```bash
# Check if PostgreSQL is running
docker ps

# View logs
docker logs <container-name>
```

### Port already in use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Support

For issues or questions, please:
1. Check existing GitHub issues
2. Create a new issue with detailed information
3. Follow the issue template

---

Happy coding! 🚀
