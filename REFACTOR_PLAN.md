# CSS Modules Refactor Plan

## Overview
Convert ClusterMarker from global CSS classes to CSS Modules with component co-location, creating a maintainable, scoped styling system with full CSS features.

## Current State
- Cluster styles are defined in `/src/frontend/src/index.css` (global)
- Component uses global CSS classes: `mood-cluster`, `mood-cluster-small/medium/large`, etc.
- HTML generation fallback relies on these global classes
- Hover effects and tooltips use pseudo-selectors (`:hover`, `::after`, `::before`)

## Target State
- Component uses CSS Modules with scoped class names
- Styles co-located with component in dedicated folder structure
- Full CSS features available (animations, pseudo-selectors, media queries)
- Zero global CSS pollution
- Works with both React rendering and HTML string generation for Leaflet
- TypeScript support for CSS class names

---

## Phase 1: Setup & Structure (Steps 1-3)

### Step 1: Create Component Folder Structure
**Goal**: Establish proper component organization
**Actions**:
- [ ] Create `/src/frontend/src/features/common/components/ClusterMarker/` directory
- [ ] Move `ClusterMarker.tsx` into the new directory
- [ ] Create `ClusterMarker.module.css` file
- [ ] Create `index.ts` for clean exports
- [ ] Update import paths in existing files

### Step 2: Extract and Migrate CSS Rules
**Goal**: Move global CSS rules to CSS Module
**Files**: 
- Source: `/src/frontend/src/index.css`
- Target: `/src/frontend/src/features/common/components/ClusterMarker/ClusterMarker.module.css`
**Actions**:
- [ ] Extract all `.mood-cluster*` CSS rules from global stylesheet
- [ ] Convert class names to CSS Module format (remove prefixes)
- [ ] Organize styles by component sections (base, sizes, variants)
- [ ] Add CSS Module-specific improvements (better organization)
- [ ] Keep global rules commented out as backup

### Step 3: Setup TypeScript Support
**Goal**: Enable typed CSS class names
**Actions**:
- [ ] Verify CSS Modules TypeScript support in build config
- [ ] Install `@types/css-modules` if needed
- [ ] Create type definitions for CSS classes (if auto-generation not available)
- [ ] Test CSS Module import with TypeScript

---

## Phase 2: Component Integration (Steps 4-6)

### Step 4: Update React Component
**Goal**: Convert ClusterMarker.tsx to use CSS Modules
**Files**: `/src/frontend/src/features/common/components/ClusterMarker/ClusterMarker.tsx`
**Actions**:
- [ ] Import CSS Module: `import styles from './ClusterMarker.module.css'`
- [ ] Replace global class names with CSS Module classes
- [ ] Update className concatenation for dynamic classes
- [ ] Handle conditional class application (size variants, cluster types)
- [ ] Test React component rendering

### Step 5: Update HTML Generation Fallback
**Goal**: Make HTML string generation use CSS Module classes
**Files**: `/src/frontend/src/features/common/utils/clustering.ts`
**Actions**:
- [ ] Import CSS Module in clustering utility
- [ ] Update `createHTMLElement` helper to use CSS Module classes
- [ ] Modify `createClusterHTMLFallback` to use scoped class names
- [ ] Ensure class name generation matches React component
- [ ] Test HTML string output with proper CSS Module classes

### Step 6: Handle Dynamic Styling
**Goal**: Manage dynamic styles (background, opacity, border-style)
**Options**:
- **Option A**: CSS Custom Properties (CSS Variables)
- **Option B**: Inline styles for dynamic values + CSS classes for static
- **Option C**: CSS-in-JS hybrid approach

**Recommended**: Option B - Hybrid approach
**Actions**:
- [ ] Use CSS Module classes for static styles (layout, animations, pseudo-selectors)
- [ ] Use inline styles for dynamic values (background, opacity, borderStyle)
- [ ] Create helper functions to combine both approaches cleanly
- [ ] Test dynamic styling with different cluster configurations

---

## Phase 3: Enhancement & Cleanup (Steps 7-9)

### Step 7: Add Advanced CSS Features
**Goal**: Leverage full CSS capabilities for better UX
**Files**: `/src/frontend/src/features/common/components/ClusterMarker/ClusterMarker.module.css`
**Actions**:
- [ ] Add smooth animations for cluster appearance (`@keyframes fadeIn`)
- [ ] Enhance hover effects with transitions
- [ ] Add responsive design with media queries if needed
- [ ] Implement advanced tooltip styling with better positioning
- [ ] Add loading/interaction states with CSS

### Step 8: Comprehensive Testing
**Goal**: Ensure all functionality works with CSS Modules
**Actions**:
- [ ] Test cluster display in development mode
- [ ] Test both homogeneous and mixed cluster types
- [ ] Test all size variants (small, medium, large)
- [ ] Test hover effects and tooltip functionality
- [ ] Test animations and transitions
- [ ] Verify HTML string generation works with Leaflet
- [ ] Test build process and CSS Module compilation
- [ ] Cross-browser testing for CSS features

### Step 9: Cleanup and Optimization
**Goal**: Remove global CSS and finalize migration
**Files**: `/src/frontend/src/index.css`
**Actions**:
- [ ] Remove all `.mood-cluster*` CSS rules from global stylesheet
- [ ] Search codebase for any remaining references to old class names
- [ ] Update any documentation or comments referencing old CSS
- [ ] Optimize CSS Module file (group related styles, add comments)
- [ ] Run final build to ensure no CSS conflicts
- [ ] Performance check - verify CSS bundle size is reasonable

---

## File Structure After Refactor
```
src/frontend/src/features/common/components/
├── ClusterMarker/
│   ├── ClusterMarker.tsx          # React component
│   ├── ClusterMarker.module.css   # Scoped styles
│   ├── index.ts                   # Clean exports
│   └── types.ts                   # Component-specific types (if needed)
```

## CSS Module Class Naming Convention
```css
/* ClusterMarker.module.css */
.cluster { /* Base cluster styles */ }
.small { /* Small size variant */ }
.medium { /* Medium size variant */ }
.large { /* Large size variant */ }
.emoji { /* Emoji cluster variant */ }
.mixed { /* Mixed cluster variant */ }
.emojiMain { /* Emoji content */ }
.countBadge { /* Count badge */ }
.count { /* Count text */ }
```

## Success Criteria
- [ ] ClusterMarker renders correctly with CSS Modules
- [ ] No global CSS dependencies for cluster styling
- [ ] CSS class names are scoped and don't conflict
- [ ] Full CSS features work (animations, hover, pseudo-selectors)
- [ ] Both React and HTML string generation use same scoped classes
- [ ] Build process compiles CSS Modules correctly
- [ ] TypeScript provides CSS class name autocomplete
- [ ] Performance is maintained or improved

## Benefits Achieved
- ✅ **Maintainable**: Styles co-located with component
- ✅ **Scoped**: No global CSS conflicts
- ✅ **Full CSS Power**: Animations, pseudo-selectors, media queries
- ✅ **Type Safety**: TypeScript support for class names
- ✅ **Performance**: Only loads CSS for used components
- ✅ **Developer Experience**: Better organization and discoverability

## Risk Mitigation
- **Backup Strategy**: Keep original global CSS commented out until migration complete
- **Rollback Plan**: Git commit after each step for granular rollback
- **Testing Strategy**: Test each component variant after each step
- **Build Validation**: Ensure CSS Modules compile correctly at each step

## Files to Modify
- **New**: `/src/frontend/src/features/common/components/ClusterMarker/ClusterMarker.module.css`
- **Modified**: `/src/frontend/src/features/common/components/ClusterMarker.tsx` 
- **Modified**: `/src/frontend/src/features/common/utils/clustering.ts`
- **Cleanup**: `/src/frontend/src/index.css`

## Estimated Timeline
- Phase 1: ~1-2 hours (Setup)
- Phase 2: ~3-4 hours (Integration)  
- Phase 3: ~2-3 hours (Enhancement & Cleanup)
- **Total**: ~6-9 hours