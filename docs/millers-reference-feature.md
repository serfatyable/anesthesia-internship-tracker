# Miller's Reference Feature

## Overview

The Miller's Reference feature provides quick access to reference materials for procedures and knowledge topics in the rotation pages.

## Components

### MillersReferenceButton

- **Location**: `components/ui/MillersReferenceButton.tsx`
- **Purpose**: Displays a clickable button next to item titles
- **Props**:
  - `title`: The name of the procedure/topic
  - `reference`: The reference material text (can be null)
  - `className`: Optional additional CSS classes

### ReferenceModal

- **Location**: `components/ui/ReferenceModal.tsx`
- **Purpose**: Modal popup that displays reference materials
- **Props**:
  - `isOpen`: Boolean to control modal visibility
  - `onClose`: Function to close the modal
  - `title`: The name of the item
  - `reference`: The reference material text

## Features

### Button States

- **With Reference**: Blue button with book icon
- **No Reference**: Gray button with book icon, displays "No reference yet" in modal

### Modal Behavior

- Opens when clicking the "Miller's Reference" button
- Closes when clicking outside the modal or pressing Escape
- Displays reference material in a formatted text area
- Shows "No reference yet" for items without references

### Reference Format

The system is designed to support the following reference format:

```
Miller's Anesthesiology 10th Edition: Chapter 9 "Sleep Medicine", Section 1.4 "Sleep and Breathing", Subsection 1.4.2.1 "Obstructive Sleep Apnea", Pages 327-332; Chapter 29 "Anesthetic Implications of Concurrent Diseases", Section 1.3.3 "Obstructive Sleep Apnea (OSA)", Pages 1178
```

## Integration

The feature is integrated into the rotation pages (`app/rotations/[name]/page.tsx`) for both:

- **Procedures**: Shows reference button next to procedure names
- **Knowledge Topics**: Shows reference button next to topic names

## Future Enhancements

- Upload and manage reference materials through admin interface
- Support for multiple reference formats
- Search functionality within references
- Export references to PDF
