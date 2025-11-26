# Keep UI Implementation Plan

> Building a Google Keep clone with responsive design and PWA support

---

## 🎨 Design System

### **Colors**
- **Primary**: Yellow (#ffc107) - Google Keep signature color
- **Text**: Dark gray (#202124)
- **Secondary Text**: Medium gray (#5f6368)
- **Background**: White (#ffffff)
- **Note Colors**: 12 colors (red, orange, yellow, green, teal, blue, etc.)

### **Typography**
- **Font**: Google Sans, Roboto
- **Sizes**: 0.75rem - 2rem
- **Weight**: 400 (regular), 500 (medium)

### **Spacing**
- **Grid Gap**: 16px
- **Card Padding**: 12px - 16px
- **Border Radius**: 8px

---

## 📱 Responsive Layout

### **Breakpoints**
- **Mobile**: < 600px (1 column)
- **Tablet**: 600px - 960px (2 columns)
- **Desktop**: 960px - 1280px (3 columns)
- **Wide**: > 1280px (4 columns)

### **Grid System**
- Masonry layout (Pinterest-style)
- Auto-fit columns based on screen size
- Smooth transitions on resize

---

## 🧩 Components to Build

### **1. Layout Components**
- ✅ **AppBar** - Top navigation with logo, search, user menu
- ✅ **Sidebar** - Navigation (Notes, Archive, Trash)
- ✅ **MainLayout** - Combines AppBar + Sidebar + Content

### **2. Note Components**
- ✅ **NoteCard** - Individual note display
- ✅ **NoteInput** - "Take a note..." input
- ✅ **NoteEditor** - Full note editing modal
- ✅ **ColorPicker** - Color palette selector
- ✅ **NoteActions** - Pin, Archive, Delete, More

### **3. List Components**
- ✅ **ListItem** - Individual checklist item
- ✅ **ListItemInput** - Add new item
- ✅ **DraggableList** - Reorderable list items

### **4. Common Components**
- ✅ **SearchBar** - Top search functionality
- ✅ **UserMenu** - Profile dropdown
- ✅ **ConfirmDialog** - Delete confirmation
- ✅ **LoadingSpinner** - Loading states

### **5. Page Components**
- ✅ **Login** - Authentication page
- ✅ **Register** - Sign up page
- ✅ **Dashboard** - Main notes grid
- ✅ **ListView** - Individual list view (optional)

---

## 🔄 User Flows

### **1. Authentication Flow**
```
Login/Register → Dashboard → View/Edit Notes
```

### **2. Create Note Flow**
```
Click "Take a note" → Enter title/items → Click outside → Note saved
```

### **3. Edit Note Flow**
```
Click note → Edit modal opens → Make changes → Click outside → Auto-save
```

### **4. List Management Flow**
```
Add items → Check/uncheck → Reorder (drag) → Delete items
```

---

## 🎯 Features to Implement

### **Phase 1: Core UI** (Current)
- [x] Theme setup
- [x] PWA configuration
- [ ] AppBar component
- [ ] Sidebar component
- [ ] Main layout
- [ ] Note card component
- [ ] Masonry grid layout

### **Phase 2: Note Functionality**
- [ ] Create note
- [ ] Edit note
- [ ] Delete note
- [ ] Color picker
- [ ] Pin/unpin notes

### **Phase 3: List Features**
- [ ] Add list items
- [ ] Check/uncheck items
- [ ] Drag & drop reorder
- [ ] Delete items
- [ ] Show completed items

### **Phase 4: Advanced Features**
- [ ] Search functionality
- [ ] Archive notes
- [ ] Trash (with restore)
- [ ] Collaborator management
- [ ] Real-time sync (Socket.IO)

### **Phase 5: PWA Features**
- [x] Service worker
- [x] Offline support
- [ ] Install prompt
- [ ] Push notifications (future)

---

## 📐 Component Structure

```
Dashboard
├── AppBar
│   ├── Logo
│   ├── SearchBar
│   └── UserMenu
├── Sidebar
│   ├── NavItem (Notes)
│   ├── NavItem (Archive)
│   └── NavItem (Trash)
└── MainContent
    ├── NoteInput
    └── NotesGrid (Masonry)
        └── NoteCard[]
            ├── Title
            ├── ListItems[]
            ├── ColorPicker
            └── Actions
```

---

## 🎨 Styling Strategy

### **MUI Components**
- AppBar, Drawer, IconButton
- TextField, Checkbox
- Menu, Dialog

### **Styled Components**
- Custom layouts
- Note cards
- Masonry grid
- Animations

### **Media Queries**
```css
@media (max-width: 600px) { /* Mobile */ }
@media (min-width: 600px) and (max-width: 960px) { /* Tablet */ }
@media (min-width: 960px) { /* Desktop */ }
```

---

## 🔧 State Management

### **Redux Slices**
1. **Auth Slice**
   - user, token, isAuthenticated

2. **Lists Slice**
   - lists[], currentList, loading, error

3. **UI Slice** (to be created)
   - sidebarOpen, searchQuery, viewMode

---

## 📱 PWA Features

### **Manifest**
- ✅ Name, icons, theme color
- ✅ Standalone display mode
- ✅ Start URL

### **Service Worker**
- ✅ Cache static assets
- ✅ Cache Google Fonts
- ✅ Offline fallback

### **Install Prompt**
- Show "Install App" button
- Handle beforeinstallprompt event

---

## 🚀 Next Steps

1. **Build Layout Components**
   - AppBar with search
   - Responsive sidebar
   - Main layout wrapper

2. **Build Note Components**
   - Note card with hover effects
   - Masonry grid layout
   - Color picker

3. **Implement CRUD**
   - Create notes
   - Edit notes
   - Delete notes

4. **Add List Features**
   - Checkboxes
   - Drag & drop
   - Completed items

5. **Polish & Optimize**
   - Animations
   - Loading states
   - Error handling

---

## 📊 Progress Tracker

- [x] Theme configuration
- [x] PWA setup
- [x] Redux store
- [x] API services
- [ ] Layout components (0/3)
- [ ] Note components (0/5)
- [ ] List components (0/3)
- [ ] Pages (0/4)
- [ ] PWA install prompt
- [ ] Testing

---

**Ready to start building!** 🎉

Let's begin with the layout components (AppBar, Sidebar, MainLayout).
