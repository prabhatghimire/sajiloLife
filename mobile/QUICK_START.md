# Quick Start: RTK Query Migration

## ✅ What's Fixed

The import errors are now resolved! I've updated your Redux slices to work with RTK Query:

### Updated Files:

- ✅ `src/store/slices/authSlice.ts` - Removed old API imports, simplified for local state
- ✅ `src/store/slices/deliverySlice.ts` - Removed old API imports, simplified for offline functionality
- ✅ `src/store/slices/syncSlice.ts` - Removed old API imports, simplified for local sync state

### New Files Created:

- ✅ `src/hooks/useAuth.ts` - Custom hook for authentication with RTK Query
- ✅ `src/hooks/useDelivery.ts` - Custom hook for delivery management with RTK Query
- ✅ `src/hooks/useSync.ts` - Custom hook for sync management with RTK Query
- ✅ `src/components/LoginExample.tsx` - Example of how to use the new hooks

## 🚀 How to Use in Your Screens

### 1. Update Your LoginScreen

Replace your old login logic with the new `useAuth` hook:

```typescript
// OLD WAY (remove this)
import { login, clearError } from '../../store/slices/authSlice';
const dispatch = useDispatch();
await dispatch(login({ email, password })).unwrap();

// NEW WAY (use this)
import { useAuth } from '../../hooks/useAuth';
const { login, isLoginLoading, error } = useAuth();
await login({ email, password });
```

### 2. Update Your Delivery Screens

Use the new `useDelivery` hook for delivery operations:

```typescript
// OLD WAY (remove this)
import { createDeliveryRequest } from '../../store/slices/deliverySlice';
await dispatch(createDeliveryRequest(data)).unwrap();

// NEW WAY (use this)
import { useDelivery } from '../../hooks/useDelivery';
const { createDeliveryRequest, isCreating } = useDelivery();
await createDeliveryRequest(data);
```

### 3. For Data Fetching

Use RTK Query hooks directly:

```typescript
// Get delivery requests
const { data: requests, isLoading, error } = useGetDeliveryRequestsQuery({});

// Get user profile
const { data: profile } = useGetProfileQuery();

// Get partners
const { data: partners } = useGetPartnersQuery({ status: 'online' });
```

## 🎯 Available RTK Query Hooks

### Auth:

- `useLoginMutation()`
- `useRegisterMutation()`
- `useLogoutMutation()`
- `useGetProfileQuery()`

### Delivery:

- `useGetDeliveryRequestsQuery()`
- `useCreateDeliveryRequestMutation()`
- `useUpdateDeliveryRequestMutation()`
- `useUpdateDeliveryStatusMutation()`

### Partners:

- `useGetPartnersQuery()`
- `useGetNearbyPartnersQuery()`
- `useGetAvailablePartnersQuery()`

## 🔧 Next Steps

1. **Test the app** - The import errors should be resolved now
2. **Update your screens** - Replace old Redux auth/delivery calls with new hooks
3. **Remove old API file** - Delete `src/services/api.tsx` once everything works
4. **Check examples** - See `LoginExample.tsx` for reference

## 📱 Example Usage

```typescript
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGetDeliveryRequestsQuery } from '../services/apiSlice';

const MyScreen = () => {
  const { login, isLoginLoading } = useAuth();
  const { data: requests, isLoading } = useGetDeliveryRequestsQuery({});

  const handleLogin = async () => {
    try {
      await login({ email: 'test@example.com', password: 'password' });
      // Success!
    } catch (error) {
      // Handle error
    }
  };

  return (
    // Your UI here
  );
};
```

Your app should now work without the import errors! 🎉
