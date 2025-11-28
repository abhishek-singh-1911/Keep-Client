# Keep Client - Developer Documentation

> Comprehensive guide to the Keep client application architecture, features, and development practices

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [State Management](#state-management)
6. [Real-time Collaboration](#real-time-collaboration)
7. [Authentication & Security](#authentication--security)
8. [Search Functionality](#search-functionality)
9. [Testing](#testing)
10. [Code Examples](#code-examples)
11. [Best Practices](#best-practices)

---

## 🎯 Project Overview

**Keep Client** is a modern, real-time collaborative note-taking application built with React and TypeScript. It provides a Google Keep-like experience with advanced features like real-time collaboration, drag-and-drop organization, and local search.

### Key Features

- ✅ User authentication with JWT
- ✅ Create, edit, delete notes (lists)
- ✅ Real-time collaboration with Socket.IO
- ✅ Drag-and-drop note organization
- ✅ Pin/Archive notes
- ✅ Local search across notes and items
- ✅ Collaborator management with permissions
- ✅ Responsive Material-UI design
- ✅ Comprehensive test coverage

---

## 🏗 Architecture

### Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components
│   │   ├── AppBar.tsx          # Top navigation bar
│   │   ├── Sidebar.tsx         # Side navigation
│   │   ├── MainLayout.tsx      # Main page layout
│   │   └── MasonryGrid.tsx     # Masonry grid layout
│   └── notes/          # Note-related components
│       ├── NoteCard.tsx            # Individual note card
│       ├── NoteInput.tsx           # Note creation input
│       ├── EditNoteDialog.tsx      # Note editing dialog
│       ├── CollaboratorDialog.tsx  # Manage collaborators
│       └── SortableNoteCard.tsx    # Draggable note card
├── pages/              # Page components
│   ├── Dashboard.tsx       # Main notes view
│   ├── Archive.tsx         # Archived notes
│   ├── Collaborated.tsx    # Shared notes
│   ├── Login.tsx           # Login page
│   └── Register.tsx        # Registration page
├── services/           # API and socket services
│   ├── api.ts              # Axios instance with interceptors
│   ├── authService.ts      # Authentication API calls
│   ├── listsService.ts     # Lists/notes API calls
│   └── socketService.ts    # Socket.IO client
├── store/              # Redux state management
│   ├── store.ts            # Redux store configuration
│   └── slices/             # Redux slices
│       ├── authSlice.ts        # Authentication state
│       ├── listsSlice.ts       # Lists/notes state
│       └── uiSlice.ts          # UI state (search, sidebar)
├── hooks/              # Custom React hooks
│   └── useRedux.ts         # Typed Redux hooks
├── styles/             # Global styles and theme
│   ├── theme.ts            # MUI theme configuration
│   └── GlobalStyles.tsx    # Global CSS
└── test/               # Test files
    ├── test-utils.tsx                  # Testing utilities
    ├── realtime-collaboration.test.tsx # Real-time tests
    ├── CollaboratorDialog.test.tsx     # Component tests
    └── NoteCard.test.tsx               # Component tests
```

### Data Flow

```
User Action
    ↓
React Component
    ↓
Redux Action Dispatch
    ↓
API Service Call (via axios)
    ↓
Server Response
    ↓
Redux State Update
    ↓
Component Re-render
    ↓
Socket Event (if applicable)
    ↓
Real-time Update on Other Clients
```

---

## 🛠 Technology Stack

### Core Technologies

- **Framework**: React 18.3
- **Language**: TypeScript 5.6
- **Build Tool**: Vite 6.0
- **State Management**: Redux Toolkit 2.5
- **UI Library**: Material-UI (MUI) 6.2
- **Routing**: React Router v6
- **HTTP Client**: Axios 1.7
- **Real-time**: Socket.IO Client 4.8

### Development Tools

- **Testing**: Vitest 2.1 + React Testing Library
- **Linting**: ESLint
- **State Persistence**: Redux Persist
- **Drag & Drop**: @dnd-kit 6.3

---

## 🎨 Features

### 1. Note Management

**Create Notes**:
- Click "Take a note..." input
- Enter title and add items
- Auto-saves on blur

**Edit Notes**:
- Click on any note card
- Opens edit dialog
- Update title, items, or collaborators

**Delete Notes**:
- Click delete icon on note card
- Confirmation required

**Archive/Unarchive**:
- Click archive icon
- Moves to Archive page
- Can be restored

**Pin/Unpin**:
- Click pin icon
- Pinned notes appear at top
- Separate "PINNED" section

### 2. Collaboration

**Add Collaborators**:
- Click collaborator icon on note
- Enter email address
- Choose permission level (view/edit)

**Permission Levels**:
- **View**: Can see note and items
- **Edit**: Can modify note and items
- **Owner**: Full control + manage collaborators

**Real-time Updates**:
- Changes appear instantly for all collaborators
- Socket.IO handles real-time sync
- Automatic refetch on collaboration events

### 3. Organization

**Drag & Drop**:
- Reorder notes within pinned/unpinned sections
- Powered by @dnd-kit
- Persists order to backend

**Search**:
- Local filtering (no server round-trip)
- Searches note titles and item text
- Real-time results as you type

**Views**:
- Dashboard: All active notes
- Archive: Archived notes
- Collaborated: Notes shared with you

---

## 🔄 State Management

### Redux Store Structure

```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  lists: {
    lists: List[],
    currentList: List | null,
    loading: boolean,
    error: string | null
  },
  ui: {
    sidebarOpen: boolean,
    searchQuery: string,
    viewMode: 'grid' | 'list',
    activeView: 'notes' | 'archived' | 'collaborated'
  }
}
```

### Key Actions

**Auth Slice**:
- `loginStart()` - Set loading state
- `loginSuccess(user, token)` - Store user and token
- `loginFailure(error)` - Set error message
- `logout()` - Clear auth state

**Lists Slice**:
- `setLists(lists)` - Set all lists
- `addList(list)` - Add new list
- `updateList(list)` - Update existing list
- `deleteList(listId)` - Remove list
- `setLoading(boolean)` - Set loading state
- `setError(error)` - Set error message

**UI Slice**:
- `toggleSidebar()` - Toggle sidebar
- `setSearchQuery(query)` - Update search
- `setViewMode(mode)` - Change grid/list view
- `setActiveView(view)` - Change active page

### Redux Persist

State is persisted to localStorage:
- Auth state (user, token)
- UI preferences (sidebar, view mode)
- Lists are NOT persisted (fetched fresh on load)

---

## 🔌 Real-time Collaboration

### Socket.IO Implementation

**Connection**:
```typescript
// Initiated on login
initiateSocketConnection();

// Disconnected on logout
disconnectSocket();
```

**Room Management**:
```typescript
// Join a list room
joinListRoom(listId);

// Leave a list room
leaveListRoom(listId);
```

**Events**:

| Event | Direction | Purpose |
|-------|-----------|---------|
| `collaborator_added` | Server → Client | New collaborator added |
| `collaborator_removed` | Server → Client | Collaborator removed |
| `permission_changed` | Server → Client | Permission updated |
| `list_updated` | Server → Client | List content changed |

**Event Handlers**:
```typescript
// Subscribe to events
subscribeToCollaboratorAdded((data) => {
  // Refetch lists to show new shared note
  fetchLists();
});

subscribeToCollaboratorRemoved((data) => {
  // Refetch lists to remove access
  fetchLists();
});

subscribeToPermissionChanged((data) => {
  // Refetch lists to update permissions
  fetchLists();
});
```

**Implementation Details**:
- Socket connection established on login
- Each page (Dashboard, Archive, Collaborated) subscribes to events
- Events trigger automatic list refetch
- No manual refresh needed
- Real-time updates across all connected clients

### Testing Real-time Features

See `src/test/realtime-collaboration.test.tsx` for comprehensive tests covering:
- Socket event subscriptions
- Automatic refetch on events
- Error handling
- Performance with multiple events

---

## 🔐 Authentication & Security

### Current Implementation

**JWT Tokens**:
- 30-day expiration
- Stored in Redux (persisted to localStorage)
- Automatically attached to requests via axios interceptor

**Token Flow**:
```
1. User logs in
2. Server returns JWT token
3. Token stored in Redux + localStorage
4. Axios interceptor adds token to all requests
5. Server validates token on protected routes
6. On 401 error, user is logged out
```

**Axios Interceptors**:

```typescript
// Request interceptor - Add token
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Token Refresh Strategy

**Current Status**: ⚠️ No automatic token refresh

**Limitations**:
- Users logged out after 30 days without warning
- No way to refresh token before expiry
- Compromised tokens valid for full 30 days

**Recommended Solutions**:

1. **Session Timeout Warning** (Quick win):
   - Show warning modal 24 hours before expiry
   - Give user option to extend session
   - 1-2 hours implementation

2. **Refresh Token Pattern** (Best practice):
   - Short-lived access tokens (15 min)
   - Long-lived refresh tokens (30 days)
   - Automatic token refresh
   - Can revoke tokens
   - 4-6 hours implementation

See `TOKEN_STRATEGY.md` for detailed implementation guides.

---

## 🔍 Search Functionality

### Implementation

**Local Filtering**:
- No server round-trip
- Filters in-memory lists
- Instant results

**Search Logic**:
```typescript
const filterLists = (listArray: List[]) => {
  if (!searchQuery.trim()) return listArray;
  
  const query = searchQuery.toLowerCase();
  return listArray.filter(list => {
    // Search in list name
    if (list.name.toLowerCase().includes(query)) return true;
    
    // Search in list items text
    const hasMatchingItem = list.items.some(item => 
      item.text.toLowerCase().includes(query)
    );
    
    return hasMatchingItem;
  });
};
```

**Features**:
- Case-insensitive search
- Searches both note titles and item text
- Real-time filtering as you type
- Works across all views (Dashboard, Archive, Collaborated)
- Shows "No results" message when nothing matches

**UI Integration**:
- Search bar in AppBar component
- Updates `searchQuery` in UI slice
- All pages react to search query changes
- Clear visual feedback for empty results

---

## 🧪 Testing

### Test Coverage

**Test Files**:
- `realtime-collaboration.test.tsx` - 16 tests for real-time features
- `CollaboratorDialog.test.tsx` - Component tests
- `NoteCard.test.tsx` - Component tests
- `test-utils.tsx` - Testing utilities

**Testing Stack**:
- **Test Runner**: Vitest
- **Component Testing**: React Testing Library
- **Mocking**: Vitest mocks
- **Assertions**: Vitest expect

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test src/test/realtime-collaboration.test.tsx

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Writing Tests

**Test Utilities**:
```typescript
import { renderWithProviders } from './test-utils';

// Render with Redux store
renderWithProviders(<Component />, {
  preloadedState: {
    auth: { user: mockUser, token: 'token', isAuthenticated: true },
    lists: { lists: mockLists, loading: false },
    ui: { searchQuery: '', sidebarOpen: true }
  }
});
```

**Mocking Services**:
```typescript
import { vi } from 'vitest';
import * as listsService from '../services/listsService';

vi.mock('../services/listsService');

(listsService.getAllLists as Mock).mockResolvedValue(mockLists);
```

**Testing Real-time Features**:
```typescript
// Mock socket subscriptions
vi.mock('../services/socketService');

let callback: ((data: any) => void) | null = null;

(socketService.subscribeToCollaboratorAdded as Mock)
  .mockImplementation((cb) => {
    callback = cb;
  });

// Trigger the event
callback?.({ listId: 'LIST001' });

// Verify refetch was called
await waitFor(() => {
  expect(listsService.getAllLists).toHaveBeenCalledTimes(2);
});
```

### Test Best Practices

1. **Use test-utils for rendering** - Ensures Redux store is available
2. **Mock external dependencies** - Services, socket connections
3. **Test user interactions** - Use `userEvent` for realistic interactions
4. **Wait for async updates** - Use `waitFor` for async state changes
5. **Test error states** - Verify error handling
6. **Keep tests focused** - One concept per test

---

## 💻 Code Examples

### Creating a New Page

```typescript
// src/pages/NewPage.tsx
import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { setActiveView } from '../store/slices/uiSlice';

export default function NewPage() {
  const dispatch = useAppDispatch();
  const { lists } = useAppSelector((state) => state.lists);

  useEffect(() => {
    dispatch(setActiveView('custom'));
  }, [dispatch]);

  return (
    <MainLayout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">New Page</Typography>
        {/* Your content */}
      </Box>
    </MainLayout>
  );
}
```

### Adding a New API Endpoint

```typescript
// src/services/listsService.ts
export const listsService = {
  // ... existing methods
  
  async customAction(listId: string, data: any): Promise<List> {
    const response = await api.post<List>(
      `/lists/${listId}/custom`,
      data
    );
    return response.data;
  }
};
```

### Creating a Custom Hook

```typescript
// src/hooks/useSearch.ts
import { useMemo } from 'react';
import { useAppSelector } from './useRedux';
import type { List } from '../store/slices/listsSlice';

export function useSearch(lists: List[]) {
  const { searchQuery } = useAppSelector((state) => state.ui);

  const filteredLists = useMemo(() => {
    if (!searchQuery.trim()) return lists;
    
    const query = searchQuery.toLowerCase();
    return lists.filter(list => 
      list.name.toLowerCase().includes(query) ||
      list.items.some(item => item.text.toLowerCase().includes(query))
    );
  }, [lists, searchQuery]);

  return filteredLists;
}
```

### Adding Socket Event Listener

```typescript
// In your component
import { useEffect, useCallback } from 'react';
import { subscribeToCustomEvent } from '../services/socketService';

export default function MyComponent() {
  const handleCustomEvent = useCallback((data) => {
    console.log('Custom event received:', data);
    // Handle the event
  }, []);

  useEffect(() => {
    subscribeToCustomEvent(handleCustomEvent);
  }, [handleCustomEvent]);

  return <div>...</div>;
}
```

---

## 📚 Best Practices

### Component Organization

1. **Keep components small** - Single responsibility
2. **Extract reusable logic** - Use custom hooks
3. **Use TypeScript** - Define prop types
4. **Memoize expensive operations** - Use `useMemo`, `useCallback`
5. **Handle loading/error states** - Always show feedback

### State Management

1. **Use Redux for global state** - Auth, lists, UI preferences
2. **Use local state for UI** - Form inputs, modals
3. **Normalize data** - Avoid nested structures
4. **Keep actions simple** - One action, one purpose
5. **Use selectors** - Derive data in selectors, not components

### Performance

1. **Lazy load routes** - Use React.lazy()
2. **Optimize re-renders** - Use React.memo() for expensive components
3. **Debounce search** - Avoid excessive filtering
4. **Virtual scrolling** - For long lists (future enhancement)
5. **Code splitting** - Separate vendor bundles

### Security

1. **Never store sensitive data** - Only store necessary info
2. **Validate user input** - Client and server-side
3. **Sanitize HTML** - Prevent XSS attacks
4. **Use HTTPS in production** - Encrypt data in transit
5. **Implement CSP** - Content Security Policy headers

### Testing

1. **Test user flows** - Not implementation details
2. **Mock external dependencies** - Services, APIs
3. **Use meaningful test names** - Describe what's being tested
4. **Keep tests independent** - No shared state
5. **Test edge cases** - Empty states, errors, loading

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` directory

### Environment Variables

Create `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Deployment Platforms

**Recommended**:
- **Vercel** - Zero-config deployment
- **Netlify** - Continuous deployment
- **AWS S3 + CloudFront** - Scalable static hosting
- **GitHub Pages** - Free for public repos

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 📞 Support & Resources

### Documentation
- [React Docs](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Material-UI](https://mui.com)
- [Vite](https://vitejs.dev)
- [Socket.IO](https://socket.io)

### Internal Docs
- `SETUP.md` - Quick setup guide
- `src/test/REALTIME_COLLABORATION_TESTS.md` - Real-time testing guide
- Server documentation in `/server/README.md`

---

**Last Updated**: 2025-11-28
**Version**: 1.0.0
