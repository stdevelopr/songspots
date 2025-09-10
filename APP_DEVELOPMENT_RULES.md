# Vybers App Development Rules

**🚨 MANDATORY: All new features and modifications MUST follow these rules exactly. No exceptions.**

## 📁 File Structure Rules

### Feature Organization
```
src/features/[feature-name]/
├── components/
│   ├── layout/           # [Feature]DesktopLayout.tsx + [Feature]MobileLayout.tsx
│   ├── shared/           # Reusable components within feature
│   ├── forms/            # Form components
│   ├── modals/           # Modal dialogs
│   └── index.ts          # ✅ REQUIRED: Export barrel
├── hooks/
│   ├── use[Feature].ts   # Main feature hook
│   ├── use[Feature][Action].ts  # Specialized hooks
│   ├── [hook].types.ts   # Type definitions
│   ├── [hook].helpers.ts # Helper functions
│   └── index.ts          # ✅ REQUIRED: Organized exports
├── types/                # Feature-specific types
├── utils/                # Feature utilities
├── constants/            # Feature constants
└── styles/               # Feature styles (if needed)
```

### Naming Conventions
- **Components**: `PascalCase.tsx` (e.g., `FilterPanel.tsx`)
- **Hooks**: `use[Name].ts` (e.g., `useVibeFilters.ts`)
- **Types**: `[name].types.ts` (e.g., `filters.types.ts`)
- **Helpers**: `[name].helpers.ts` (e.g., `filterUtils.helpers.ts`)

## 🧩 Component Rules

### 1. **MANDATORY: Responsive Pattern**
Every UI component MUST use responsive layouts:

```tsx
// ✅ CORRECT
<ResponsiveComponent showOnDesktop hideOnTablet hideOnMobile>
  <[Feature]DesktopLayout {...props} />
</ResponsiveComponent>

<ResponsiveComponent showOnMobile showOnTablet hideOnDesktop>
  <[Feature]MobileLayout {...props} />
</ResponsiveComponent>
```

```tsx
// ❌ WRONG - Never do this
<div className="hidden md:block">Desktop content</div>
<div className="block md:hidden">Mobile content</div>
```

### 2. **MANDATORY: TypeScript Interfaces**
Every component MUST have a proper interface:

```tsx
// ✅ CORRECT
interface ComponentNameProps {
  // Required props first
  userId: string;
  onAction: (data: DataType) => void;
  
  // Optional props after  
  className?: string;
  isLoading?: boolean;
}

const ComponentName: React.FC<ComponentNameProps> = ({ ... }) => {
```

### 3. **MANDATORY: Component Composition**
Complex components MUST be composed from smaller parts:

```tsx
// ✅ CORRECT - Main component composes smaller pieces
const FeaturePage: React.FC<Props> = (props) => {
  const featureState = useFeatureState(props);
  const featureActions = useFeatureActions(props);
  
  return (
    <>
      <ResponsiveComponent showOnDesktop>
        <FeatureDesktopLayout {...featureState} {...featureActions} />
      </ResponsiveComponent>
      <ResponsiveComponent showOnMobile>
        <FeatureMobileLayout {...featureState} {...featureActions} />
      </ResponsiveComponent>
    </>
  );
};
```

## 🎣 Hook Rules

### 1. **MANDATORY: Hook Composition Pattern**
Complex features MUST compose multiple focused hooks:

```tsx
// ✅ CORRECT - Main hook composes smaller hooks
export const useFeatureOperations = (props: Props) => {
  const stateHook = useFeatureState(props);
  const actionsHook = useFeatureActions(props);
  const uiHook = useFeatureUI(props);
  
  return {
    // Compose all functionality
    ...stateHook,
    ...actionsHook,
    ...uiHook,
  };
};
```

### 2. **MANDATORY: Focused Hook Responsibility**
Each hook MUST have a single, clear responsibility:

```tsx
// ✅ CORRECT - Each hook handles one concern
export const useFeatureState = () => { /* Only state management */ };
export const useFeatureActions = () => { /* Only actions/handlers */ };
export const useFeatureUI = () => { /* Only UI-related logic */ };
```

### 3. **MANDATORY: Hook Index Exports**
Every hooks folder MUST have organized index.ts:

```tsx
// features/[feature]/hooks/index.ts
// ✅ REQUIRED STRUCTURE

// Main hooks
export { useFeatureOperations } from './useFeatureOperations';
export { useFeatureState } from './useFeatureState';

// Specialized hooks
export { useFeatureActions } from './useFeatureActions';
export { useFeatureUI } from './useFeatureUI';

// Types - MUST export types too
export type { FeatureProps, FeatureState } from './useFeature.types';
```

## 🔄 State Management Rules

### 1. **MANDATORY: React Query for Server State**
ALL backend data MUST use React Query:

```tsx
// ✅ CORRECT
export const useGetFeatureData = () => 
  useQuery({
    queryKey: ['featureData'],
    queryFn: async () => {
      const actor = await getActor();
      return actor.getFeatureData();
    },
  });

// Mutations
export const useCreateFeature = () =>
  useMutation({
    mutationFn: async (data: FeatureData) => {
      const actor = await getActor();
      return actor.createFeature(data);
    },
  });
```

### 2. **MANDATORY: Local State in Hooks**
Component state MUST be managed in custom hooks:

```tsx
// ✅ CORRECT - State in hook
export const useFeatureState = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);
  
  return { isOpen, setIsOpen, data, setData };
};
```

```tsx
// ❌ WRONG - State scattered in component
const Component = () => {
  const [isOpen, setIsOpen] = useState(false); // ❌ Move to hook
  const [data, setData] = useState(null);      // ❌ Move to hook
```

## 🎨 Styling Rules

### **Hybrid Approach: Tailwind + CSS Modules**

### 1. **Use Tailwind for:**
- **Layout utilities**: `flex`, `grid`, spacing (`p-4`, `mx-auto`), sizing (`w-full`, `h-screen`)
- **Design system**: Colors (`bg-gray-50`, `text-blue-600`), typography (`text-lg`, `font-semibold`)
- **Simple states**: `hover:bg-blue-700`, `focus:ring-2`, `disabled:opacity-50`
- **Responsive utilities**: `md:flex-row`, `lg:grid-cols-3`
- **Quick prototyping**: Simple components and layouts

```tsx
// ✅ CORRECT - Tailwind for utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg">
  <h3 className="text-lg font-semibold text-gray-800">Title</h3>
  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
    Action
  </button>
</div>
```

### 2. **Use CSS Modules for:**
- **Complex components** with multiple related styles and semantic meaning
- **Component-specific patterns** that will be reused within the component
- **Complex animations**, transitions, or pseudo-elements
- **When semantic class names** improve code readability and debugging

```tsx
// ✅ CORRECT - CSS Modules for complex components
import styles from './FilterPanel.module.css';

<div className={styles.filterPanel}>
  <div className={styles.filterPanel__header}>
    <h3 className="text-lg font-semibold">Filters</h3>
  </div>
  <div className={styles.filterPanel__content}>
    <div className={styles.filterGroup}>
      {/* Filter options */}
    </div>
  </div>
</div>
```

### 3. **Best Practice: Combine Both**
Use CSS Modules for component structure and Tailwind for utilities:

```tsx
// ✅ RECOMMENDED - Hybrid approach
import styles from './VibeCard.module.css';

<div className={`${styles.vibeCard} mb-4 transition-transform hover:scale-105`}>
  <div className={`${styles.vibeCard__header} border-gray-200`}>
    <span className="text-sm font-medium text-blue-600">{mood}</span>
  </div>
  <div className={styles.vibeCard__content}>
    <h4 className="text-base font-semibold text-gray-800">{name}</h4>
    <p className="text-sm text-gray-600 mt-1">{description}</p>
  </div>
</div>
```

### 4. **Examples from Existing Codebase**
Your app already successfully uses this hybrid approach:

```tsx
// ✅ Map components use CSS Modules for complex layouts
import styles from './MapContainer.module.css';
<div className={`${styles.mapRoot} relative w-full h-full`} />

// ✅ Simple components use Tailwind utilities  
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
```

### 5. **NO Inline Styles**
```tsx
// ❌ WRONG - Never use inline styles
<div style={{ color: 'red', fontSize: '16px' }}>

// ✅ CORRECT - Use Tailwind or CSS Modules
<div className="text-red-500 text-base">              // Tailwind
<div className={styles.errorText}>                   // CSS Modules
```

## 📦 Import/Export Rules

### 1. **MANDATORY: Barrel Exports**
Every feature folder MUST have index.ts with organized exports:

```tsx
// features/[feature]/index.ts
// ✅ REQUIRED STRUCTURE

// Components
export { default as FeaturePage } from './FeaturePage';
export { FeatureDesktopLayout } from './components/layout/FeatureDesktopLayout';

// Hooks  
export * from './hooks';

// Types
export type { FeatureData, FeatureProps } from './types';

// Constants
export { FEATURE_CONSTANTS } from './constants';
```

### 2. **MANDATORY: Import from Feature Root**
Always import from feature root, never deep imports:

```tsx
// ✅ CORRECT
import { useFeatureOperations, FeatureData } from '@features/feature';

// ❌ WRONG
import { useFeatureOperations } from '@features/feature/hooks/useFeatureOperations';
```

### 3. **MANDATORY: Use Module Aliases (no ../../ across features)**
- Always use path aliases when importing across features or from shared code:
  - `@features/*` → `src/frontend/src/features/*`
  - `@common/*` → `src/frontend/src/features/common/*`
  - `@backend/*` → `src/frontend/src/backend/*`
- Examples:
  - `import { MusicEmbed } from '@common';`
  - `import type { Vibe } from '@features/map/types/map';`
  - `import { createActor } from '@backend';`
- Do not deep‑import internals from another feature (import only via the feature root barrel).

## 🔧 Integration Rules

### 1. **MANDATORY: Backend Integration Pattern**
```tsx
// ✅ CORRECT - Always through React Query hooks
const { data, isLoading } = useGetFeatureData();
const createMutation = useCreateFeature();

// In mutation
const handleCreate = async (data: FeatureData) => {
  try {
    await createMutation.mutateAsync(data);
  } catch (error) {
    // Handle error
  }
};
```

### 2. **MANDATORY: Authentication Pattern**
```tsx
// ✅ CORRECT - Standard auth integration
const { identity, login, clear } = useInternetIdentity();
const isAuthenticated = !!identity;
const currentUser = identity?.getPrincipal().toString();
```

#### Internet Identity URL Source of Truth
- Use the shared helper `getInternetIdentityUrl()` from `@common/constants/ii`.
- Mainnet must use `https://id.ai`. Local must use `http://<CANISTER_ID_INTERNET_IDENTITY>.localhost:4943`.
- Never hardcode II URLs in components or hooks; import the helper instead.
- Ensure CSP allows `https://id.ai` in `connect-src` and `frame-src`.

## ⚠️ Error Handling Rules

### 1. **MANDATORY: Error Boundaries**
Complex features MUST handle errors:

```tsx
// ✅ CORRECT - Error handling in hooks
export const useFeatureErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleAsyncOperation = async (operation: () => Promise<void>) => {
    try {
      await operation();
      setError(null);
    } catch (err) {
      setError('User-friendly error message');
    }
  };
  
  return { error, handleAsyncOperation, hideError: () => setError(null) };
};
```

## 🚦 Development Workflow

### 1. **Before Starting Any Feature**
- [ ] Read this file completely
- [ ] Check existing similar features for patterns
- [ ] Plan the hook composition structure
- [ ] Plan the component composition structure

### 2. **During Development**
- [ ] Create proper folder structure first
- [ ] Write TypeScript interfaces before implementation
- [ ] Create responsive layouts (desktop + mobile)
- [ ] Use hook composition pattern
- [ ] Follow naming conventions exactly

### 3. **Before Submitting**
- [ ] All components have proper interfaces
- [ ] All hooks are properly composed
- [ ] Responsive layouts implemented
- [ ] Proper import/export structure
- [ ] Uses `@features`, `@common`, `@backend` aliases (no cross‑feature ../../)
- [ ] Error handling implemented
- [ ] No TypeScript errors
- [ ] Follows all rules in this file

## 🔍 Code Review Checklist

Every code review MUST verify:
- [ ] ✅ Follows file structure rules
- [ ] ✅ Uses responsive component pattern  
- [ ] ✅ Has proper TypeScript interfaces
- [ ] ✅ Uses hook composition pattern
- [ ] ✅ Implements error handling
- [ ] ✅ Uses React Query for server state
- [ ] ✅ Follows naming conventions
- [ ] ✅ Has proper index.ts exports
- [ ] ✅ No deep imports (uses barrel exports)
- [ ] ✅ Uses module aliases (`@features`, `@common`, `@backend`)
- [ ] ✅ Uses Tailwind for styling
- [ ] ✅ Mobile and desktop layouts exist

---

## 🧱 Feature Boundaries
- Shared UI, hooks, and utilities go in `@common`. Do not duplicate components or hooks in multiple features.
- A feature may use other features only via their public barrel (`@features/xyz`). Never import deep internals of another feature.
- If something is used by more than one feature, move it to `@common`.

Examples
- ProfileButton lives in `@common/components/ProfileButton`. Do not maintain per‑feature copies.
- Actor and auth hooks live under `@common/hooks`. Do not create root‑level stubs.

## 🗺️ Map Rules
- Use the shared map building blocks from the map feature:
  - Marker rendering: `useVibeLayer` from `@features/vibes`.
    - Supports clustering thresholds, click callbacks, highlight/focus states via options.
    - Provides `getIcon` to inject feature‑specific icon styles.
  - Type transforms: `backendVibesToVibes` from `@features/map/utils/transform`.
  - Map constants: `MAP_CONFIG`, `UI_CONFIG` from `@features/map/utils/constants`.
  - Geo helpers: `parseCoordinates`, `calculateMapCenter` from `@features/map/utils/geo`.
- Profile map must render markers via `useVibeLayer` instead of hand‑rolled marker code.
- Do not duplicate map constants or geo math inside profile or other features.

## 🧭 Dev/Playground Code
- Keep demos under `features/dev` (or `playground`) and guard usage with `import.meta.env.DEV` if they might be imported.
- Dev code must not ship in production bundles.

## 🔐 Auth and Actor
- Use `ic-use-internet-identity` provider in `main.tsx` and read II URL from `getInternetIdentityUrl()`.
- Use the consolidated auth hook in `@common/hooks/useAuth` via the `AuthProvider` context.
- Use the unified actor hook from `@common/hooks/useActor`; do not create feature‑specific actor initializers.

---

## 🚨 CRITICAL REMINDERS

1. **NO EXCEPTIONS**: These rules MUST be followed for every feature
2. **CONSISTENCY**: Always check existing code for patterns before creating new ones
3. **RESPONSIVE FIRST**: Every UI component needs desktop AND mobile layouts
4. **HOOK COMPOSITION**: Complex logic MUST be broken into focused, composed hooks
5. **TYPESCRIPT**: All props, state, and functions MUST be properly typed

**Failure to follow these rules will result in code rejection and refactoring requirements.**
