# Add Block/Unblock Feature

## Goal
Allow admin to block a user by phone number (or user id) so that the user cannot register or log in again until unblocked. The admin panel should show a **Block** section in the Users tab where each user has a toggle/button to block/unblock. The UI must be responsive and match existing premium design.

## User Review Required
- Confirm the API endpoints (`/api/admin/users/:id/block`, `/api/admin/users/:id/unblock`) and the data shape (user object includes `blocked: boolean`).
- Confirm whether the block should be based on phone number or user id. We'll use `user.id` (which is the phone number in this app).

## Open Questions
- Should blocked users be hidden from the Users list or shown with a disabled state? We'll show them with a visual indicator and a **Unblock** button.
- Do we need notification to the blocked user? Not in scope for now.

## Proposed Changes
### Frontend (`src/components/AdminPanel.tsx`)
- Extend the users fetch to include `blocked` status.
- Add a new **Block** column in the users table list.
- For each user, render a **Block** button if `!user.blocked`, otherwise an **Unblock** button.
- Clicking the button calls a new API (`/api/admin/users/${id}/block` or `/unblock`).
- Optimistically update UI and re‑fetch users.
- Add a new navigation button `🔒 Blocked Users` (or integrate into Users tab).
- Add a new state `blockedUsers` if needed, but we can reuse `users` list.

### Backend (`api/admin/users.js` – Express style)
- Add routes:
  ```js
  router.put('/users/:id/block', async (req,res)=>{ /* set blocked:true */ });
  router.put('/users/:id/unblock', async (req,res)=>{ /* set blocked:false */ });
  ```
- Ensure the user model (Mongo/JSON) has a `blocked` boolean field.
- Update login (`api/login.js`) and registration (`api/register.js`) to reject if `user.blocked`.

### Database
- If using a JSON file or DB, add `blocked` field default `false`.

## Verification Plan
### Automated Tests
- Run `npm test` (if tests exist) after adding unit tests for block/unblock routes.
- Manually test:
  1. Admin blocks a user → user disappears from login screen.
  2. Attempt to register same number → error.
  3. Admin unblocks → login works again.

### Manual Verification
- Deploy locally, open admin panel, block a user, try to login as that user.
- Check UI responsiveness on mobile.

---

*Please review the plan and confirm or provide adjustments.*
