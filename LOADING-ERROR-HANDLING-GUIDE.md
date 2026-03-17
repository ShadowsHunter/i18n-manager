# Loading States & Error Handling - Implementation Guide

This document explains how to use the loading and error handling patterns implemented in MultiLanguageManager.

## Components

### 1. Loading Component

The `Loading` component displays a spinner with optional text and full-screen mode.

```tsx
import { Loading } from './components';

// Basic loading spinner
<Loading />

// With text
<Loading text="Loading data..." />

// Custom size
<Loading size="lg" text="Processing..." />

// Full-screen overlay
<Loading fullScreen size="xl" text="Please wait..." />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `text`: Optional message to display
- `fullScreen`: Show as full-screen overlay (default: false)
- `className`: Additional CSS classes

### 2. ErrorBoundary Component

Catches JavaScript errors anywhere in the component tree and displays a fallback UI.

```tsx
import { ErrorBoundary } from './components';

<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Error caught:', error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `children`: Components to monitor for errors
- `fallback`: Custom fallback UI (optional)
- `onError`: Callback when error occurs (optional)

### 3. Toast Notifications

Display transient messages to the user with auto-dismiss.

```tsx
import { useToast } from './components';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast({
      type: 'success',
      message: 'Operation completed successfully!',
    });
  };

  const handleError = () => {
    showToast({
      type: 'error',
      message: 'Something went wrong',
    });
  };

  const handleWarning = () => {
    showToast({
      type: 'warning',
      message: 'Please review your input',
      duration: 5000, // Custom duration
    });
  };

  return <button onClick={handleSuccess}>Click me</button>;
}
```

**Note:** Wrap your app with `ToastProvider`:

```tsx
import { ToastProvider } from './components';

<ToastProvider>
  <App />
</ToastProvider>
```

### 4. Alert Component

Display persistent inline alerts.

```tsx
import { Alert } from './components';

<Alert type="success" title="Success">
  Your changes have been saved.
</Alert>

<Alert type="error" title="Error" dismissible onDismiss={() => {}}>
  Failed to save your changes.
</Alert>

<Alert type="warning">
  Warning: This action cannot be undone.
</Alert>

<Alert type="info">
  Tip: You can use keyboard shortcuts to navigate.
</Alert>
```

## Custom Hooks

### 1. useAsync

Simple async operation with loading and error states.

```tsx
import { useAsync } from './hooks/useAsync';

function MyComponent() {
  const { data, loading, error, execute, reset } = useAsync(
    async () => {
      const response = await fetch('/api/data');
      return response.json();
    },
    true // Execute immediately on mount
  );

  if (loading) return <Loading />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### 2. useDebounce

Debounce values to avoid excessive updates.

```tsx
import { useDebounce } from './hooks/useAsync';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    // This runs only when debouncedSearch changes (after 300ms)
    performSearch(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

### 3. useRetry

Retry failed operations automatically.

```tsx
import { useRetry } from './hooks/useAsync';

function UnstableComponent() {
  const { data, loading, error } = useRetry(
    async () => {
      const response = await fetch('/api/unstable');
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    {
      maxRetries: 3,
      delay: 1000,
    }
  );

  if (loading) return <Loading text="Retrying..." />;
  if (error) return <Alert type="error">Failed after retries</Alert>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### 4. useProjects (Custom Hook)

Manage projects with automatic loading and error handling.

```tsx
import { useProjects } from './hooks/useProjects';

function ProjectList() {
  const { projects, loading, error, refetch } = useProjects({
    autoFetch: true,
    filter: 'active',
  });

  if (loading) return <Loading />;
  if (error) return <Alert type="error">{error.message}</Alert>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### 5. useFileUpload (Custom Hook)

Handle file uploads with progress tracking.

```tsx
import { useFileUpload } from './hooks/useFileOperations';

function UploadComponent() {
  const { upload, uploading, progress, error } = useFileUpload();

  const handleUpload = async (file: File) => {
    await upload(file, async (file, onProgress) => {
      // Your upload logic here
      // Call onProgress(0-100) to update progress
      return { success: true };
    });
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files?.[0])} />
      {uploading && <Loading text={`Uploading: ${progress}%`} />}
      {error && <Alert type="error">{error.message}</Alert>}
    </div>
  );
}
```

### 6. useBatchOperation (Custom Hook)

Handle batch operations with partial success.

```tsx
import { useBatchOperation } from './hooks/useFileOperations';

function BatchDelete() {
  const { execute, processing, results } = useBatchOperation(
    async (items) => {
      return items.map(async (item) => {
        try {
          await deleteItem(item);
          return { success: true, data: item };
        } catch (error) {
          return { success: false, error: error as Error };
        }
      });
    }
  );

  return (
    <Button loading={processing} onClick={() => execute(itemsToDelete)}>
      Delete Selected
    </Button>
  );
}
```

## Button Loading State

The `Button` component has built-in loading support.

```tsx
import { Button } from './components';

function MyForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await saveData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSubmit} loading={loading}>
      Save Changes
    </Button>
  );
}
```

## Best Practices

### 1. Always Handle Loading States

```tsx
// ✅ Good
if (loading) return <Loading />;

// ❌ Bad - no loading state
if (data) return <DataDisplay />;
```

### 2. Always Handle Errors

```tsx
// ✅ Good
if (error) return <ErrorDisplay error={error} />;

// ❌ Bad - silent failure
return <DataDisplay />;
```

### 3. Provide User Feedback

```tsx
// ✅ Good
const { showToast } = useToast();

try {
  await operation();
  showToast({ type: 'success', message: 'Done!' });
} catch (error) {
  showToast({ type: 'error', message: error.message });
}
```

### 4. Use Debounce for User Input

```tsx
// ✅ Good - debounced search
const searchTerm = useDebounce(userInput, 300);

// ❌ Bad - triggers on every keystroke
const handleSearch = async () => {
  await search(userInput);
};
```

### 5. Wrap Critical Sections with ErrorBoundary

```tsx
// ✅ Good - catch component-level errors
<ErrorBoundary>
  <CriticalComponent />
</ErrorBoundary>

// ❌ Bad - entire app crashes
<CriticalComponent />
```

## Example: Complete Data Flow

```tsx
import { useState } from 'react';
import { useToast, Loading, Alert, Button, Input } from './components';
import { useAsync } from './hooks/useAsync';

function UserForm() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');

  const { loading, error, execute: submitForm } = useAsync(
    async () => {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to create user');

      return response.json();
    },
    false // Don't auto-execute
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await submitForm();
    
    if (success) {
      showToast({
        type: 'success',
        message: 'User created successfully',
      });
      setEmail('');
    }
  };

  return (
    <ErrorBoundary>
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert type="error" dismissible onDismiss={() => {}}>
            {error.message}
          </Alert>
        )}
        
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Button type="submit" loading={loading}>
          Create User
        </Button>
      </form>
    </ErrorBoundary>
  );
}
```

## Migration Guide

### From Manual State Management

**Before:**
```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const result = await fetch('/api/data');
    setData(result);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```tsx
const { data, loading, error } = useAsync(
  async () => {
    const result = await fetch('/api/data');
    return result;
  },
  true
);
```

## Troubleshooting

### Loading State Stuck

If loading never completes, ensure your async function:
1. Always resolves or rejects
2. Has proper error handling
3. Doesn't have infinite loops

### Toast Not Showing

Ensure your app is wrapped with `ToastProvider`:

```tsx
import { ToastProvider } from './components';

<ToastProvider>
  <App />
</ToastProvider>
```

### ErrorBoundary Not Catching

ErrorBoundary doesn't catch:
- Event handlers
- Asynchronous code
- Server-side errors
- Errors in the ErrorBoundary itself

For these, use try/catch and toast notifications.

## Performance Tips

1. **Debounce expensive operations**: Use `useDebounce` for search, autocomplete, etc.
2. **Cancel pending requests**: Use AbortController for fetch
3. **Memoize callbacks**: Use `useCallback` for event handlers
4. **Lazy load components**: Use `React.lazy()` and `Suspense`

## Testing

```tsx
// Test loading state
const { container } = render(<MyComponent loading={true} />);
expect(container.querySelector('.animate-spin')).toBeInTheDocument();

// Test error state
const { container } = render(<MyComponent error={new Error('Test')} />);
expect(container.textContent).toContain('Test');

// Test success state
const { container } = render(<MyComponent data={{ name: 'Test' }} />);
expect(container.textContent).toContain('Test');
```
