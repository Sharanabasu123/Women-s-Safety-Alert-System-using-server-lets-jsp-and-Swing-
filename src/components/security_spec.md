# Security Specification - Women Safety Alert System

## 1. Data Invariants
- An emergency contact must belong to a specific user and cannot be accessed by others.
- An alert must have a valid user ID, timestamp, and location.
- Only the creator of an alert or an admin can view/manage the alert (actually, for safety, admins monitor all alerts).
- Users cannot change their own roles (admin/user).

## 2. The Dirty Dozen Payloads (Rejection Targets)

1. **Identity Spoofing**: Attempt to create an alert with someone else's `userId`.
2. **Privilege Escalation**: Attempt to update own user profile to set `role: 'admin'`.
3. **Ghost Field Injection**: Adding `isVerified: true` to a contact document.
4. **ID Poisoning**: Using a 2KB string as a `contactId`.
5. **Orphaned Contact**: Creating a contact for a non-existent `userId` (harder to check without cross-resource `exists`, but we will check against `request.auth.uid`).
6. **Malicious Location**: Sending `lat: 9999` (outside valid Earth range).
7. **Terminal State Bypass**: User tries to un-resolve an alert after an admin resolved it.
8. **PII Leak**: Non-owner trying to list another user's contacts.
9. **Blanket Read Attack**: Unauthenticated user trying to read the `/alerts` collection.
10. **Timestamp Manipulation**: Sending a `timestamp` from 1970 instead of `request.time`.
11. **Shadow Contact Update**: Changing the `userId` of an existing contact to "steal" it.
12. **Massive Payload**: Sending a 500KB string in the `message` field of an alert.

## 3. Test Runner (Draft)
```typescript
// firestore.rules.test.ts (logic plan)
// - Test: Create alert as authenticated user -> PASS
// - Test: Create alert with different userId -> FAIL
// - Test: Update own role to admin -> FAIL
// - Test: Read someone else's contacts -> FAIL
// - Test: List alerts as unauthenticated -> FAIL
```
