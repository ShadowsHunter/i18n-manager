# MultiLanguageManager

MultiLanguageManager - A developer-focused internal tool for managing multilingual text entries across iOS, Android, and Web platforms.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Browser: Chrome/Edge for development

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format

# Run TypeScript type checking
npm run typecheck
```

## 📁 Project Structure

```
multilanguage-manager/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   ├── layouts/              # Layout components
│   │   └── DashboardLayout.tsx
│   ├── styles/               # Global styles and design system
│   │   ├── design-system.css  # CSS variables and base styles
│   │   └── globals.css       # Tailwind imports
│   ├── pages/                # Page components (future)
│   ├── App.tsx               # Root component
│   └── main.tsx             # Entry point
├── public/                   # Static assets
├── index.html                # HTML template
├── package.json              # Project configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── .eslintrc.cjs            # ESLint configuration
└── .prettierrc               # Prettier configuration
```

## 🎨 Design System

### Color Palette

| Role | Hex | Tailwind Class |
|------|-----|---------------|
| Primary | #1E293B | `bg-primary` |
| Secondary | #334155 | `bg-secondary` |
| CTA/Accent | #3B82F6 | `bg-cta` |
| Background | #0F172A | `bg-background` |
| Text | #F8FAFC | `text-text` |
| Error | #EF4444 | `bg-error` |
| Warning | #F59E0B | `bg-warning` |
| Info | #22C55E | `bg-info` |

### Typography

- **Heading Font:** Archivo (weights 300-700)
- **Body Font:** Space Grotesk (weights 300-700)
- **Code Font:** Space Mono

### Spacing System

- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px

### Border Radius

- sm: 4px, md: 8px, lg: 12px, xl: 16px

## 🧩 Components

### Button

```tsx
import { Button } from './components';

<Button variant="primary" size="md">
  Click me
</Button>
```

**Variants:** primary, secondary, danger
**Sizes:** sm, md, lg

### Input

```tsx
import { Input } from './components';

<Input label="Email" placeholder="user@example.com" />
```

### Card

```tsx
import { Card } from './components';

<Card hoverable>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

### Modal

```tsx
import { Modal } from './components';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modal Title">
  Modal content
</Modal>
```

**Sizes:** sm, md, lg, xl

### Badge

```tsx
import { Badge } from './components';

<Badge variant="success">Success</Badge>
```

**Variants:** success, error, warning, info

## 📐 Layouts

### DashboardLayout

```tsx
import { DashboardLayout } from './layouts/DashboardLayout';

<DashboardLayout currentPage="dashboard">
  <div>Page content</div>
</DashboardLayout>
```

**Features:**
- Fixed sidebar (280px)
- Skip navigation link
- Responsive design
- User info section

## 🎯 Performance Targets

- Page load time: < 2 seconds
- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- TBT (Total Blocking Time): < 150ms
- CLS (Cumulative Layout Shift): < 0.1

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader support
- Focus states visible
- Skip navigation link
- Color contrast ≥ 4.5:1

## 🔧 Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite 6+
- **Styling:** Tailwind CSS 3+
- **Code Quality:** ESLint, Prettier, TypeScript
- **Browsers:** Chrome, Edge, Safari, Firefox (latest 2 versions)

## 📱 Responsive Design

- **Mobile:** < 768px (Single column, hamburger menu)
- **Tablet:** 768px - 1024px (Collapsed sidebar)
- **Desktop:** > 1024px (Full sidebar + content)

## 🚧 Development Status

### Phase 1: Infrastructure (In Progress) ✅

- [x] Project structure
- [x] Package configuration
- [x] TypeScript configuration
- [x] Tailwind CSS configuration
- [x] Design system (CSS variables)
- [x] Base components (Button, Input, Card, Modal, Badge)
- [x] Layout component (DashboardLayout)
- [x] Example page (Dashboard)

### Phase 2: Core Pages (Next)

- [ ] Dashboard (Project List)
- [ ] Project Detail (Text Entries)
- [ ] Upload Excel Page
- [ ] Export/Download Page

### Phase 3: Advanced Features (Future)

- [ ] Settings Page
- [ ] API Keys Page
- [ ] Bulk Operations
- [ ] Advanced Search and Filtering

## 📝 Design Documentation

- **UX Design System:** `ux-design/UX-DESIGN-SYSTEM.md`
- **Implementation Guide:** `ux-design/IMPLEMENTATION-GUIDE.md`
- **Page Designs:** `ux-design/pages/`
- **Approval Document:** `ux-design/APPROVAL-AND-DEPLOY.md`

## 🧪 Testing

### Running Tests

```bash
# Run TypeScript type checking
npm run typecheck

# Run ESLint
npm run lint

# Format code
npm run format
```

### Accessibility Testing

- **Tool:** axe DevTools, WAVE, Lighthouse
- **Target:** WCAG 2.1 AA
- **Frequency:** Every commit

### Performance Testing

- **Tool:** Lighthouse, WebPageTest
- **Target:** Performance > 90, Accessibility > 95
- **Frequency:** Weekly

## 📞 Support

For any questions or issues, please contact the development team.

## 📄 License

Private - Internal use only

---

**Version:** 1.0.0  
**Status:** Phase 1 In Progress  
**Last Updated:** 2026-02-28
