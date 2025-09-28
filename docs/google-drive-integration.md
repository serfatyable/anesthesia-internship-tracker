# Google Drive Integration

The Resources card provides direct links to Google Drive folders where users can access learning materials, videos, documents, and other resources. The card appears in two contexts:

1. **Main Dashboard** - Opens the main Google Drive folder
2. **Individual Items** - Opens item-specific subfolders for procedures and knowledge topics

## Configuration

### Environment Variable

Set the following environment variable to configure the Google Drive URL:

```bash
NEXT_PUBLIC_GOOGLE_DRIVE_URL="https://drive.google.com/drive/folders/YOUR_FOLDER_ID"
```

### Getting the Google Drive Folder ID

1. Open Google Drive in your browser
2. Navigate to the folder you want to share
3. Right-click on the folder and select "Share"
4. Set permissions to "Anyone with the link can view" (or appropriate access level)
5. Copy the sharing link
6. Extract the folder ID from the URL

Example URL format:

```
https://drive.google.com/drive/folders/1ABC123DEF456GHI789JKL012MNO345PQR678STU
```

The folder ID is: `1ABC123DEF456GHI789JKL012MNO345PQR678STU`

### Folder Structure

The system expects the following Google Drive folder structure:

```
Main Folder (NEXT_PUBLIC_GOOGLE_DRIVE_URL)
├── procedures/
│   ├── procedure-id-1/
│   ├── procedure-id-2/
│   └── ...
└── knowledges/
    ├── knowledge-id-1/
    ├── knowledge-id-2/
    └── ...
```

- **Main folder**: Contains all resources
- **procedures/**: Subfolder for procedure-specific resources
- **knowledges/**: Subfolder for knowledge-specific resources
- **Individual folders**: Named with the item ID for specific resources

## Features

### Accessibility

- Full keyboard navigation support
- Screen reader compatible with proper ARIA labels
- Focus management and visual indicators

### Error Handling

- Graceful fallback when URL is not configured
- Popup blocker detection with fallback navigation
- Console logging for debugging

### Security

- Opens in new tab with `noopener,noreferrer` security attributes
- URL validation before opening
- No data collection or tracking

### Performance

- Memoized component to prevent unnecessary re-renders
- Optimized event handlers with useCallback
- Minimal bundle impact

## Usage

The Resources card appears in two contexts:

### Main Dashboard

- Located in the 2x2 grid with other dashboard cards
- Opens the main Google Drive folder
- Shows general resources and learning materials

### Individual Items

- Appears in the 4-card grid for each procedure and knowledge topic
- Opens item-specific subfolders
- Shows resources relevant to that specific item
- Displays item name in the card subtitle

The card will:

1. **Show as configured** when `NEXT_PUBLIC_GOOGLE_DRIVE_URL` is set
2. **Show as disabled** when the URL is not configured (with helpful message)
3. **Open Google Drive** in a new tab when clicked
4. **Navigate to correct folder** based on context (main or item-specific)
5. **Handle errors gracefully** if the popup is blocked or URL is invalid

## Customization

### Styling

The card uses Tailwind CSS classes and follows the existing design system:

- Green gradient background (`from-green-50 to-emerald-50`)
- Hover effects with scale and shadow
- Responsive design for mobile and desktop

### Props

```typescript
interface ResourcesCardProps {
  driveUrl?: string; // Override the environment variable
  className?: string; // Additional CSS classes
  // For item-specific resources
  itemId?: string; // ID of the procedure or knowledge item
  itemType?: 'PROCEDURE' | 'KNOWLEDGE'; // Type of item
  itemName?: string; // Display name of the item
  // Display mode
  mode?: 'main' | 'item'; // 'main' for dashboard, 'item' for individual items
}
```

## Troubleshooting

### Card shows "URL not configured" message

- Ensure `NEXT_PUBLIC_GOOGLE_DRIVE_URL` is set in your environment
- Restart your development server after setting the variable
- Check that the URL is properly formatted

### Popup blocked error

- The component will automatically fallback to navigating in the current window
- Users can manually allow popups for the site
- Check browser popup blocker settings

### Google Drive access issues

- Verify the folder sharing permissions
- Ensure the folder ID is correct in the URL
- Test the URL directly in a browser

## Development

### Testing

```bash
# Test with configured URL
NEXT_PUBLIC_GOOGLE_DRIVE_URL="https://drive.google.com/drive/folders/test" npm run dev

# Test without URL (should show disabled state)
npm run dev
```

### TypeScript

The component is fully typed and includes proper interfaces for all props and event handlers.
