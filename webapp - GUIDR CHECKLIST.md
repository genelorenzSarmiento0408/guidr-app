**WORKS \- GUIDR (checked as of DATE)**

**Scope of Work: Included Features & Deliverables PER CONTRACT**

1. ## **Major Core Infrastructure (High Priority), Functional Features (Medium Priority)**

| Code |  | Accomplished | Remaining  | Note |  |
| :---- | :---- | :---- | :---- | ----- | :---- |
|  **A.1** | **Supabase Backend & Auth** |  |  |  |  |
| A.1.1 | Supabase Auth implementation (Email/Password or Social Providers). |  |  |  |  |
| A.1.2 | Row Level Security (RLS) policies for Student vs. Org data protection. |  |  |  |  |
| A.1.3 | Next.js API Routes / Server Actions for server-side logic and Stripe handshakes. |  |  |  |  |
| A.1.4 | Database Schema validation in Supabase (Profiles, Opportunities, Matches). |  |  |  |  |
| A.2 | **User Profile System** |  |  |  |  |
| A.2.1 | **Student Side:** Skills tagging, Year standing dropdown, Social link inputs. |  |  |  |  |
| A.2.2 | **Organization Side:** Company bio, Website link, Logo upload (Supabase Storage). |  |  |  |  |
| A.3 | **Opportunity Board Engine** |  |  | In A.3-A.4 there is no figma design yet (in the new version) |  |
| A.3.1 | CRUD operations for posts (Create, Read, Update, Delete) via Supabase Client. |  |  |  |  |
| A.3.2 | Categorization System |  |  |  |  |
| A.4 | **Payment Integration (Stripe/PayMongo)** |  |  |  |  |
| A.4.1 | Stripe/PayMongo Webhook handler in Next.js API routes. |  |  |  |  |
| A.4.2 | Success/Cancel callback URLs. |  |  |  |  |
| A.4.3 | Database trigger or Edge Function to enable "Premium Posts" upon payment. |  |  |  |  |
| A.5 | **Basic Matchmaking Logic** |  |  |  |  |
| A.5.1 | Supabase RPC or Filter-based matching (Profile Skills ↔ Opportunity Tags). |  |  |  |  |
| A.5.2 | "Recommended for You" section on student dashboards. |  |  |  |  |
| A.6 | **Admin Dashboard (CMS)** |  |  |  |  |
| A.6.1 | Content moderation queue (Flag/Delete inappropriate posts). |  |  |  |  |
| A.6.2 | User management (View/Deactivate accounts via Supabase Admin API). |  |  |  |  |
| A.6.3 | Transaction history log for payments. |  |  |  |  |
| A.7 | **Opportunity Filtering & Search** |  |  |  |  |
| A.7.1 | Search bar with debounced input. |  |  |  |  |
| A.7.2 | **Filters**: Status (Open/Closed), Type, and Required Skills. |  |  |  |  |

2. ## **UI/UX & Responsive Design (Medium Priority), Minor Features & Polish (Low Priority), UAT & Validation (Pre-Launch)**

|  |  | Accomplished | Remaining  | Note |  |
| :---- | :---- | :---- | :---- | :---- | :---- |
|  B.1 | **Responsive Navigation** |  |  |  |  |
| B.1.1 | Desktop Header vs. Mobile Hamburger Menu. |  |  |  |  |
| B.1.2 | Contextual links (e.g., "Post an Opp" only visible to Orgs). |  |  |  |  |
| B.2 | **Figma Design Fidelity** |  |  |  |  |
| B.2.1 | Consistent Tailwind color palette (Brand primary/secondary). |  |  |  |  |
| B.2.2 | Standardized border-radius and spacing (as per Figma). |  |  |  |  |
| B.2.3 | Loading states/Skeletons for data fetching. |  |  |  |  |
| B.3 | **Form Validations** |  |  |  |  |
| B.3.1 | Client-side validation (Required fields, Email format). |  |  |  |  |
| B.3.2 | UI Toast/Alert notifications for Supabase error messages. |  |  |  |  |
| B.4 | **Social Links & Meta** |  |  |  |  |
| B.4.1 | OpenGraph tags for social sharing. |  |  |  |  |
| B.4.2 | Dynamic page titles (e.g., "Internship at Google | Guidr"). |  |  |  |  |
| B.5 | **User Feedback Loops** |  |  |  |  |
| B.5.1 | Empty states (e.g., "No opportunities found matching your skills"). |  |  |  |  |
| B.5.2 | Confirmation modals for deleting posts or logging out. |  |  |  |  |
| B.6 | **Performance & SEO** |  |  |  |  |
| B.6.1 | Image optimization (Next.js \<Image /\> component). |  |  |  |  |
| B.6.2 | Basic SEO meta descriptions for the landing page. |  |  |  |  |
| B.7 | **Environment Setup** |  |  |  |  |
| B.7.1 | Deployment to Vercel (Staging/Preview URL). |  |  |  |  |
| B.7.2 | 5 Tester accounts provisioned in Supabase Auth (Student & Org roles). |  |  |  |  |
| B.8 | **Stress Testing** |  |  |  |  |
| B.8.1 | Payment flow "Stress Test" (Ensuring double-charges don't occur). |  |  |  |  |
| B.8.2 | Rapid form submission handling. |  |  |  |  |
| B.9 | **Issue Tracking** |  |  |  |  |
| B.9.1 | Shared tracker initialized (Trello/Sheets). |  |  |  |  |
| B.9.2 | Feedback implementation loop for UI bugs. |  |  |  |  |

