# Connect — Amrita Vishwa Vidyapeetham

**Student & Faculty Collaboration Platform • Ettimadai Campus, Coimbatore**

Connect is an autonomous campus collaboration and academic coordination platform engineered for students, faculty coordinators, and lab leads at Amrita Vishwa Vidyapeetham. It integrates event discovery, research assistantships, interval clash detection, carpooling, verified On-Duty (OD) regularizations, and scoped peer communications into a unified, accessible interface.

---

## Architecture Overview

Connect is built on modern web standards with strict type safety, responsive component design, and zero-compromise institutional governance:

- **Frontend Framework**: React 19 with TypeScript
- **Styling & Design System**: Tailwind CSS v4 with semantic CSS tokens (`--color-primary`, `--color-page-bg`, `--color-surface`, etc.)
- **Build Tooling & Bundler**: Vite 8 with ESM & Fast Refresh
- **Quality & Static Analysis**: Oxlint (fast Rust-based static linter)
- **Automated Test Suite**: Vitest 5 (interval clash detector, roll parser, security RBAC, form validation)
- **Icons & Visuals**: Lucide React with cohesive stroke geometry

---

## Core Capabilities & Modules

### 1. Events Feed & Academic Opportunities
- Discovery engine for student casual events, creative projects, hackathons, official workshops, research calls, and fest volunteering.
- Multi-term querying by title, required skill sets (ROS2, OpenCV, React, etc.), venue, and organizer.
- Granular filtering by host role, joining mode (Instant FCFS vs Locked / Approval required), verified OD status, and department.
- Real-time slot progress bar and remaining seat capacity counters.

### 2. Amrita Roll-Number Auto-Parser
- Deconstructs official Amrita roll identifiers (e.g., `CB.EN.U4ARE24001`) in real-time.
- Automatically resolves:
  - **Campus**: Coimbatore (CB), Amritapuri (AM), Bengaluru (BL), Chennai (CH), Kochi (KO), Mysuru (MY), Amaravati (AR), Nagercoil (NC).
  - **School**: School of Engineering (EN), School of Computing (SC), School of Arts and Sciences (AS), etc.
  - **Degree**: B.Tech 4-Year (U4), B.Sc/BCA 3-Year (U3), Integrated M.Sc (U5), M.Tech/MCA (P2), Ph.D (D1).
  - **Department**: Automation & Robotics (ARE), Computer Science (CSE), Artificial Intelligence (AIE), Electronics (ECE), Mechanical (ME), Cyber Security (CYS), etc.
  - **Academic Batch & Year of Study**: Dynamic year-of-study calculation based on current academic semester.

### 3. Academic Calendar & Timetable Clash Detector
- Synchronizes university examinations (Mid-Term Assessment 2, End-Semester Practical Lab Vivas) and official holidays with joined/hosted student activities.
- Multi-interval clash detector (`detectScheduleClash`):
  - Strictly prevents false positives across different calendar dates.
  - Flags collisions with mandatory continuous assessment theory examinations (`CRITICAL_EXAM`).
  - Detects time overlaps with already registered or hosted sessions (`REGISTERED_OVERLAP`).
  - Adapts to a mobile agenda list view on smaller viewports.

### 4. Verified On-Duty (OD) Certificate Dispatch
- Official institutional OD slips generated and cryptographically hashed (`OD-AMR-2026-CB-xxxxx-VERIFIED`).
- Includes Amrita institutional crest, student details, department, event date, sanctioned hours, and faculty coordinator endorsement.
- Dedicated print stylesheet (`@media print`) for clean paper dispatch or PDF export.

### 5. Peer Carpool & Transit Coordination
- Direct ride sharing for transit to Coimbatore Junction (CBE), Coimbatore International Airport (CJB), Gandhipuram Central Bus Stand, and town hubs.
- Gender safety preferences (Open to all vs Female co-travelers only).
- Transparent fare splitting and seat occupancy counters.

### 6. Scoped Group Coordination Chat
- Scoped room creation for each active opportunity.
- Access strictly restricted to the verified host and confirmed (accepted) participants.
- Pending applicants and unauthenticated peers are denied read/write access.

### 7. Faculty Portal & Access Governance
- Role-based experience: Students encountering the portal view an informative access-restricted screen explaining the authorization boundaries.
- Faculty coordinators have access to applicant review workflows, attendance registers, and one-click OD certificate dispatch.

---

## Security & Access Control Architecture

### Production Deployment Security Note
In a live institutional deployment at Amrita Vishwa Vidyapeetham, authentication is managed via Amrita University AUMS (Amrita University Management System) / SAML 2.0 / Shibboleth Single Sign-On (SSO). Session validation is enforced server-side using secure HTTP-only cookies and signed JWT tokens with server-side Role-Based Access Control (RBAC).

Client-side role selectors in this repository serve strictly as an **Evaluator Demo Harness** allowing evaluators to audit both Student and Faculty perspectives without requiring external LDAP/SAML university credentials.

---

## Local Development & Setup

### Prerequisites
- Node.js 18.x or 20.x or higher
- npm 9.x or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/amrita-campusconnect/platform.git
cd platform

# Install dependencies
npm install
```

### Starting Development Server
```bash
npm run dev
```
The application will launch locally at `http://localhost:5173`.

### Running Automated Test Suite
```bash
# Run Vitest test suite once
npm test

# Run Vitest in watch mode
npx vitest
```

### Static Analysis & Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```
Generates optimized static assets in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

---

## Design System & Tokens

Tokens are defined in `src/index.css` following WCAG 2.2 AA accessibility standards:

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--color-primary` | `#4F46E5` | Primary institutional indigo |
| `--color-primary-hover` | `#4338CA` | Accessible hover state |
| `--color-page-bg` | `#F8FAFC` | Clean background canvas |
| `--color-surface` | `#FFFFFF` | Elevated card surfaces |
| `--color-text-main` | `#0F172A` | High-contrast body text |
| `--color-text-muted` | `#64748B` | Secondary metadata text |
| `--color-border` | `#E2E8F0` | Subtle structural division |
| `--color-success` | `#059669` | Approved & verified states |
| `--color-warning` | `#D97706` | Pending & OD highlighted states |
| `--color-error` | `#DC2626` | Critical exam clashes & errors |

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable design system primitives
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Textarea.tsx
│   │   ├── AuthModal.tsx          # Amrita identity registration & roll parser
│   │   ├── CalendarModule.tsx     # Timetable & clash detector
│   │   ├── CampusMapModal.tsx     # Interactive spatial campus navigator
│   │   ├── CarpoolModule.tsx      # Ride-sharing & transit hub
│   │   ├── CreatePostModal.tsx    # Opportunity publishing & role allocation
│   │   ├── EventFeed.tsx          # Main opportunity discovery feed
│   │   ├── FacultyPortal.tsx      # Faculty attendance, review & OD dispatch
│   │   ├── FindPeopleDirectory.tsx # Peer & faculty discovery engine
│   │   ├── GroupChatModal.tsx     # Scoped room chat for approved members
│   │   ├── MyActivitiesModule.tsx # Personal registrations & OD vault
│   │   ├── Navbar.tsx             # Global institutional header & navigation
│   │   ├── NotificationDrawer.tsx # Real-time alerts drawer
│   │   ├── ODSlipModal.tsx        # Printable official OD certificate
│   │   ├── ResetConfirmModal.tsx  # Confirmation dialog for demo reset
│   │   └── RollNumberParserWidget.tsx # Dynamic roll number decoder
│   ├── context/
│   │   └── AppContext.tsx         # Central application state & persistence
│   ├── data/
│   │   └── seedData.ts            # Realistic Amrita student/faculty seed data
│   ├── utils/
│   │   ├── clashDetector.ts       # Interval schedule clash detection logic
│   │   ├── clashDetector.test.ts  # Clash detector test suite
│   │   ├── rollNumberParser.ts    # Amrita roll number parser engine
│   │   ├── rollNumberParser.test.ts # Roll parser test suite
│   │   ├── security.ts            # Access control & RBAC verification
│   │   ├── security.test.ts       # Security test suite
│   │   ├── validation.ts          # Form validation schemas
│   │   └── validation.test.ts     # Validation test suite
│   ├── App.tsx                    # Main layout shell
│   ├── index.css                  # Global styles & design system tokens
│   ├── main.tsx                   # Application entry point
│   └── types.ts                   # Core TypeScript domain models
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## License

Institutional Property • Amrita Vishwa Vidyapeetham, Ettimadai Campus, Coimbatore.
