# Keep Client - Setup Guide

> Quick start guide to get the Keep client application running locally

---

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Keep Server running (see server setup)

---

## Quick Start

### 1. Install Dependencies

```bash
cd keep/client
npm install
```

### 2. Configure Environment

Create a `.env` file in the client root:

```env
VITE_API_URL=http://localhost:5002/api
```

### 3. Run Development Server

```bash
npm run dev
```

The client will start at `http://localhost:5173`

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test src/test/NoteCard.test.tsx

# Run tests in watch mode
npm test -- --watch
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run all tests with Vitest |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
keep/client/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components (AppBar, Sidebar, etc.)
│   │   └── notes/       # Note-related components
│   ├── pages/           # Page components (Dashboard, Archive, etc.)
│   ├── services/        # API services and socket connections
│   ├── store/           # Redux store and slices
│   ├── hooks/           # Custom React hooks
│   ├── styles/          # Global styles and theme
│   └── test/            # Test files
├── public/              # Static assets
└── index.html           # Entry HTML file
```

---

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **Real-time**: Socket.IO Client
- **Testing**: Vitest + React Testing Library
- **Drag & Drop**: dnd-kit

---

## First Time Setup

### 1. Create an Account

1. Navigate to `http://localhost:5173`
2. Click "Sign up" or go to `/register`
3. Fill in your details
4. You'll be automatically logged in

### 2. Create Your First Note

1. Click the "Take a note..." input at the top
2. Enter a title and content
3. Click outside or press Enter to save

### 3. Try Collaboration

1. Create another account (use incognito/different browser)
2. In the first account, click the collaborator icon on a note
3. Add the second user's email
4. The note will appear in real-time on the second account!

---

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:

```bash
# Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Or change the port in vite.config.ts
```

### API Connection Issues

1. Verify the server is running at `http://localhost:5002`
2. Check the `.env` file has the correct `VITE_API_URL`
3. Check browser console for CORS errors

### Tests Failing

```bash
# Clear test cache
npm test -- --clearCache

# Run tests sequentially
npm test -- --no-threads
```

---

## Next Steps

- Read the [Developer Documentation](./DEVELOPER_DOCS.md) for detailed information
- Explore the codebase starting with `src/App.tsx`
- Check out the test files in `src/test/` for examples

---

**Need Help?** Check the Developer Documentation or the server setup guide.
