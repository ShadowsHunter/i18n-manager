# UX Design Implementation Guide

**Project:** MultiLanguageManager  
**Target Audience:** Frontend Developers, UI Engineers  
**Purpose:** Guide for implementing the UX design system

---

## 🚀 Getting Started

### Prerequisites

1. **Design System Loaded**
   - Design system persisted to: `.opencode/skills/ui-ux-pro-max/design-system/multilanguagemanager/MASTER.md`
   - This is your source of truth for all design decisions

2. **Technology Stack**
   - Default: HTML + Tailwind CSS
   - Alternative: React, Vue, Next.js (check with team)
   - Icon Library: Heroicons or Lucide (SVG only, no emojis)

3. **Dev Environment Setup**
   - Node.js 18+ installed
   - Package manager: npm, yarn, or pnpm
   - Browser: Chrome/Edge for development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking (if TypeScript)
npm run typecheck
```

---

## 🎨 Design System Integration

### CSS Variables Setup

Create `styles/design-system.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

:root {
  /* Colors */
  --color-primary: #1E293B;
  --color-secondary: #334155;
  --color-cta: #3B82F6;
  --color-background: #0F172A;
  --color-text: #F8FAFC;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
  --color-info: #22C55E;

  /* Spacing */
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
  --space-2xl: 3rem;    /* 48px */
  --space-3xl: 4rem;    /* 64px */

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);

  /* Typography */
  --font-heading: 'Archivo', sans-serif;
  --font-body: 'Space Grotesk', sans-serif;
  --font-code: 'Space Mono', monospace;
}

/* Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-background);
  color: var(--color-text);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 600;
}

h1 { font-size: 2.5rem; line-height: 1.2; }
h2 { font-size: 2rem; line-height: 1.3; }
h3 { font-size: 1.5rem; line-height: 1.4; }

/* Responsive Typography */
@media (max-width: 767px) {
  h1 { font-size: 2rem; /* 32px */ }
  h2 { font-size: 1.5rem; /* 24px */ }
  h3 { font-size: 1.25rem; /* 20px */ }
}

/* Focus States */
:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Skip Navigation */
.skip-nav {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-cta);
  color: white;
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-nav:focus {
  top: 0;
}
```

### Tailwind Configuration

Create `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E293B',
        secondary: '#334155',
        cta: '#3B82F6',
        background: '#0F172A',
        text: '#F8FAFC',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#22C55E',
      },
      fontFamily: {
        heading: ['Archivo', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
        code: ['Space Mono', 'monospace'],
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
        xl: '0 20px 25px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};
```

---

## 🧩 Component Library

### Button Component

```tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 cursor-pointer';
  
  const variantStyles = {
    primary: 'bg-cta text-white hover:opacity-90 hover:-translate-y-0.5 shadow-md hover:shadow-lg',
    secondary: 'bg-cta/10 text-cta border-2 border-cta hover:bg-cta/20',
    danger: 'bg-error text-white hover:opacity-90',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const disabledStyles = disabled || loading ? 'opacity-40 cursor-not-allowed !translate-y-0 !shadow-md' : '';
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
```

### Input Component

```tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text
          focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/20
          transition-all duration-200
          ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-sm text-error">{error}</span>
      )}
    </div>
  );
};
```

### Card Component

```tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  onClick,
}) => {
  return (
    <div
      className={`
        bg-background border border-secondary rounded-lg p-6 shadow-md
        transition-all duration-200
        ${hoverable ? 'cursor-pointer hover:shadow-lg hover:border-cta hover:-translate-y-0.5' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
```

### Modal Component

```tsx
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        className={`relative bg-background border border-secondary rounded-xl p-8 shadow-xl w-[90%] ${sizeStyles[size]} max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            id="modal-title"
            className="text-2xl font-semibold"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-text hover:text-cta transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        {children}
      </div>
    </div>
  );
};
```

---

## 📱 Layout Components

### Dashboard Layout

```tsx
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPage = 'Dashboard',
}) => {
  return (
    <div className="min-h-screen bg-background text-text flex">
      {/* Skip Navigation Link */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      
      {/* Sidebar */}
      <aside className="w-[280px] bg-background border-r border-secondary fixed left-0 top-0 bottom-0 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-secondary">
          <h1 className="text-xl font-bold">MultiLanguageManager</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/dashboard"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${currentPage === 'dashboard' ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </a>
          
          <a
            href="/projects"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${currentPage === 'projects' ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="font-medium">Projects</span>
          </a>
          
          <a
            href="/settings"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${currentPage === 'settings' ? 'bg-secondary/20 text-cta border-l-4 border-cta' : 'text-text hover:bg-secondary/10'}
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Settings</span>
          </a>
        </nav>
        
        {/* User Info */}
        <div className="p-4 border-t border-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <span className="font-semibold">JD</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">John Doe</p>
              <p className="text-xs text-secondary">Product Manager</p>
            </div>
            <button className="text-text hover:text-cta transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main id="main-content" className="flex-1 ml-[280px] p-8">
        {children}
      </main>
    </div>
  );
};
```

---

## 🎯 Page Templates

### Dashboard Page Template

```tsx
import React from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Card } from './components/Card';
import { Button } from './components/Button';

export const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout currentPage="dashboard">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-secondary mb-4">
          <a href="/" className="hover:text-cta transition-colors">Home</a>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Projects</h1>
            <p className="text-secondary">Manage your multilingual text entries</p>
          </div>
          <Button variant="primary">+ New Project</Button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Search projects..."
          className="flex-1 px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none"
        />
        <select className="px-4 py-3 rounded-lg border-2 border-secondary bg-background text-text focus:border-cta focus:outline-none">
          <option>All Projects</option>
          <option>Active</option>
          <option>Archived</option>
        </select>
      </div>
      
      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hoverable>
          <h3 className="text-xl font-semibold mb-2">My App</h3>
          <p className="text-secondary mb-4 line-clamp-2">
            Mobile application for e-commerce platform
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-1 rounded bg-cta/10 text-cta text-xs font-semibold">
              🏷 12 languages
            </span>
            <span className="text-sm text-secondary">
              Updated 2 days ago
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">Edit</Button>
            <Button variant="secondary" size="sm">Delete</Button>
          </div>
        </Card>
        
        {/* More project cards... */}
      </div>
    </DashboardLayout>
  );
};
```

---

## ✅ Implementation Checklist

### Phase 1: Foundation

- [ ] Design system CSS variables imported
- [ ] Tailwind configuration set up
- [ ] Font families loaded (Archivo, Space Grotesk)
- [ ] Color palette configured
- [ ] Spacing system configured
- [ ] Base components created (Button, Input, Card, Modal)
- [ ] Layout components created (DashboardLayout)
- [ ] Accessibility testing setup (axe DevTools)

### Phase 2: Core Pages

- [ ] Dashboard page implemented
- [ ] Project Detail page implemented
- [ ] Upload Excel page implemented
- [ ] Export/Download page implemented

### Phase 3: Features

- [ ] Search and filtering implemented
- [ ] Pagination implemented
- [ ] Bulk operations implemented
- [ ] File upload with progress tracking
- [ ] Toast notifications implemented
- [ ] Error handling implemented

### Phase 4: Polish

- [ ] Loading states added
- [ ] Empty states added
- [ ] Error states added
- [ ] Responsive design tested
- [ ] Accessibility audit passed
- [ ] Performance optimized
- [ ] Browser testing completed

---

## 🧪 Testing

### Accessibility Testing

```bash
# Install axe DevTools
npm install --save-dev @axe-core/react

# Run accessibility audit
npm run test:a11y
```

### Linting

```bash
# Run ESLint
npm run lint

# Run Prettier
npm run format

# Run TypeScript type checking
npm run typecheck
```

### Browser Testing

- Chrome (latest)
- Edge (latest)
- Safari (latest)
- Firefox (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📊 Performance Targets

- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

---

## 🚨 Common Pitfalls

### ❌ Don't Use Emojis as Icons

**Wrong:**
```tsx
<button>🗑 Delete</button>
```

**Right:**
```tsx
<button>
  <TrashIcon className="w-5 h-5" />
  Delete
</button>
```

### ❌ Don't Use Scale Transforms on Hover

**Wrong:**
```css
.card:hover {
  transform: scale(1.05); /* Causes layout shift */
}
```

**Right:**
```css
.card:hover {
  transform: translateY(-2px); /* No layout shift */
  box-shadow: var(--shadow-lg);
}
```

### ❌ Don't Use Placeholder-Only Inputs

**Wrong:**
```tsx
<input placeholder="Email" />
```

**Right:**
```tsx
<Input label="Email" placeholder="user@example.com" />
```

### ❌ Don't Forget Cursor Pointer

**Wrong:**
```tsx
<div className="card">Click me</div>
```

**Right:**
```tsx
<div className="card cursor-pointer">Click me</div>
```

---

## 📚 Resources

- **Design System:** `.opencode/skills/ui-ux-pro-max/design-system/multilanguagemanager/MASTER.md`
- **Page Designs:** `ux-design/pages/`
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Heroicons:** https://heroicons.com/
- **Lucide Icons:** https://lucide.dev/
- **Web Content Accessibility Guidelines (WCAG):** https://www.w3.org/WAI/WCAG21/quickref/

---

**Next Steps:**

1. Set up development environment
2. Implement base components
3. Build first page (Dashboard)
4. Run accessibility tests
5. Iterate and refine

**Questions?** Contact the UX team for clarification on any design decisions.

