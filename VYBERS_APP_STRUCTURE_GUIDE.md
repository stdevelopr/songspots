# Vybers App Structure Guide

This document outlines the architectural patterns, conventions, and structures used in the Vybers application. **All new features must follow these established patterns.**

## 🏗️ Project Architecture

### Core Structure
```
src/frontend/src/
├── App.tsx                    # Main app component with routing
├── main.tsx                   # App entry point
├── providers/                 # Global providers (AuthProvider)
└── features/                  # Feature-based organization
    ├── common/                # Shared utilities and components
    ├── profile/               # User profile management
    ├── vibes/                 # Vibe creation and management
    ├── map/                   # Interactive map functionality
    ├── admin/                 # Admin functionality
    ├── dev/                   # Development tools
    └── file-storage/          # File upload/management
```

### Feature-Based Organization
Each feature follows this consistent structure:

```
features/[feature-name]/
├── components/                # React components
│   ├── layout/               # Layout components (Desktop/Mobile)
│   ├── shared/               # Reusable components within feature
│   ├── forms/                # Form components
│   ├── modals/               # Modal dialogs
│   └── index.ts              # Export barrel
├── hooks/                    # Custom hooks
│   ├── index.ts              # Export barrel with organized exports
│   └── use[FeatureName].ts   # Feature-specific hooks
├── types/                    # TypeScript types and interfaces
├── utils/                    # Feature-specific utilities
├── constants/                # Feature constants
└── styles/                   # Feature-specific styles
```

## 📦 Component Patterns

### 1. **Responsive Component Pattern**
All UI components use the ResponsiveComponent wrapper for device-specific rendering:

```tsx
<ResponsiveComponent showOnDesktop hideOnTablet hideOnMobile>
  <DesktopLayout {...props} />
</ResponsiveComponent>

<ResponsiveComponent showOnMobile showOnTablet hideOnDesktop>
  <MobileLayout {...props} />
</ResponsiveComponent>
```

### 2. **Layout Components**
Major features have separate desktop and mobile layouts:
- `[Feature]DesktopLayout.tsx`
- `[Feature]MobileLayout.tsx`

### 3. **Component Composition**
Complex features are composed of smaller, focused components:

```tsx
// Example: ProfilePage composition
const ProfilePage = ({ userId, onBackToMap }) => {
  const profileState = useProfileState({ userId });
  const profilePicture = useProfilePicture({ ... });
  const vibeOperations = useVibeOperations({ ... });
  const profileActions = useProfileActions({ ... });

  return (
    <>
      <ResponsiveComponent showOnDesktop>
        <ProfileDesktopLayout {...allProps} />
      </ResponsiveComponent>
      <ResponsiveComponent showOnMobile>
        <ProfileMobileLayout {...allProps} />
      </ResponsiveComponent>
    </>
  );
};
```

### 4. **Props Interface Pattern**
All components have clearly defined TypeScript interfaces:

```tsx
interface ComponentNameProps {
  // Required props first
  userId: string;
  onAction: (data: DataType) => void;
  
  // Optional props after
  className?: string;
  isLoading?: boolean;
}
```

## 🎣 Hook Patterns

### 1. **Composed Hooks Pattern**
Complex features use multiple specialized hooks composed together:

```tsx
// Main hook composes smaller, focused hooks
export const useVibeOperations = ({ visibleVibes }) => {
  const modalOperations = useVibeModals();
  const vibeSelection = useVibeSelection();
  const errorHandler = useVibeErrorHandler();
  const keyboardNav = useVibeKeyboardNavigation({ ... });

  // Compose and return combined functionality
  return {
    // Modal operations
    ...modalOperations,
    // Selection operations  
    ...vibeSelection,
    // Error handling
    ...errorHandler,
  };
};
```

### 2. **Hook Organization**
Each feature has an `index.ts` that organizes exports:

```tsx
// features/profile/hooks/index.ts
// Main hooks
export { useVibeOperations } from './useVibeOperations';
export { useProfileState } from './useProfileState';

// Specialized hooks  
export { useVibeModals } from './useVibeModals';
export { useVibeSelection } from './useVibeSelection';

// Types
export type { UseVibeOperationsProps } from './useVibeOperations.types';
```

### 3. **Hook Naming Conventions**
- `use[FeatureName]` for main feature hooks
- `use[FeatureName][Operation]` for specialized operations
- `use[FeatureName][Operation].helpers.ts` for helper functions
- `use[FeatureName][Operation].types.ts` for type definitions

### 4. **State Management in Hooks**
Hooks manage related state together:

```tsx
export const useProfileState = ({ userId }) => {
  // Queries
  const { data: userProfile, isLoading } = useGetUserProfile();
  
  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  
  // Computed values
  const isViewingOwnProfile = !userId;
  const displayName = getDisplayName();
  
  return {
    // Data
    userProfile,
    isLoading,
    // State
    isEditing,
    setIsEditing,
    // Computed
    isViewingOwnProfile,
    displayName,
    // Actions
    getDisplayName,
  };
};
```

## 🗂️ State Management

### 1. **React Query for Server State**
All backend data uses React Query:

```tsx
// In hooks/useQueries.ts
export const useGetAllPins = () => 
  useQuery({
    queryKey: ['allPins'],
    queryFn: async () => {
      const actor = await getActor();
      return actor.getAllPins();
    },
  });
```

### 2. **Local State in Components/Hooks**
Component-specific state stays in useState:

```tsx
// Modal visibility, form data, UI state
const [showModal, setShowModal] = useState(false);
const [formData, setFormData] = useState(initialState);
```

### 3. **Shared State Patterns**
- URL state for navigation (`useNavigate`, `useParams`)
- Context for global UI state (ResponsiveProvider)
- Prop drilling for component communication

## 🎨 Styling Patterns

### 1. **Tailwind CSS Primary**
Use Tailwind classes for most styling:

```tsx
<div className="h-full min-h-0 bg-gray-50 flex flex-col text-gray-800">
```

### 2. **CSS Modules for Complex Styles**
Use CSS modules for component-specific complex styles:

```tsx
import styles from './Component.module.css';
<div className={styles.mapRoot} />
```

### 3. **Responsive Styling**
Use ResponsiveComponent for different layouts, not CSS media queries:

```tsx
// ❌ Don't do this
<div className="hidden md:block lg:hidden">

// ✅ Do this  
<ResponsiveComponent showOnTablet hideOnDesktop hideOnMobile>
```

## 📁 File Organization Rules

### 1. **Import/Export Patterns**
- Use barrel exports (`index.ts`) for clean imports
- Group exports by category in index files
- Import from feature root: `import { useProfileState } from '@features/profile'`

### 2. **File Naming Conventions**
- Components: `PascalCase.tsx`
- Hooks: `use[Name].ts`
- Types: `[name].types.ts`  
- Helpers: `[name].helpers.ts`
- Constants: `[name].constants.ts`

### 3. **Directory Structure Rules**
- Group by feature, not by file type
- Keep related files close together
- Use consistent naming across features

## 🔗 Integration Patterns

### 1. **Backend Integration**
```tsx
// All backend calls through React Query hooks
const { data: vibes, isLoading } = useGetAllPins();
const createVibeMutation = useCreatePin();

// Actor pattern for backend calls
const actor = await getActor();
const result = await actor.createPin(pinData);
```

### 2. **Authentication Integration**
```tsx
// Use Internet Identity hook
const { identity, login, clear } = useInternetIdentity();
const isAuthenticated = !!identity;
const currentUser = identity?.getPrincipal().toString();
```

### 3. **Map Integration**
```tsx
// Leaflet map with custom hooks
const { mapRef, mapInstance } = useMap();
const { userLocation, status } = useLocation();
```

## ✅ Development Standards

### 1. **TypeScript Requirements**
- All props must have interfaces
- Avoid `any` types
- Use proper generic constraints
- Export types from feature index files

### 2. **Error Handling**
- Use error boundaries for React errors
- Handle async errors in hooks
- Provide user-friendly error messages
- Log errors for debugging

### 3. **Performance**
- Use React.memo for expensive components
- Implement proper dependency arrays
- Avoid prop drilling (max 3 levels)
- Use useCallback for passed functions

### 4. **Testing Considerations**
- Write testable hooks
- Avoid complex nested components
- Separate business logic from UI logic
- Use dependency injection for testability

## 🚀 Adding New Features

### Step 1: Create Feature Structure
```bash
mkdir -p src/features/[feature-name]/{components,hooks,types,utils}
mkdir -p src/features/[feature-name]/components/{layout,shared,forms,modals}
```

### Step 2: Create Index Files
Create `index.ts` files in components and hooks directories with organized exports.

### Step 3: Follow Component Patterns
- Create responsive desktop/mobile layouts
- Use composition over inheritance
- Implement proper TypeScript interfaces

### Step 4: Follow Hook Patterns  
- Create focused, single-responsibility hooks
- Compose hooks for complex functionality
- Use proper state management patterns

### Step 5: Integration
- Add to main App routing if needed
- Export from feature index
- Update navigation/links as needed

## 🔍 Code Review Checklist

- [ ] Follows established folder structure
- [ ] Uses responsive component pattern
- [ ] Has proper TypeScript interfaces
- [ ] Implements error handling
- [ ] Uses React Query for server state
- [ ] Follows naming conventions
- [ ] Has proper index.ts exports
- [ ] Uses composition over complex props
- [ ] Implements mobile and desktop layouts
- [ ] Uses consistent styling approach

---

**Remember: Consistency is key. Always follow these established patterns to maintain codebase coherence and developer productivity.**