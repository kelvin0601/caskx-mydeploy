# Custom Hooks

## Authentication Hooks

### useAuth

Consolidated auth hook combining session, user state, and 2FA status.

```typescript
const {
    session,
    user,
    isLogin,
    isAuthenticated,
    is2faEnabled,
    setMyUser,
    reset,
    currentStep,
    nextStep,
    prevStep,
} = useAuth();
```

### useAuthForm

Auth form utilities combining disable button logic and mutations.

```typescript
const { form, isDisabled, isPending, handleSubmit } = useAuthForm({
    form,
    mutationFn: authService.forgotPassword,
    onSuccess: () => toast.success("Success!"),
});
```

## UI Hooks

### useResponsive

Responsive breakpoint detection.

```typescript
const { isMobile, isTablet, isDesktop } = useResponsive();
```

### useDebounce

Debounce a value.

```typescript
const debouncedValue = useDebounce(value, 500);
```

### useClickOutside

Detect clicks outside an element.

```typescript
const ref = useRef(null);
useClickOutside(() => setOpen(false), ref);
```

## Data Hooks

### useGetStateQuery

Wrapper around TanStack Query with loading state.

```typescript
const { status, data } = useGetStateQuery({
    key: ["query-key"],
    fetchFn: () => service.getData(),
});
```

### useUpdateSearchParams

Update URL search params.

```typescript
const { updateParams, valueParams } = useUpdateSearchParams("filter");
```
