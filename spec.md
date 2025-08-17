# Interactive Map with Pin Markers and Music Links

## Overview

A simple interactive map application that allows users to click anywhere on the map to add pin markers at those locations. Each pin can be associated with a name, description, and music link from YouTube or Spotify. The app automatically centers on the user's current location when loaded and provides a prominent button to recenter to the user's location at any time. Pin data is saved to the backend database for persistence with privacy controls - pins can be public (visible to all users) or private (visible only to the owner). Users can create and manage their personal profiles with custom information through a dedicated profile page, including profile pictures and a comprehensive list of their created pins. Users can delete pins they have created through the profile page or pin popups. Pin information popups feature improved styling for a cleaner, more visually appealing appearance, and users can edit their own pins directly from the popup interface. Users can view other users' profiles with attractive layouts showing their public information and pins. Users can edit pin details directly from their profile page as well as from the map.

## Core Features

### Initial Loading and Map Display

- Display a loading indicator when the application first loads, hard refreshes, or is accessed for the first time
- The loading indicator remains visible until ALL of the following conditions are met in sequence:
  - The map is fully loaded and initialized
  - All pins are retrieved from the backend and displayed on the map
  - The browser geolocation API is called to request the user's current location
  - The application waits for the location response (either success or failure)
  - If location permission is granted, the map must be successfully centered on the user's current location
  - If location permission is denied or unavailable, the loading process continues with the default view
- The loading process follows this mandatory sequence on every first load, hard refresh, or initial access:
  - Map initialization begins
  - Pin data is retrieved from the backend
  - Browser geolocation API is automatically called to get user's current location (no user interaction required)
  - The application waits for the location response (either success or failure) before proceeding
  - If location permission is granted and location is obtained, the map must be centered on the user's location before the loading indicator disappears
  - If location permission is denied, unavailable, or times out, the loading indicator disappears after the map and pins are loaded with the default view
- The loading indicator prevents user interaction with the map until everything is fully ready and properly positioned
- Once loading is complete, display an interactive map that users can navigate (zoom, pan)
- On every first load, hard refresh, or initial access, automatically request user's current location using browser geolocation API without requiring user interaction
- The location request and processing must occur consistently on first loads and hard refreshes, ensuring the map always attempts to center on the user's location
- If location permission is granted, center the map on the user's current location and wait for the centering to complete before hiding the loading indicator
- If location permission is denied or unavailable, display a reasonable default area (e.g., world view or specific region)
- Display a special "You are here" marker at the user's current location when geolocation is successful
- The "You are here" marker should be visually distinct from regular pin markers
- The automatic location request, processing, and centering must occur on every first load and hard refresh, ensuring consistent behavior across these access methods
- The loading indicator must never get stuck in a loading state and must always be dismissed once all ready conditions are met
- Implement robust state transition management to ensure the loading overlay disappears as soon as the map is ready and centered, regardless of first load, reload, or hard refresh scenarios

### My Location Button with Pin Visibility

- Display a prominent "My Location" button positioned above the map
- The button should be visually distinct, easy to find, and clearly labeled
- When clicked, the button performs the following actions:
  - Requests fresh location data from the browser geolocation API
  - Recenters the map to the user's current location
  - Updates the "You are here" marker position if location is successfully obtained
  - Ensures all pins remain visible and properly displayed after recentering
  - Prevents any timing issues that could cause pins to disappear or not load properly after the location change
- The button should be accessible and functional regardless of whether initial location permission was granted
- If location permission is denied when the button is clicked, handle the error gracefully with appropriate user feedback
- After recentering, verify that all pins that should be visible (public pins and user's private pins) are properly displayed on the map

### Header

- Display "Music Memories" as the main title in the header with modern, visually appealing styling
- The title should feature updated typography, attractive color scheme, and enhanced layout design
- The styling should make the title stand out as a modern, polished application header
- The header should have a compact, reduced height design
- Include a login option in the header using Internet Identity authentication
- The login functionality should allow users to authenticate and display their authentication status
- Include a profile button in the header for authenticated users to navigate to their profile page

### Pin Management with Music Links and Privacy Controls

- Any authenticated user can click anywhere on the map to add pin markers at that exact location
- When a user clicks on the map, a modal dialog appears with input fields for:
  - Pin name (text input)
  - Pin description (text area)
  - Music link (text input for YouTube or Spotify links)
  - Privacy toggle (public/private selection)
- All fields in the modal are optional, with pins defaulting to public visibility
- The privacy toggle allows users to choose whether the pin is visible to everyone (public) or only to themselves (private)
- Users can submit the form or cancel the pin creation
- If the user submits, the pin is created with the provided information and privacy setting, then saved to the backend
- After successful pin creation, the new pin must immediately appear on the map without requiring a page refresh
- If the user cancels, no pin is created
- Each pin should be visually distinct and clearly visible on the map
- Private pins should be visually distinguished from public pins (e.g., with a lock icon or different styling)
- Pins remain visible and interactive throughout the user session
- No limit on the number of pins that can be added
- Regular pin markers are separate from the special "You are here" marker
- The modal must reliably open every time the map is clicked by ensuring proper state management
- When the modal is closed (either by submission or cancellation), both `showMusicModal` and `pendingPin` state variables must be completely reset to their initial values
- The map click handler must properly initialize both `showMusicModal` and `pendingPin` states anew on every click to ensure consistent behavior across multiple pin creation attempts
- The modal state management must guarantee that after closing the modal, subsequent map clicks will always trigger the modal to open again without any state conflicts

### Pin Visibility and Privacy

- All public pins are visible to all users on the map
- Private pins are only visible to their owner
- When loading the map, the frontend displays:
  - All public pins from all users
  - All private pins belonging to the authenticated user (if logged in)
- Private pins are clearly marked with visual indicators (such as a lock icon or different color/style)
- Non-authenticated users can only see public pins

### Pin Interaction, Editing, and Deletion

- Users can click on existing pins to view their information in an improved, visually appealing popup
- The popup features enhanced styling with:
  - Clean, modern design with improved typography and spacing
  - Better visual hierarchy and organization of information
  - Attractive color scheme and layout
  - Professional appearance with polished visual elements
- The popup displays:
  - Pin name (if provided)
  - Pin description (if provided)
  - Owner's name with a clickable link to their profile page
  - A button to open the music link in a new tab (if a music link was provided)
  - Privacy status indicator for the pin owner
  - An edit button for pins owned by the current authenticated user
  - A delete button for pins owned by the current authenticated user
- If no name is provided, display a default label
- If no description is provided, either hide the description section or show a placeholder
- If no music link is provided, hide the music button
- Music links should open in a new tab when the button is clicked
- Pin owners can see privacy status of their own pins in the popup
- The owner's name link navigates to their profile page when clicked
- Pin owners can edit their pins directly from the popup:
  - When the edit button is clicked, the popup switches to edit mode
  - Edit mode displays input fields for name, description, and music link with current values pre-filled
  - Users can modify any of these fields
  - Edit mode includes save and cancel buttons
  - When save is clicked, the updated pin data is sent to the backend and the pin is updated
  - The popup immediately reflects the updated information after successful save
  - When cancel is clicked, the popup returns to view mode without saving changes
  - The edit functionality only appears for pins owned by the current authenticated user
- When a user clicks the delete button on their own pin:
  - A confirmation dialog appears to confirm the deletion
  - If confirmed, the pin is deleted from the backend
  - The pin is immediately removed from the map display
  - The pin is removed from the user's profile pin list
- Only the pin owner can see and use the edit and delete buttons for their pins
- The pin popup must reliably open every time a pin is clicked by ensuring proper state management
- When the pin popup is closed, all popup-related state variables must be completely reset to their initial values
- The pin click handler must properly initialize popup state anew on every pin click to ensure consistent behavior
- The popup state management must guarantee that after closing a popup, subsequent pin clicks will always trigger the popup to open again without any state conflicts
- Pin popup functionality must work reliably across multiple interactions, allowing users to click the same pin or different pins repeatedly and always see the popup appear as expected

### Authentication

- Users can authenticate using Internet Identity through the login option in the header
- Display the user's authentication status in the header
- Provide appropriate login and logout functionality
- Handle authentication state changes appropriately
- Authentication is required to create pins and see private pins

### User Profile Management

- Authenticated users can access their own profile through a profile button in the header
- Clicking the profile button navigates to a dedicated profile page showing their own profile
- Users can also view other users' profiles by clicking on owner names in pin popups
- The profile page is a separate view that replaces the map interface
- The profile page displays different content based on whether viewing own profile or another user's profile:

#### Own Profile View

- The profile page allows users to create, view, and edit their personal profile
- Profile information includes user name, profile picture, and other metadata fields
- The profile page displays the user's current profile information including their profile picture
- Users can upload and change their profile picture through the profile page interface
- Users can edit their profile information through an edit interface on the profile page
- Profile changes including profile picture updates are saved to the backend and persist across sessions
- Users can navigate back to the map from the profile page
- The map interface is completely hidden when viewing the profile page

#### Other User's Profile View

- When viewing another user's profile (accessed through pin popup links), the profile page displays:
  - The user's name prominently displayed
  - The user's profile picture if available
  - An attractive, well-designed layout that presents the profile information in an informative and visually appealing manner
  - A clear list of all public pins created by that user
  - Professional styling that makes the profile feel complete and engaging
- The layout should be improved with enhanced styling for better visual presentation
- The profile information should be organized in a clear, attractive manner
- Only public pins are shown when viewing other users' profiles
- Users cannot edit other users' profiles or see their private pins
- Navigation back to the map is available from other users' profile pages
- The user's name and profile picture are fetched from the backend using their principal identifier
- The profile page displays the fetched user information prominently at the top of the page

### Pin History and Management

- The profile page displays a comprehensive list of pins based on the profile being viewed:

#### Own Profile Pin List

- Shows all pins created by the current authenticated user (both public and private)
- The pin list shows complete details for each pin including:
  - Pin name
  - Pin description
  - Location coordinates or address
  - Privacy status (public/private)
  - Creation date or timestamp
  - Music link (if provided)
  - A delete button for each pin
  - An edit button for each pin
  - A "View on Map" button for each pin
- Users can view all their pins in an organized, easy-to-read format
- Users can delete pins directly from their profile page pin list:
  - Each pin in the list has a delete button
  - Clicking the delete button shows a confirmation dialog
  - If confirmed, the pin is deleted from the backend
  - The pin is immediately removed from the profile page pin list
  - If the user navigates back to the map, the deleted pin will no longer appear
- Users can edit pins directly from their profile page pin list:
  - Each pin in the list has an edit button
  - Clicking the edit button opens an edit interface for that specific pin
  - The edit interface displays input fields for name, description, music link, and privacy setting with current values pre-filled
  - Users can modify any of these fields
  - The edit interface includes save and cancel buttons
  - When save is clicked, the updated pin data is sent to the backend and the pin is updated
  - The profile page pin list immediately reflects the updated information after successful save
  - When cancel is clicked, the edit interface closes without saving changes
  - After editing a pin from the profile page, the changes are also reflected on the map when the user navigates back to the map view
- Users can navigate to a specific pin on the map from their profile page:
  - Each pin in the list has a "View on Map" button
  - Clicking the "View on Map" button shows a loading indicator with the message "Centering map on the selected pin location..." only when navigating to the map view
  - The loading indicator is displayed while the map is being prepared and centered on the target pin
  - The loading indicator remains visible only until the map is centered on the selected pin's exact location using the pin's stored latitude and longitude coordinates
  - Once the map is centered on the target pin, the loading indicator is immediately hidden
  - The map interface is immediately responsive and interactive once centered on the target pin
  - The map remains centered on the selected pin without any automatic recentering to the user's current location

#### Other User's Profile Pin List

- Shows only public pins created by the viewed user
- Displays pin information in an attractive, organized format including:
  - Pin name
  - Pin description
  - Location information
  - Creation date or timestamp
  - Music link access (if provided)
  - A "View on Map" button for each pin
- No delete buttons or edit functionality for other users' pins
- Clear presentation that allows visitors to see the user's public pin contributions
- Users can navigate to a specific pin on the map from other users' profile pages:
  - Each pin in the list has a "View on Map" button
  - Clicking the "View on Map" button shows a loading indicator with the message "Centering map on the selected pin location..." only when navigating to the map view
  - The loading indicator is displayed while the map is being prepared and centered on the target pin
  - The loading indicator remains visible only until the map is centered on the selected pin's exact location using the pin's stored latitude and longitude coordinates
  - Once the map is centered on the target pin, the loading indicator is immediately hidden
  - The map interface is immediately responsive and interactive once centered on the target pin
  - The map remains centered on the selected pin without any automatic recentering to the user's current location

### Loading Indicator Management

- The initial page loading indicator is displayed when the application first loads, hard refreshes, or is accessed for the first time and remains visible until the map is fully loaded, all pins are displayed, AND the map is properly centered on the user's current location (if location access is granted)
- The automatic location request occurs on every first load and hard refresh without user interaction, and the loading indicator waits for the location response before being dismissed
- The location request and processing must be consistent across first loads and hard refreshes, ensuring the map always attempts to center on the user's location
- The loading indicator with the message "Centering map on the selected pin location..." is only displayed when navigating from a profile page to the map view via the "View on Map" button
- The loading indicator is automatically dismissed in the following scenarios:
  - When the map is centered on the target pin location using the pin's exact coordinates
  - When navigating to any profile page (own profile or other user's profile)
  - After a reasonable timeout period to prevent the indicator from remaining visible indefinitely
- The loading indicator is never visible when viewing any profile page
- The loading indicator state is properly managed to ensure it doesn't persist across different views or user interactions
- The loading indicator provides clear feedback to users during the map centering process while ensuring it doesn't interfere with other application functionality
- Implement robust state transition management to ensure the loading indicator never gets stuck in a loading state
- The loading overlay must always disappear as soon as the map is centered on the target pin, regardless of first load, reload, or hard refresh scenarios
- State transitions must be carefully managed to guarantee the loading indicator is dismissed immediately when the map centering is complete
- All map UI elements including controls and notifications appear immediately after the map is centered without any unnecessary delays or readiness checks
- When navigating from a profile page to a specific pin on the map, the map centers on the selected pin and remains at that location without any automatic recentering to the user's current location

### Data Persistence

- When a new pin is created, the backend saves the following data as strings:
  - Pin name
  - Pin description
  - Latitude coordinate
  - Longitude coordinate
  - Owner identity (user who created the pin)
  - Privacy status (public or private)
  - Creation timestamp
- The "You are here" marker persists during the session but is not saved to the backend
- Music links are stored only in the frontend (no backend storage for music links)
- On application load, retrieve pins from the backend based on privacy rules:
  - All public pins are returned to all users
  - Private pins are only returned to their respective owners
- After creating a new pin, the frontend must immediately update the map display to show the new pin
- After editing a pin, the frontend must immediately update the map display to reflect the changes
- After deleting a pin, the frontend must immediately update both the map display and profile page to remove the deleted pin
- Authentication state should persist according to Internet Identity standards
- User profile data including profile picture is stored in the backend and associated with the authenticated user
- Profile pictures are stored in the backend as image data or references

## Backend Data Storage

- Store pin records containing name, description, latitude, longitude, owner identity, privacy status, and creation timestamp as string values
- Provide functionality to save new pin data when pins are created by any authenticated user with owner and privacy information
- Provide functionality to update existing pin data when pins are edited:
  - Allow updates to name, description, music link, and privacy status fields
  - Only allow updates if the requesting user is the pin owner
  - Return updated pin data after successful modification
- Provide functionality to retrieve pins based on privacy rules:
  - Return all public pins to any requester
  - Return private pins only to their owner
- Provide functionality to retrieve all pins created by a specific user for profile page display:
  - Return all pins (public and private) when the requesting user is viewing their own profile
  - Return only public pins when the requesting user is viewing another user's profile
- Provide functionality to delete pins with proper ownership verification:
  - Only allow pin deletion if the requesting user is the pin owner
  - Remove the pin record from the backend storage
  - Return success confirmation after successful deletion
- The backend must correctly return all pins belonging to a specific user when requested for the profile page
- Store user profile data including name, profile picture, and metadata fields
- Provide functionality to create, retrieve, and update user profile information including profile picture uploads
- Provide functionality to retrieve other users' public profile information for profile page viewing
- Provide a query function to fetch a user's profile information (name and profile picture) by their principal identifier
- The profile query should return the user's name and profile picture data when requested with a valid principal
- Associate profile data with authenticated user identities
- Implement privacy filtering logic to ensure private pins are only accessible to their owners
- Store and manage profile picture data with appropriate file handling
- Provide functionality to retrieve owner information for pins to display in popups
- Implement security measures to ensure only pin owners can edit or delete their pins
- Ensure profile data retrieval respects privacy boundaries when viewing other users' profiles

## Technical Requirements

- Initial loading indicator that remains visible until the map is fully loaded, all pins are displayed, AND the map is properly centered on the user's current location (if location access is granted) on every first load and hard refresh
- Automatic location request on every first load and hard refresh without requiring user interaction, ensuring consistent behavior for these access methods
- The location request and processing must work consistently on first loads and hard refreshes, ensuring that the map always attempts to center on the user's location and waits for this process to complete before removing the loading indicator
- Map functionality should work smoothly with standard web browser interactions
- Modal dialog with multiple input fields including privacy toggle and proper form handling
- Responsive design that works on desktop browsers
- Handle geolocation API permissions gracefully (both granted and denied scenarios) on every first load and hard refresh
- Validate that entered music links are from YouTube or Spotify domains when provided
- My Location button should provide appropriate user feedback for location requests and ensure all pins remain visible after recentering
- Prevent timing issues that could cause pins to disappear or not load properly after using the My Location button
- Internet Identity integration for authentication
- Compact header design with reduced height
- Backend integration for saving and retrieving pin data with privacy controls
- Visual distinction between public and private pins on the map
- Privacy filtering logic in both backend and frontend
- Dedicated profile page with navigation functionality
- Profile page completely replaces the map view when accessed
- Form validation and error handling for profile updates
- Navigation between map view and profile page
- Profile picture upload and display functionality
- Pin list display with comprehensive pin details and history
- Backend support for profile picture storage and retrieval
- Backend support for user-specific pin queries with privacy filtering
- Support for viewing other users' profiles with appropriate privacy controls
- Enhanced profile page layout and styling for both own profile and other users' profiles
- Attractive presentation of profile information and public pin lists for other users
- Immediate map updates after pin creation without page refresh
- Immediate map updates after pin editing without page refresh
- Correct data flow between frontend and backend for pin creation, editing, and retrieval
- Profile page navigation from pin popups with owner information display
- Pin deletion functionality with confirmation dialogs
- Pin editing functionality with inline edit mode in popups
- Pin editing functionality directly from the profile page with dedicated edit interface
- Immediate UI updates after pin editing in both map and profile views
- Immediate UI updates after pin deletion in both map and profile views
- Backend security for pin editing and deletion operations
- Error handling for pin editing and deletion operations
- Enhanced popup styling with modern, clean visual design
- Edit mode interface within pin popups with proper form handling
- Edit interface for pins within the profile page with proper form handling
- Backend query functionality to fetch user profile information by principal identifier
- Frontend integration to use the profile query when viewing other users' profiles
- Display of fetched user name and profile picture on other users' profile pages
- Map navigation and centering functionality for "View on Map" buttons:
  - Navigate from profile page back to map view when "View on Map" is clicked
  - Display a loading indicator with the message "Centering map on the selected pin location..." only when navigating to the map view
  - Keep the loading indicator visible only until the map is centered on the selected pin
  - Center the map on the selected pin's exact coordinates using the pin's stored latitude and longitude values
  - Hide the loading indicator immediately once the map is centered on the target pin location
  - Ensure smooth transition between profile page and map view without showing intermediate default locations
  - Use the pin's precise latitude and longitude coordinates from the backend data to accurately position the map center
  - Display all map UI elements including controls and notifications immediately after the map is centered on the selected pin
  - Ensure all UI elements appear without any unnecessary delays once the map is centered
  - Optimize the timing of UI element appearance to provide immediate feedback to the user
  - Make the map interface immediately responsive and interactive once centered on the target pin
  - Prevent any automatic recentering to the user's current location after centering on the selected pin
  - The map remains centered on the selected pin location without any subsequent location-based recentering
- Loading indicator state management:
  - Automatically dismiss the loading indicator when navigating to any profile page
  - Implement a timeout mechanism to dismiss the loading indicator after a reasonable duration
  - Ensure the loading indicator is never visible when viewing profile pages
  - Properly manage loading indicator state across different views and user interactions
  - Implement robust state transition management to ensure the loading indicator never gets stuck in a loading state
  - The loading overlay must always disappear as soon as the map is centered on the target pin
  - State transitions must be carefully managed to guarantee the loading indicator is dismissed immediately when the map centering is complete
  - Remove unnecessary readiness checks and delays for the profile-to-map transition to ensure immediate UI responsiveness
- Critical modal state management requirements:
  - Both `showMusicModal` and `pendingPin` states must be completely reset to their initial values when the modal is closed
  - The map click handler must set both `showMusicModal` and `pendingPin` states anew on every click
  - State management must ensure the modal can be reliably opened on every subsequent map click
  - No state conflicts should prevent the modal from opening after it has been closed
  - The modal opening mechanism must work consistently across multiple pin creation sessions
- Critical pin popup state management requirements:
  - All pin popup-related state variables must be completely reset to their initial values when the popup is closed
  - The pin click handler must set popup state variables anew on every pin click
  - State management must ensure the popup can be reliably opened on every subsequent pin click
  - No state conflicts should prevent the popup from opening after it has been closed
  - The popup opening mechanism must work consistently across multiple pin interactions
  - Pin popup functionality must remain reliable when clicking the same pin multiple times or switching between different pins
  - Edit mode state management must be properly handled within the popup system

## User Interaction Flow

1. User opens the application for the first time or performs a hard refresh
2. A loading indicator is displayed immediately and remains visible
3. Application begins loading pins from the backend based on privacy rules
4. The map initialization begins in the background
5. Browser automatically requests location permission from the user (no user interaction required)
6. The application waits for the location response (either granted or denied) before proceeding
7. If permission granted: map centers on user's location and displays "You are here" marker
8. If permission denied: map shows default view without location marker
9. Only after all conditions are met does the loading indicator disappear:
   - The map is fully initialized
   - All pins are retrieved from the backend and displayed on the map
   - The automatic location request has been completed and processed (either successfully centered or failed/denied)
   - The map is properly positioned based on the location response
10. This loading process occurs consistently on first loads and hard refreshes, ensuring the map always attempts to center on the user's location
11. The loading indicator is guaranteed to be dismissed once all ready conditions are met, preventing it from getting stuck in a loading state
12. State transitions are carefully managed to ensure the loading overlay always disappears as soon as the map is ready and centered, regardless of first load, reload, or hard refresh scenarios
13. User sees a compact header with "Music Memories" title and login option
14. User can authenticate using Internet Identity through the login option
15. Once authenticated, user sees profile button in the header and can view their private pins
16. User can click the profile button to navigate to their own dedicated profile page
17. The own profile page replaces the map view and displays:
    - Current profile information including profile picture
    - A comprehensive list of all pins created by the user (both public and private) with full details
    - Options to edit profile information and upload/change profile picture
    - Delete buttons for each pin in the list
    - Edit buttons for each pin in the list
    - "View on Map" buttons for each pin in the list
18. Users can upload or change their profile picture through the profile interface
19. Users can view their complete pin history with details like name, description, location, privacy status, and creation date
20. Users can delete pins from their profile page by clicking the delete button and confirming the action
21. Users can edit pins directly from their profile page:
    - Click the edit button for any pin in the list
    - An edit interface opens with input fields for name, description, music link, and privacy setting pre-filled with current values
    - Modify any of the fields as desired
    - Click save to update the pin in the backend and immediately see the changes reflected in the profile page pin list
    - Click cancel to close the edit interface without saving changes
    - After editing a pin from the profile page, the changes are also reflected on the map when navigating back to the map view
22. Users can navigate to a specific pin on the map by clicking the "View on Map" button:
    - A loading indicator with the message "Centering map on the selected pin location..." appears immediately only when navigating to the map view
    - The application navigates back to the map view while keeping the loading indicator visible
    - The map is centered on the selected pin's exact location using the pin's stored latitude and longitude coordinates
    - The loading indicator is hidden immediately once the map is centered on the target pin
    - All map UI elements including controls and notifications appear immediately after the map is centered on the selected pin without any delays
    - The map interface is immediately responsive and interactive once centered on the target pin
    - The map remains centered on the selected pin without any automatic recentering to the user's current location
    - The loading indicator is automatically dismissed if the user navigates to any profile page or after a timeout period
23. Profile changes including profile picture updates are saved to the backend when submitted
24. User can navigate back to the map from the profile page
25. On the map view, user sees a prominent "My Location" button above the map
26. User can click the "My Location" button at any time to recenter the map to their current location
27. After clicking "My Location", the map recenters and all pins that should be visible remain properly displayed without any missing pins due to loading order or timing issues
28. Any authenticated user clicks anywhere on the map to add a pin marker
29. A modal dialog reliably appears with input fields for name, description, music link, and privacy toggle
30. User can fill in any or all of the fields, choose privacy setting (defaults to public), or leave them empty
31. User submits the modal or cancels
32. If submitted, the pin data including owner, privacy status, and timestamp is saved to the backend database, and the new pin marker immediately appears at the clicked location with appropriate privacy styling
33. When the modal is closed (by submission or cancellation), both `showMusicModal` and `pendingPin` states are completely reset to their initial values to ensure the modal can be opened again on subsequent map clicks
34. User can click on existing pins to view their information in an improved, visually appealing popup with enhanced styling
35. The pin popup reliably opens every time a pin is clicked, with all popup-related state variables being properly reset when the popup is closed and freshly initialized on each pin click
36. User can close the pin popup and click the same pin or any other pin again, and the popup will consistently open as expected
37. For pins they own, users see edit and delete buttons in the popup
38. Users can click the edit button to switch the popup to edit mode:
    - Input fields appear with current pin values pre-filled
    - Users can modify the name, description, and music link
    - Save and cancel buttons are available
    - Clicking save updates the pin in the backend and immediately reflects changes in the popup and map
    - Clicking cancel returns to view mode without saving changes
39. User can delete their own pins from the popup by clicking the delete button and confirming the action
40. User can click on the owner's name link in the popup to navigate to that user's profile page
41. When viewing another user's profile page (accessed through pin popup links), the user sees:
    - The profile owner's name prominently displayed with attractive styling, fetched from the backend using their principal
    - The profile owner's profile picture if available, also fetched from the backend
    - An improved, visually appealing layout that presents the profile information professionally
    - A clear, well-organized list of all public pins created by that user
    - Enhanced styling that makes the profile feel complete and informative
    - "View on Map" buttons for each pin in the list
42. Users can navigate to a specific pin on the map from other users' profile pages by clicking the "View on Map" button:
    - A loading indicator with the message "Centering map on the selected pin location..." appears immediately only when navigating to the map view
    - The application navigates back to the map view while keeping the loading indicator visible
    - The map is centered on the selected pin's exact location using the pin's stored latitude and longitude coordinates
    - The loading indicator is hidden immediately once the map is centered on the target pin
    - All map UI elements including controls and notifications appear immediately after the map is centered on the selected pin without any delays
    - The map interface is immediately responsive and interactive once centered on the target pin
    - The map remains centered on the selected pin without any automatic recentering to the user's current location
    - The loading indicator is automatically dismissed if the user navigates to any profile page or after a timeout period
43. The frontend uses the backend profile query to fetch and display the user's name and profile picture when viewing other users' profiles
44. User can continue adding more pins by clicking other locations, with the modal consistently opening each time due to proper state reset and initialization
45. All pins and profile data including profile pictures persist across sessions through backend storage with privacy controls
46. Private pins are visually distinguished and only visible to their owners
47. Public pins remain visible to all users regardless of authentication status
48. Users can return to their own profile page to view their updated pin list including all newly created and edited pins with complete details
49. Users can access other users' profile pages through pin popup links to view their public information and pins with enhanced presentation
50. When pins are edited (either from the map popup or from the profile page), the changes are immediately reflected in both the map display and the user's profile pin list
51. When pins are deleted, they are immediately removed from both the map display and the user's profile pin list
52. Pin deletion and editing require proper authentication and only work for pins owned by the current authenticated user
53. The pin creation modal maintains reliable functionality across multiple uses, with both `showMusicModal` and `pendingPin` states being properly reset on close and freshly initialized on each map click, ensuring users can create pins consistently throughout their session
54. Pin popup interactions remain reliable throughout the user session, allowing users to repeatedly click pins, view their information, edit their own pins, and interact with popups without any state conflicts or failures
55. The enhanced popup styling provides a clean, professional appearance that improves the overall user experience when viewing and editing pin information
56. Other users' profile pages provide an attractive, informative experience that showcases their public contributions and profile information in a professional, engaging manner, with their name and profile picture prominently displayed using data fetched from the backend
57. The "View on Map" functionality provides seamless navigation between profile pages and the map with a loading indicator that only appears when navigating to the map view and is dismissed immediately once the map is centered on the target pin, ensuring users can easily locate and view specific pins on the map with proper centering using the pin's exact latitude and longitude coordinates
58. The map transition experience is optimized so that when navigating from a profile to a pin on the map, the loading indicator is dismissed immediately once the map is centered, and all UI elements appear without unnecessary delays, providing a smooth, responsive transition
59. All map UI elements including controls and notifications appear immediately after the map is centered on the selected pin, providing instant feedback without any delays once the map centering is complete
60. The loading indicator management ensures that the "Centering map on the selected pin location..." message is never visible when viewing any profile page and is properly dismissed immediately when the map is centered on the target pin, providing a clean user experience without persistent loading states or frozen UI elements
61. The initial page loading process ensures that users see a loading indicator until the map is fully loaded, all pins are displayed, AND the automatic location request is completed and processed with appropriate map centering (if location access is granted), preventing any interaction with an incomplete or improperly positioned interface
62. The automatic location request occurs on every first load and hard refresh without requiring user interaction, ensuring consistent behavior for these access methods
63. The location request and processing is handled consistently on first loads and hard refreshes, ensuring that the map always attempts to center on the user's location and waits for this process to complete before removing the loading indicator
64. The "My Location" functionality ensures that after recentering the map, all pins that should be visible remain properly displayed without any missing pins due to timing or loading order issues
65. The loading indicator is guaranteed to never get stuck in a loading state through robust state transition management
66. All ready conditions are properly tracked and verified before dismissing the loading indicator, ensuring it always disappears as soon as the map is fully interactive and all elements are ready, regardless of first load, reload, or hard refresh scenarios
67. The map transition from profile to pin ensures immediate responsiveness and interactivity once centered on the target pin, with all UI elements appearing immediately without unnecessary readiness checks or delays, providing a smooth, professional user experience
68. Pin editing functionality is available both from the map (via pin popups) and from the profile page (via dedicated edit interface), providing users with flexible options for managing their pin content
69. Profile page pin editing maintains consistency with map-based editing, ensuring that changes made in either location are immediately reflected in both views
70. The profile page edit interface provides a comprehensive way to modify pin details including name, description, music link, and privacy settings with proper form validation and error handling
71. When navigating from a profile page to a specific pin on the map via the "View on Map" button, the map centers on the selected pin and remains at that location without any automatic recentering to the user's current location
72. The map centering behavior when jumping to a pin from the profile is distinct from the initial page load behavior - it focuses solely on the selected pin location without triggering any location-based recentering
73. After centering on a pin from the profile page, the map maintains its position on the selected pin, allowing users to examine the pin and its surroundings without unwanted location changes
