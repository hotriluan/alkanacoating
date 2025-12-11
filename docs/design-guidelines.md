# Design Guidelines - Alkana Coating

## Design System Overview

Alkana Coating uses a modern, professional design system built with Tailwind CSS, focusing on clarity, usability, and brand consistency.

## Color Palette

### Primary Colors

```css
/* Blue - Primary brand color */
--blue-50: #eff6ff
--blue-100: #dbeafe
--blue-500: #3b82f6  /* Primary */
--blue-600: #2563eb  /* Primary hover */
--blue-700: #1d4ed8
--blue-900: #1e3a8a

/* Gray - Neutral colors */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
```

### Semantic Colors

```css
/* Success */
--green-500: #10b981
--green-600: #059669

/* Warning */
--yellow-500: #f59e0b
--yellow-600: #d97706

/* Error */
--red-500: #ef4444
--red-600: #dc2626

/* Info */
--blue-500: #3b82f6
--blue-600: #2563eb
```

### Usage Guidelines

- **Primary Actions**: Blue-600 background, white text
- **Secondary Actions**: Gray-200 background, gray-700 text
- **Danger Actions**: Red-600 background, white text
- **Success States**: Green-500 background, white text
- **Text**: Gray-900 for headings, gray-700 for body
- **Borders**: Gray-200 for subtle, gray-300 for prominent

## Typography

### Font Families

**Primary**: System font stack for optimal performance
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

### Font Sizes

```css
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)      /* Body text */
text-lg: 1.125rem (18px)
text-xl: 1.25rem (20px)
text-2xl: 1.5rem (24px)
text-3xl: 1.875rem (30px)
text-4xl: 2.25rem (36px)    /* Page headings */
```

### Font Weights

- `font-normal (400)` - Body text
- `font-medium (500)` - Emphasized text
- `font-semibold (600)` - Subheadings
- `font-bold (700)` - Headings

### Typography Scale

```jsx
// Page Title
<h1 className="text-4xl font-bold text-gray-900">

// Section Heading
<h2 className="text-3xl font-bold text-gray-900">

// Subsection Heading
<h3 className="text-2xl font-semibold text-gray-800">

// Card Title
<h4 className="text-xl font-semibold text-gray-900">

// Body Text
<p className="text-base text-gray-700">

// Small Text
<span className="text-sm text-gray-600">

// Caption
<span className="text-xs text-gray-500">
```

## Spacing System

Using Tailwind's 4px-based spacing scale:

```css
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)      /* Standard spacing */
6: 1.5rem (24px)
8: 2rem (32px)      /* Section spacing */
12: 3rem (48px)
16: 4rem (64px)
```

### Spacing Guidelines

- **Component padding**: `p-4` (16px)
- **Card padding**: `p-6` (24px)
- **Section spacing**: `mb-8` or `mb-12`
- **Element spacing**: `gap-4` for flex/grid
- **Button padding**: `px-4 py-2`

## Component Library

### Buttons

#### Primary Button
```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                   transition-colors duration-200 font-medium">
  Primary Action
</button>
```

#### Secondary Button
```jsx
<button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 
                   transition-colors duration-200 font-medium">
  Secondary Action
</button>
```

#### Danger Button
```jsx
<button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                   transition-colors duration-200 font-medium">
  Delete
</button>
```

#### Icon Button
```jsx
<button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                   rounded-lg transition-colors">
  <TrashIcon className="w-5 h-5" />
</button>
```

### Form Elements

#### Text Input
```jsx
<input 
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             transition-all duration-200"
  placeholder="Enter text..."
/>
```

#### Select Dropdown
```jsx
<select className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

#### Textarea
```jsx
<textarea 
  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 focus:border-transparent
             resize-none"
  rows="4"
/>
```

#### Checkbox
```jsx
<label className="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded 
                                    focus:ring-2 focus:ring-blue-500" />
  <span className="text-gray-700">Checkbox label</span>
</label>
```

### Cards

#### Basic Card
```jsx
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg 
                transition-shadow duration-200">
  <h3 className="text-xl font-semibold text-gray-900 mb-2">Card Title</h3>
  <p className="text-gray-700">Card content goes here</p>
</div>
```

#### Product Card
```jsx
<div className="bg-white rounded-lg shadow-md overflow-hidden 
                hover:shadow-xl transition-shadow duration-200">
  <img src="..." alt="..." className="w-full h-48 object-cover" />
  <div className="p-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Name</h3>
    <p className="text-gray-600 text-sm">Product description</p>
  </div>
</div>
```

### Modals

```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900">Modal Title</h3>
    </div>
    
    {/* Body */}
    <div className="px-6 py-4">
      <p className="text-gray-700">Modal content</p>
    </div>
    
    {/* Footer */}
    <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
        Cancel
      </button>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Tables

```jsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Column 1
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Column 2
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 text-sm text-gray-900">Data 1</td>
        <td className="px-6 py-4 text-sm text-gray-900">Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges

```jsx
{/* Status badges */}
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
  Active
</span>

<span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
  Pending
</span>

<span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
  Inactive
</span>
```

## Layout Patterns

### Container
```jsx
<div className="container mx-auto px-4 max-w-7xl">
  {/* Content */}
</div>
```

### Grid Layout
```jsx
{/* 3-column grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

### Flex Layout
```jsx
{/* Horizontal flex with gap */}
<div className="flex items-center gap-4">
  {/* Flex items */}
</div>

{/* Space between */}
<div className="flex items-center justify-between">
  {/* Flex items */}
</div>
```

## Responsive Design

### Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile-First Approach

```jsx
{/* Stack on mobile, row on desktop */}
<div className="flex flex-col md:flex-row gap-4">
  {/* Items */}
</div>

{/* 1 column on mobile, 2 on tablet, 3 on desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>

{/* Hide on mobile, show on desktop */}
<div className="hidden lg:block">
  {/* Desktop-only content */}
</div>
```

## Animation & Transitions

### Hover Effects
```jsx
{/* Button hover */}
<button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">

{/* Card hover */}
<div className="shadow-md hover:shadow-xl transition-shadow duration-200">

{/* Scale on hover */}
<div className="transform hover:scale-105 transition-transform duration-200">
```

### Loading States
```jsx
{/* Skeleton loader */}
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>

{/* Spinner */}
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
```

## Accessibility Guidelines

### Color Contrast
- Ensure text has minimum 4.5:1 contrast ratio
- Use darker text on light backgrounds
- Avoid color-only indicators

### Focus States
```jsx
{/* Always include focus styles */}
<button className="focus:ring-2 focus:ring-blue-500 focus:outline-none">
```

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Use `<button>` for actions, `<a>` for navigation
- Include alt text for images
- Use ARIA labels when needed

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Maintain logical tab order
- Include skip links for navigation

## Admin Panel Design

### Sidebar Navigation
```jsx
<aside className="w-64 bg-gray-900 text-white min-h-screen">
  <nav className="p-4">
    <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg 
                          hover:bg-gray-800 transition-colors">
      <Icon className="w-5 h-5" />
      <span>Menu Item</span>
    </a>
  </nav>
</aside>
```

### Data Tables
- Sticky header on scroll
- Row hover effects
- Action buttons aligned right
- Pagination at bottom
- Responsive: stack on mobile

### Forms
- Clear labels above inputs
- Validation messages below inputs
- Required field indicators
- Submit button at bottom right
- Cancel button to the left

## User Flow Patterns

### Product Browsing
1. Homepage → Featured products
2. Products page → Category filter + search
3. Product detail → Full specs + images
4. Contact form → Inquiry

### Admin Workflow
1. Login → Dashboard
2. Sidebar navigation → Feature
3. List view → Table with actions
4. Edit form → Modal or separate page
5. Confirmation → Success toast

## Best Practices

### Do's ✅
- Use consistent spacing throughout
- Maintain visual hierarchy
- Provide clear feedback for actions
- Use loading states for async operations
- Implement responsive design
- Follow accessibility guidelines

### Don'ts ❌
- Don't use too many colors
- Don't make clickable elements too small
- Don't hide important actions
- Don't use low contrast text
- Don't forget mobile users
- Don't skip loading states

---

**Last Updated**: 2025-11-30  
**Document Owner**: Development Team
