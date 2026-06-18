 🛡️ BacoorConnect Admin Dashboard

BacoorConnect Admin Dashboard is a comprehensive web-based administration and moderation platform developed specifically for the City of Bacoor's public safety ecosystem. It serves as the central command hub for LGU officials to manage citizen reports, verify incidents, monitor user activity, and maintain platform integrity through a secure, real-time interface powered by Firebase infrastructure.

📖 Table of Contents
1. [System Overview](#1-system-overview)
2. [Deep Feature Analysis](#2-deep-feature-analysis)
3. [Comprehensive Tech Stack](#3-comprehensive-tech-stack)
4. [Security Architecture](#4-security-architecture)
5. [Firebase Infrastructure](#5-firebase-infrastructure)
6. [Installation & Deployment](#6-installation--deployment)
7. [Operational Maintenance](#7-operational-maintenance)
8. [Troubleshooting & Support](#8-troubleshooting--support)

1. System Overview

BacoorConnect Admin Dashboard is the administrative counterpart to the BacoorConnect citizen mobile app. While citizens report incidents through the Android application, administrators use this web dashboard to verify, moderate, and act on those reports in real time. Every administrative action is recorded in an immutable audit trail, ensuring full accountability and transparency for LGU operations.

Key Objectives:
- Provide real-time incident moderation and status management for LGU personnel.
- Enable citizen identity verification and user account administration.
- Deliver actionable analytics and geographic insights into community safety trends.
- Maintain a complete, tamper-proof audit trail of all administrative actions.

2. Deep Feature Analysis

🔐 For Administrators (LGUs)

Secure Authentication Gateway: Email/password login with Firebase Authentication, gated by an admin privilege check against the Realtime Database. Only accounts with an admin flag are granted access.

Centralized Moderation Dashboard: A comprehensive analytics overview displaying real-time report statistics (total counts by status), interactive charts for status distribution, and a geographic map with Leaflet showing all incident locations color-coded by category (Accident, Traffic, Medical, Criminal).

Report Verification Console: A dedicated page to review all citizen-submitted reports. Each report displays full metadata — category, description, coordinates, timestamp, upvotes/downvotes, user ID, and attached images. Administrators can update report status (submitted → pending → success/failed), preview images in a modal, and inspect raw AI scan results from the mobile app's verification pipeline.

Audit Trail Viewer: A searchable, tabbed interface separating user activity logs from admin activity logs. The Admin Logs tab is exclusively visible to admin-level users. Every action is timestamped and attributed, providing a complete chain of custody.

User Management Console: A full CRUD interface for all platform users. Administrators can search users, edit profile fields inline (name, email, contact), delete accounts with confirmation, and view admin badges. Editing privileges are role-aware — admin users can edit, while standard users can only be deleted.

Profile Management: Administrators can manage their own profile information including name, contact number, and profile image upload to Firebase Storage.

📊 Analytics & Visualization

Status Distribution Chart: A bar chart built with Recharts that visualizes the count of reports grouped by their current status (Submitted, Pending, Success, Failed), giving administrators an at-a-glance view of platform health.

Interactive Incident Map: Powered by Leaflet and OSM tiles, the map plots all report markers with category-specific icons (accident, traffic, medical, criminal), enabling geographic identification of incident hotspots across Bacoor.

User Analytics Breakdown: Horizontal bar distribution showing the ratio of regular users to admin users alongside total user counts.

3. Comprehensive Tech Stack

Frontend (Web)
| Technology | Purpose |
|---|---|
| React 19.2.6 | UI framework with component-based architecture |
| React Router DOM 7.0.1 | Client-side routing with layout route pattern |
| TypeScript ~6.0.2 | Full type safety across the codebase |
| Vite 8.0.12 | Lightning-fast build tool and HMR dev server |
| CSS3 with CSS Variables | Themed styling with dark navy/purple gradient design |

Data Visualization & Maps
| Technology | Purpose |
|---|---|
| Leaflet 1.9.4 + react-leaflet 5.0.0 | Interactive map rendering with OSM tile layer |
| Recharts 3.8.1 | Bar chart for report status distribution analytics |

Backend Infrastructure (Firebase)
| Service | Purpose |
|---|---|
| Firebase Authentication | Email/password authentication with session persistence via localStorage |
| Firebase Realtime Database | Primary data store for Users, Reports, and audit_trail nodes |
| Firebase Storage | Profile image uploads for admin users |

Development Tooling
| Tool | Purpose |
|---|---|
| ESLint 10.3.0 | Code quality enforcement with TypeScript, React Hooks, and React Refresh plugins |
| TypeScript 6.0.2 | Static type checking across project references (app + node) |

4. Security Architecture

🛡️ Dual-Layer Authentication

The admin dashboard employs a two-step authentication process that ensures only authorized LGU personnel gain access:

```
User enters email + password
        |
        ▼
Step 1 — Firebase Realtime DB lookup in /Users node
  Queries for user record matching the provided email
        |
        ▼
Step 2 — Admin privilege verification
  Checks if the user record contains admin = 1 | '1' | true
        |
  ┌─────┴─────┐
  |           |
  No          Yes
  |           |
  └─ "Access  └─ Firebase Auth: signInWithEmailAndPassword()
     denied"         |
        ┌────────────┼────────────┐
        ▼            ▼            ▼
  localStorage:  localStorage:  localStorage:
  isLoggedIn     userEmail      userId
```

🔐 Session Management

- Login state is persisted in localStorage with four keys: isLoggedIn, userEmail, userId, firebaseUid.
- A custom authChanged event is dispatched on the window object to synchronize authentication state across components without requiring a global state library.
- Logout clears all localStorage keys, signs out of Firebase Auth, and redirects to the login page.

🚪 Route Protection

- Imperative Guard: AdminLayout.tsx runs a useEffect on mount that checks localStorage for isLoggedIn. If absent, it imperatively navigates to / using React Router's navigate().
- Conditional Redirect: The root route (/) conditionally renders <Navigate to="/dashboard"> if isLoggedIn is true, or <Login /> otherwise.
- Role-Aware Rendering: Admin-only UI elements (Admin Logs tab in Audit Trail, Edit buttons in User List) are conditionally rendered based on the current user's admin status fetched from the database.

🔒 Data Access

All data communication occurs exclusively through the Firebase SDK over encrypted HTTPS connections. No custom backend API exists — every read and write operation goes directly through Firebase's security rules and TLS-encrypted channels.

5. Firebase Infrastructure

Database Schema

The admin dashboard interacts with three primary nodes in the Firebase Realtime Database, shared with the BacoorConnect mobile application:

```
/
├── Users/                          // Citizen and admin accounts
│   └── {userId}/
│       ├── email: string
│       ├── firstName: string
│       ├── lastName: string
│       ├── contactNum (or phone): string
│       ├── profileImage: string (Firebase Storage URL)
│       ├── admin: 1 | '1' | true (grants dashboard access)
│       ├── trustScore: number
│       ├── totalReports: number
│       ├── approvedReports: number
│       ├── joinDate: string
│       ├── status: string
│       └── ...
│
├── Report/                         // Citizen-submitted incident reports
│   └── {reportId}/
│       ├── category: string (accident | traffic | medical | criminal)
│       ├── description: string
│       ├── location: string
│       ├── addressPrecision: string
│       ├── latitude: number
│       ├── longitude: number
│       ├── status: 'submitted' | 'pending' | 'success' | 'failed'
│       ├── upvotes: number
│       ├── downvotes: number
│       ├── userId: string
│       ├── timestamp: number (epoch millis)
│       ├── imageUrl: string (Firebase Storage URL)
│       ├── scanResults: object (AI verification results from mobile pipeline)
│       └── ...
│
└── audit_trail/                    // Immutable administrative action log
    └── {entryId}/
        ├── userId: string
        ├── userName (or name/email): string
        ├── action (or type): string
        ├── details (or notes/message): string
        ├── timestamp: number | string (epoch millis or ISO)
        ├── isAdmin: boolean
        └── ...
```

Security Rules

The admin dashboard relies on Firebase Realtime Database security rules to enforce access control at the data level. Key rules relevant to the admin interface:

- Users node: Admin users (root.child('Users').child(auth.uid).child('admin').val() == 1) have read/write access to all user records. Non-admin users can only read/write their own record.
- Report node: Reports are publicly readable. Write access requires authentication. Report edits, flags, and edit history are tracked with validation rules.
- audit_trail node: Readable and writable by all authenticated users for transparency.

Environment Configuration

All Firebase connectivity is configured through environment variables in .env:

| Variable | Description |
|---|---|
| VITE_FIREBASE_API_KEY | Firebase project API key |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase authentication domain |
| VITE_FIREBASE_DATABASE_URL | Realtime Database instance URL |
| VITE_FIREBASE_PROJECT_ID | Firebase project identifier |
| VITE_FIREBASE_STORAGE_BUCKET | Cloud Storage bucket for uploads |
| VITE_FIREBASE_MESSAGING_SENDER_ID | FCM sender identifier |
| VITE_FIREBASE_APP_ID | Firebase application identifier |
| VITE_FIREBASE_MEASUREMENT_ID | Google Analytics measurement ID |

6. Installation & Deployment

For Developers

Prerequisites:
- Node.js 18+
- npm (included with Node.js)

Setup Steps:

```bash
# 1. Clone the repository
git clone <repository-url>
cd admin-web

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The development server starts at http://localhost:5173/ (or the next available port) with full Hot Module Replacement.

For LGU Deployment

Firebase Configuration:
1. Ensure the Firebase project (baconek-5517b) has Email/Password authentication enabled.
2. Verify the Realtime Database exists at the URL specified in .env.
3. Create admin accounts by manually setting admin: 1 in the Users node for authorized LGU personnel.

Production Build:
```bash
npm run build
```

The production build outputs to the dist/ directory, which can be deployed to any static hosting provider (Firebase Hosting, Vercel, Netlify, etc.).

Available Commands

| Command | Description |
|---|---|
| npm run dev | Start Vite development server with HMR |
| npm run build | TypeScript compilation + Vite production build |
| npm run preview | Preview production build locally |
| npm run lint | Run ESLint across all source files |

7. Operational Maintenance

Daily Tasks

Report Moderation: Review incoming reports in the Report Verification page. Update status from submitted to pending, success, or failed based on verification results and manual review.

User Management: Monitor new user registrations. Review accounts for suspicious activity and manage account status as needed.

Audit Review: Periodically review the Audit Trail to ensure all administrative actions are appropriate and that moderators are acting within policy.

Data Integrity: Verify that the dashboard's analytics (report counts, user counts) align with the actual data in the Firebase Realtime Database.

LGU Recommendations

Dedicated Team: Assign at least one staff member to active monitoring of the admin dashboard during operational hours.

Account Audits: Regularly review the Users node for orphaned or inactive admin accounts and revoke privileges as necessary.

Community Coordination: Use the geographic insights from the Incident Map to coordinate with barangay-level responders and identify emerging safety trends.

8. Troubleshooting & Support

Common Issues

Login Fails with "Access Denied":
- Verify the account has admin: 1 set in the Firebase Realtime Database Users node.
- Confirm the email matches exactly (case-sensitive query).

Dashboard Shows No Data:
- Verify the Firebase Realtime Database has data in the Report, Users, and audit_trail nodes.
- Check browser console for Firebase permission errors.

Map Not Loading:
- Ensure the device has internet access (Leaflet tiles are loaded from OpenStreetMap CDN).
- Check that report records contain valid latitude and longitude values.

Build Errors:
- Run npm install to ensure all dependencies are installed.
- Verify Node.js version is 18 or higher.

📞 Support & Contact
Developer: [FourSight]
Email: [marcdaniel.manuel@gmail.com]

📄 License: This project and its underlying architecture are developed exclusively for the City of Bacoor. All rights reserved.
