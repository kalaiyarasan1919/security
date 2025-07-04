# 🚀 TaskFlow - Todo Task Management Web Application

A modern, full-stack Todo Task Management Web Application built with the latest technologies, featuring real-time collaboration, OAuth authentication, and a beautiful responsive UI.

## ✨ Features

### 🎯 Core Features
- **Task Management**: Create, edit, delete, and organize tasks
- **Real-time Collaboration**: Share tasks with team members and see updates instantly
- **Smart Filtering**: Filter by status, priority, due date, and search
- **Comments System**: Add comments to tasks for better communication
- **Activity Tracking**: Keep track of all task-related activities
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🔐 Authentication & Security
- **OAuth 2.0**: Secure Google authentication
- **Session Management**: Server-side session storage
- **Permission System**: Owner/editor permissions for shared tasks
- **Input Validation**: Comprehensive validation with Zod

### ⚡ Real-time Features
- **Live Updates**: See changes instantly across all connected clients
- **WebSocket Integration**: Robust real-time communication
- **Automatic Reconnection**: Reliable connection handling
- **Toast Notifications**: Real-time feedback for all actions

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express** - Server framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe database operations
- **Passport.js** - Authentication middleware
- **WebSocket** - Real-time communication
- **Zod** - Schema validation

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Query** - Server state management
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Lucide React** - Icons

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Google Cloud Platform account (for OAuth)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd todo-app
npm install
```

### 2. Database Setup

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb todo_app

# Or using psql
psql -c "CREATE DATABASE todo_app;"
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/todo_app"

# Session
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"

# Google OAuth (see setup instructions below)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:5000/auth/google/callback"

# Application
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:5000"
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

### 5. Database Migration

```bash
npm run db:push
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:5000](http://localhost:5000) to see your application!

## 📁 Project Structure

```
todo-app/
├── client/                    # React frontend
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── ui/           # Base UI components (Radix)
│       │   ├── ErrorBoundary.tsx
│       │   ├── LoadingSpinner.tsx
│       │   └── TaskCard.tsx
│       ├── hooks/            # Custom React hooks
│       │   └── useAuth.ts
│       ├── lib/              # Utilities and configurations
│       │   ├── queryClient.ts
│       │   └── websocket.tsx
│       ├── pages/            # Page components
│       │   ├── Dashboard.tsx
│       │   └── Login.tsx
│       ├── App.tsx           # Main app component
│       └── main.tsx          # Entry point
├── server/                   # Express backend
│   ├── db.ts                # Database configuration
│   ├── routes.ts            # API routes and WebSocket
│   ├── storage.ts           # Database operations
│   ├── vite.ts              # Vite integration
│   └── index.ts             # Server entry point
├── shared/                  # Shared types and schemas
│   └── schema.ts            # Database schema and types
├── package.json             # Dependencies and scripts
├── drizzle.config.ts        # Database configuration
├── tailwind.config.ts       # Tailwind configuration
├── vite.config.ts           # Vite configuration
└── .env.example             # Environment template
```

## 🔌 API Documentation

### Authentication Endpoints
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler
- `POST /auth/logout` - User logout
- `GET /auth/user` - Get current authenticated user

### Task Management
- `GET /api/tasks` - List tasks with filtering and pagination
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Collaboration
- `POST /api/tasks/:id/share` - Share task with another user
- `DELETE /api/tasks/:id/share/:userId` - Remove task share
- `POST /api/tasks/:id/comments` - Add comment to task

### Utilities
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/users/search?email=user@example.com` - Search users
- `GET /api/activities` - Recent activities

### WebSocket Events
- `task_created` - New task created
- `task_updated` - Task updated
- `task_deleted` - Task deleted
- `task_shared` - Task shared with user
- `comment_added` - New comment added

## 🎨 UI Components

The application uses a modern design system built with:

- **Radix UI** - Accessible, unstyled components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Custom theme** - Dark/light mode support

### Available Components
- Task cards with status indicators
- Responsive navigation
- Modal dialogs and forms
- Toast notifications
- Loading states
- Error boundaries

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # Type checking
npm run db:push      # Push database schema
```

### Database Operations

```bash
# Push schema changes to database
npm run db:push

# Generate migrations (if needed)
npx drizzle-kit generate:pg

# View database in browser
npx drizzle-kit studio
```

### Adding New Features

1. **Backend**: Add routes in `server/routes.ts` and database operations in `server/storage.ts`
2. **Database**: Update schema in `shared/schema.ts` and run `npm run db:push`
3. **Frontend**: Create components in `client/src/components/` and pages in `client/src/pages/`

## 🚀 Deployment

### Production Environment Variables

```bash
# Database (use your production database URL)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Security (generate strong secrets)
SESSION_SECRET="your-production-session-secret"

# OAuth (update for production domain)
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
GOOGLE_CALLBACK_URL="https://yourdomain.com/auth/google/callback"

# Application
NODE_ENV="production"
PORT=5000
```

### Build and Deploy

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Deployment Platforms

The application is ready for deployment on:
- **Vercel** - Recommended for full-stack apps
- **Railway** - Great for PostgreSQL hosting
- **Heroku** - Classic platform choice
- **DigitalOcean App Platform** - Affordable option

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 TODO / Future Features

- [ ] **Mobile App**: React Native version
- [ ] **Offline Support**: PWA with service workers
- [ ] **File Attachments**: Upload files to tasks
- [ ] **Team Management**: Create and manage teams
- [ ] **Advanced Analytics**: Task completion insights
- [ ] **Email Notifications**: Configurable email alerts
- [ ] **Calendar Integration**: Sync with Google Calendar
- [ ] **Templates**: Pre-defined task templates
- [ ] **Time Tracking**: Track time spent on tasks
- [ ] **Subtasks**: Break down tasks into smaller items

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Check connection
psql $DATABASE_URL
```

**OAuth Error**
- Verify Google OAuth credentials in `.env`
- Check redirect URI matches exactly
- Ensure OAuth consent screen is configured

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite
```

**Port Already in Use**
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations
- [React Query](https://tanstack.com/query) for server state management

---

Built with ❤️ for teams who want to get things done efficiently!