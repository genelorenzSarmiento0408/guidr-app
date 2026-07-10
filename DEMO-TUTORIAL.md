GUIDR Demo Tutorial (Code-by-Code)

Purpose
This guide provides demo steps for each checklist code in webapp - GUIDR CHECKLIST.md.
Use this during client walkthroughs, QA demos, and UAT sessions.

Pre-Demo Setup
1. Start app with npm run dev.
2. Ensure Supabase project is connected and migrations are applied.
3. Use at least 2 accounts: one Student and one Organization.
4. Optional for payments: set Stripe/PayMongo environment variables.

Legend
- Demo Ready: You can run the steps now.
- Partial: You can demo part of it; mention limitation.
- Pending: Feature not yet available for full demo.

--------------------------------------------------
A. Major Core Infrastructure
--------------------------------------------------

A.1.1 Supabase Auth implementation
Status: Demo Ready
Demo steps:
1. Open Register page and create one Organization and one Mentor account.
2. Show required field and password checks.
3. Logout and login with Email/Password.
4. Login with Google OAuth.
Expected:
- Session is created and user is redirected.

A.1.2 RLS for Student vs Org data protection
Status: Demo Ready
Demo steps:
1. Login as Student and attempt create/update/delete post actions.
2. Login as Organization and perform create/update/delete post actions.
3. Verify Student cannot perform org-only post writes.
Expected:
- RLS allows only valid role-based actions.

A.1.3 API routes / server logic / payment handshakes
Status: Demo Ready (for implemented routes)
Demo steps:
1. Call payment checkout route with authenticated user and owned post.
2. Verify checkout URL is returned.
3. Trigger webhook test payload and verify DB updates.
Expected:
- API routes process request and update payment tables.

A.1.4 Schema validation in Supabase (Profiles, Opportunities, Matches)
Status: Partial
Demo steps:
1. Show profiles and posts schema fields in Supabase table editor.
2. Insert invalid status and verify check constraints reject invalid values.
3. Show messages/attachments schema support.
Expected:
- Constraints and table structure enforce valid data.
Note:
- Dedicated matches table is not fully formalized yet.

A.2.1 Student profile (skills, year standing, links)
Status: Demo Ready
Demo steps:
1. Open student profile and click edit.
2. Add skills tags, year standing, mentorship/collab links.
3. Save and refresh.
Expected:
- Fields persist and display correctly.

A.2.2 Organization profile (bio, website, logo)
Status: Demo Ready
Demo steps:
1. Open org profile edit.
2. Upload logo/avatar.
3. Add bio and website link.
4. Save profile.
Expected:
- Uploaded media and text fields persist and display.

A.3.1 Post CRUD via Supabase client
Status: Demo Ready
Demo steps:
1. Create new post.
2. Edit existing post.
3. Toggle status Open/Closed.
4. Delete post (confirm prompt).
Expected:
- CRUD actions update list immediately.

A.3.2 Categorization system
Status: Demo Ready
Demo steps:
1. Create posts with different types.
2. Filter by type in board.
Expected:
- Type/category values reflect in filters and cards.

A.4.1 Stripe/PayMongo webhook handlers
Status: Demo Ready (configured env required)
Demo steps:
1. Trigger provider webhook event.
2. Verify payment transaction insert/update.
3. Verify premium access row upsert.
Expected:
- Paid events enable premium post state.

A.4.2 Success/Cancel callback URLs
Status: Demo Ready
Demo steps:
1. Complete checkout and land on success page.
2. Cancel checkout and land on cancel page.
Expected:
- Correct callback page per outcome.

A.4.3 Premium enable trigger/edge behavior
Status: Demo Ready (DB-upsert approach)
Demo steps:
1. Complete successful webhook flow.
2. Check post_premium_access table for post id.
Expected:
- Premium flag access row exists for paid post.

A.5.1 Matchmaking logic
Status: Demo Ready
Demo steps:
1. Add required skills on a post.
2. Open matching action.
3. Show ranked profiles.
Expected:
- Skill-based scoring and shortlist appears.

A.5.2 Recommended for You
Status: Demo Ready
Demo steps:
1. Login as student with populated skills.
2. Open dashboard home.
Expected:
- Recommended section appears with matching posts.

A.6.1 Content moderation queue
Status: Partial
Demo steps:
1. Show moderation-related edge function (image moderation).
2. Explain no full queue UI yet.
Expected:
- Partial moderation capability only.

A.6.2 User management via admin API
Status: Pending
Demo steps:
1. Explain feature scope and current status.
Expected:
- No full in-app admin deactivate flow yet.

A.6.3 Transaction history log
Status: Partial
Demo steps:
1. Open payment_transactions table.
2. Show rows after test checkout/webhook.
Expected:
- Transaction records are available in DB.
Note:
- Dedicated admin transaction dashboard UI may still be limited.

A.7.1 Debounced search
Status: Demo Ready
Demo steps:
1. Type quickly in search box on opportunity board.
2. Pause typing.
Expected:
- Results update after debounce delay.

A.7.2 Filters (Status, Type, Required Skills)
Status: Demo Ready
Demo steps:
1. Apply status filter open/closed.
2. Apply type filter.
3. Add required skills keyword.
Expected:
- Result set narrows correctly.

--------------------------------------------------
B. UI/UX, Validation, SEO, UAT
--------------------------------------------------

B.1.1 Responsive navigation
Status: Partial
Demo steps:
1. Show desktop nav.
2. Simulate mobile viewport and verify menu behavior.
Expected:
- Menu remains accessible.
Note:
- Full responsive polish may still need review.

B.1.2 Contextual links by role
Status: Partial
Demo steps:
1. Login as Student and Organization separately.
2. Check visibility of role-specific actions.
Expected:
- Organization actions should be role-appropriate.

B.2.1 Tailwind color palette consistency
Status: Partial
Demo steps:
1. Navigate across login, browse, profile, messages.
2. Verify black/green brand consistency.
Expected:
- Core areas align with brand palette.

B.2.2 Border radius and spacing standardization
Status: Partial
Demo steps:
1. Compare cards/forms/buttons across pages.
Expected:
- Mostly consistent visual rhythm.

B.2.3 Loading states and skeletons
Status: Partial
Demo steps:
1. Trigger async actions (save post, send message, upload file).
2. Show loading indicators.
Expected:
- Loading indicators present for key actions.

B.3.1 Client-side validation
Status: Demo Ready
Demo steps:
1. Submit forms with missing required fields.
2. Submit invalid email in register flow.
Expected:
- Validation messages shown before server call.

B.3.2 UI alerts for Supabase errors
Status: Demo Ready
Demo steps:
1. Force an error (network off or invalid action).
2. Submit form or send message.
Expected:
- Error alert/message is shown in UI.

B.4.1 OpenGraph tags
Status: Demo Ready
Demo steps:
1. Inspect page source head metadata.
2. Verify og:title, og:description, og:type.
Expected:
- OpenGraph metadata exists.

B.4.2 Dynamic page titles
Status: Demo Ready
Demo steps:
1. Open profile pages for different users.
2. Check browser title.
Expected:
- Title changes per profile.

B.5.1 Empty states
Status: Demo Ready
Demo steps:
1. Run search with no matches.
2. Open conversations with no messages.
3. Open saved profiles with no entries.
Expected:
- Clear empty-state messages appear.

B.5.2 Confirmation modals for delete/logout
Status: Demo Ready
Demo steps:
1. Delete opportunity and observe confirmation.
2. Click logout and observe confirmation modal.
Expected:
- Destructive actions require confirmation.

B.6.1 Next Image optimization
Status: Demo Ready
Demo steps:
1. Inspect key profile/list views.
2. Verify image components use Next Image in updated areas.
Expected:
- Next Image used for optimized rendering.

B.6.2 Landing page SEO description
Status: Demo Ready
Demo steps:
1. Inspect metadata for home route.
2. Verify description content in head tags.
Expected:
- Landing page has explicit SEO description.

B.7.1 Vercel deployment
Status: Pending/External
Demo steps:
1. Deploy from Vercel dashboard.
2. Validate preview URL and env vars.
Expected:
- App reachable in staging/preview.

B.7.2 Tester accounts provisioned
Status: External Setup
Demo steps:
1. In Supabase Auth, verify 5 seed tester accounts.
2. Confirm role coverage.
Expected:
- Accounts available for UAT scripts.

B.8.1 Payment stress test
Status: Partial
Demo steps:
1. Trigger repeated payment events in test mode.
2. Verify no duplicate premium grants.
Expected:
- Idempotent upserts prevent duplicate records.

B.8.2 Rapid form submission handling
Status: Partial
Demo steps:
1. Spam click create/send buttons.
2. Verify disabled/loading states prevent duplicate actions.
Expected:
- Duplicate writes minimized.

B.9.1 Shared issue tracker initialized
Status: External Process
Demo steps:
1. Open project tracker (Trello/Sheets/Jira).
2. Confirm columns and ticket flow.
Expected:
- Team issue loop is visible.

B.9.2 Feedback implementation loop
Status: External Process
Demo steps:
1. Record bug, assign owner, push fix, re-test.
2. Mark ticket done after verification.
Expected:
- Repeatable bug feedback loop is in place.

--------------------------------------------------
Current Problem Snapshot (for demo prep)
--------------------------------------------------
1. Lint warning: src/app/login/page.tsx has an unused Image import.
2. Editor warning: src/components/BrowseFeedClient.tsx suggests bg-linear-to-t utility replacement.
3. Editor side-effect typing warning in src/app/layout.tsx for globals.css may appear in diagnostics tooling, while lint passes.

End of guide.
