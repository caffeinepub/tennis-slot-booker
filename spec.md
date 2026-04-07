# CourtSync – Tennis Slot Booker

## Current State
- Users can browse, post, book, edit, and delete time slots.
- A "My Bookings" section shows slots posted and booked by the current user.
- No way to cancel a booking once it's made.
- No profile bio/comment feature.

## Requested Changes (Diff)

### Add
- `cancelBooking(slotId, bookerUsername)` backend function: resets a booked slot back to `available` and clears the `bookerUsername`, callable only by the current booker.
- User profile map in backend storing a short comment/bio per username: `setProfileComment(username, comment)` and `getProfileComment(username)`.
- Cancel button in "Slots I've Booked" section for each booked slot.
- Profile comment/bio text area in the top nickname bar (shown after a nickname is set), allowing users to save a short comment about themselves.

### Modify
- `SlotCard`: accept an `onCancel` prop and show a "Cancel Booking" button when the current user is the booker and `showCancelButton` is true.
- `App.tsx`: wire up cancel handler using new `useCancelBooking` hook; add profile comment UI in the utility bar.
- `useQueries.ts`: add `useCancelBooking` and `useSetProfileComment` / `useGetProfileComment` hooks.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `cancelBooking`, `setProfileComment`, `getProfileComment` to `main.mo`.
2. Update `backend.d.ts` to expose the three new functions.
3. Add `useCancelBooking`, `useSetProfileComment`, `useGetProfileComment` hooks to `useQueries.ts`.
4. Update `SlotCard` to accept and render `onCancel` / `showCancelButton`.
5. Update `App.tsx`:
   - Add profile comment state + textarea + save button in the utility bar.
   - Wire `onCancel` to the "Slots I've Booked" grid cards.
