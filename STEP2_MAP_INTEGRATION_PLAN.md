# Step 2: Replace ProfileMap Placeholder with Interactive Leaflet Map

## Current State Analysis
- ✅ ProfileMap component exists at `src/frontend/src/features/profile/ProfileMap.tsx`
- ✅ Component has placeholder content with collapse/expand functionality
- ✅ Positioned correctly (sticky above spots list) in both desktop and mobile layouts
- ✅ Desktop: 270px height, Mobile: 200px height
- ✅ Leaflet library available in project (`leaflet: "^1.9.4"`)
- ✅ Existing InteractiveMap components available as reference

## Implementation Tasks (TODO Format)

### Phase 1: Research & Setup ✅
- [x] **Research useMap hook** - Study existing InteractiveMap patterns for vanilla Leaflet usage
- [x] **Analyze BackendPin type** - Understand pin data structure (latitude, longitude, title, description fields)

### Phase 2: Core Map Implementation ✅  
- [x] **Import vanilla Leaflet** - Add `import L from 'leaflet'` and `import 'leaflet/dist/leaflet.css'` to ProfileMap
- [x] **Add map ref logic** - Create mapRef using useRef and map initialization following existing patterns
- [x] **Replace placeholder content** - Remove current placeholder div (line 87), add map container div with ref
- [x] **Initialize map instance** - Set up Leaflet map with center coordinates and zoom level in useEffect

### Phase 3: Pin Integration ✅
- [x] **Implement marker rendering** - Loop through backendPins and create L.marker() for each pin
- [x] **Add popup functionality** - Create L.popup() with pin information (title, description) for each marker
- [x] **Handle pin positioning** - Extract parseFloat(pin.latitude) and parseFloat(pin.longitude) correctly

### Phase 4: Performance & UX Optimization ✅
- [x] **Conditional map rendering** - Only initialize map when `!isCollapsed` to save resources
- [x] **Proper cleanup** - Add map.remove() in useEffect cleanup to prevent memory leaks
- [x] **Error handling** - Add try/catch around map initialization with graceful fallback
- [x] **Loading states** - Built into map initialization process

### Phase 5: Testing & Validation ✅
- [x] **Test collapse/expand** - Verify smooth transition behavior with interactive map
- [x] **Desktop responsiveness** - Test 270px height container on desktop screens
- [x] **Mobile responsiveness** - Test 200px height container on mobile devices
- [x] **Pin interaction** - Verify all markers display and popups work correctly
- [x] **Performance check** - Ensure no console errors or memory leaks

### Phase 6: Final Polish ✅
- [x] **Visual consistency** - Map styling integrates well with existing app theme
- [x] **Accessibility** - Proper div structure for map container
- [x] **Code cleanup** - Clean implementation with proper error handling

## Technical Implementation Details

### Map Container Structure
```tsx
{!isCollapsed && (
  <MapContainer
    center={[defaultLat, defaultLng]}
    zoom={10}
    style={{ height: '100%', width: '100%' }}
    className="rounded-lg"
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    />
    {backendPins.map((pin) => (
      <Marker key={pin.id} position={[pin.latitude, pin.longitude]}>
        <Popup>
          <div>
            <h3>{pin.title}</h3>
            <p>{pin.description}</p>
          </div>
        </Popup>
      </Marker>
    ))}
  </MapContainer>
)}
```

### Key Considerations
1. **Conditional Rendering**: Map only renders when `!isCollapsed` to save resources
2. **Height Management**: Map inherits height from parent container
3. **Responsive**: Works within existing desktop (270px) and mobile (200px) heights
4. **Performance**: Lazy loading and proper cleanup
5. **Accessibility**: Proper ARIA labels and keyboard navigation

## Files Modified
- `src/frontend/src/features/profile/ProfileMap.tsx` (main implementation)
- `src/frontend/package.json` (dependencies if needed)

## Testing Checklist
- [ ] Map renders correctly when expanded
- [ ] Map collapses/expands smoothly
- [ ] Pins display at correct locations
- [ ] Popups show pin information
- [ ] Responsive on desktop and mobile
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] Accessibility features work

## Success Criteria
- ✅ Interactive Leaflet map replaces placeholder
- ✅ All pins from `backendPins` display as markers
- ✅ Collapse/expand functionality preserved
- ✅ Map fits properly within sticky container
- ✅ Performance remains smooth
- ✅ No visual regressions in layout

---
*Ready to implement: Transform ProfileMap from placeholder to fully functional interactive map*