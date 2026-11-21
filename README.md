# MentorLagbe — Smart Tuition & Mentorship Platform

<p align="center">
  <strong>Connecting Students with the Right Tutors</strong>
</p>

MentorLagbe is a full-stack tuition and mentorship platform designed to connect students with qualified tutors. It provides a convenient environment where students can discover tuition opportunities, apply for suitable tutors, and manage their academic journey, while tutors can publish tuition listings, manage applications, and connect with students.

The platform includes dedicated dashboards for students, tutors, and administrators, secure authentication, tuition management, application processing, and Stripe-powered Pro plan payments.

---

## Project Overview

MentorLagbe simplifies the process of finding and managing private tuition opportunities through a centralized digital platform.

The application provides three primary user roles:

- **Students:** Explore tuition opportunities, apply to listings, and manage applications.
- **Tutors:** Create and manage tuition listings, receive applications, and manage students.
- **Administrators:** Manage users, tutors, students, tuition listings, applications, payments, and platform settings.

The frontend is developed using Next.js and TypeScript, while the backend uses Node.js, Express.js, and MongoDB.

---

## Key Features

### 1. Public Website

- Modern and responsive homepage.
- Hero section with clear calls to action.
- Featured tuition opportunities fetched from the backend.
- Subject-based tuition discovery.
- How It Works section.
- Platform statistics and testimonials.
- Student and tutor pricing plans.
- Responsive navigation bar and footer.
- Dedicated tuition browsing and details pages.

### 2. Authentication and Authorization

- Email and password registration.
- Secure login and logout.
- Google OAuth authentication.
- JWT-based authentication.
- Role-based access control.
- Protected student, tutor, and admin dashboards.
- Dynamic navigation based on authentication status.

### 3. Student Dashboard

Students can:

- View their dashboard overview.
- Browse available tuition opportunities.
- Search and filter tuition listings.
- View detailed tuition information.
- Apply for tuition opportunities.
- Track submitted applications.
- View application statuses.
- Cancel pending applications.
- Manage their profile.
- Upload a profile image.
- Upgrade to the Student Pro plan.

### 4. Tutor Dashboard

Tutors can:

- View dashboard statistics.
- Create tuition listings.
- Manage existing tuition posts.
- Edit tuition information.
- Delete tuition listings.
- Monitor application requests.
- View student application details.
- Accept or reject applications.
- Manage their profile.
- Upgrade to the Tutor Pro plan.

### 5. Admin Dashboard

The administration panel provides centralized platform management.

**Overview**
- Platform statistics.
- User and tutor statistics.
- Student statistics.
- Tuition and application statistics.
- Payment overview.

**User Management**
- View registered users.
- Search and filter users.
- Manage user accounts.
- Activate and deactivate accounts.
- View user information.

**Tutor Management**
- View tutor accounts.
- Monitor tutor activity.
- Manage tutor accounts.

**Student Management**
- View student accounts.
- Monitor student activity.
- Manage student accounts.

**Tuition Management**
- View tuition listings.
- Review submitted tuition posts.
- Approve or reject tuition listings.
- Manage existing listings.

**Application Management**
- View tuition applications.
- Monitor application statuses.
- Manage application records.

**Payment Management**
- View payment history.
- Monitor successful and unsuccessful transactions.
- Search and filter payments.
- View payment statistics.
- Monitor transaction information.

**Platform Settings**
- Manage administrator settings.
- Configure available platform preferences.

### 6. Tuition Management System

- Dynamic tuition listings from MongoDB.
- Featured tuition section displays the six latest approved and active listings.
- Tuition details pages.
- Subject-based filtering.
- Class-level filtering.
- Online and offline tuition modes.
- Location-based filtering.
- Search functionality.
- Approval-based listing visibility.

### 7. Payment Integration

MentorLagbe integrates Stripe Checkout for Pro plan purchases.

**Available plans**

| Plan | Price | Payment Type |
|---|---:|---|
| Student Pro | $10 | One-time payment |
| Tutor Pro | $15 | One-time payment |

Payment functionality includes:

- Stripe Checkout integration.
- Secure backend payment session creation.
- Stripe webhook verification.
- Payment status verification.
- Automatic Pro plan activation after successful payment.
- Payment history storage in MongoDB.
- Payment success and cancellation pages.
- Admin payment monitoring.

Payments are processed as one-time purchases. Automatic recurring billing is not enabled.

### 8. Image Upload

- Profile image uploading.
- ImgBB image hosting integration.
- Dynamic profile image display.

### 9. User Interface and Experience

- Responsive desktop, tablet, and mobile layouts.
- Modern card-based design.
- Consistent color system.
- Smooth animations using Framer Motion.
- Lucide icons.
- Loading skeletons.
- Empty states.
- Toast notifications.
- Reusable UI components.

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js 14 | React framework |
| React | User interface |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Framer Motion | Animations |
| Lucide React | Icons |
| React Hooks | State and lifecycle management |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API |
| MongoDB | Database |
| JWT | Authentication |
| bcrypt | Password hashing |
| Google OAuth | Google authentication |
| Stripe | Payment processing |
| Multer | File upload handling |

### External Services

- MongoDB Atlas — Cloud database hosting.
- Stripe — Payment processing.
- Google OAuth — Google authentication.
- ImgBB — Image hosting.
- Vercel — Frontend deployment (planned).
- Render — Backend deployment (planned).

---

## Project Architecture

MentorLagbe follows a client-server architecture.

```text
MentorLagbe
│
├── Client
│   ├── Next.js
│   ├── React
│   ├── TypeScript
│   ├── Tailwind CSS
│   └── Framer Motion
│
├── Server
│   ├── Node.js
│   ├── Express.js
│   ├── REST API
│   ├── Authentication
│   └── Business Logic
│
├── Database
│   └── MongoDB Atlas
│       ├── Users
│       ├── Tuitions
│       ├── Applications
│       └── Payments
│
└── External Services
    ├── Stripe
    ├── Google OAuth
    └── ImgBB
```

---

## Frontend Project Structure

```text
client/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   ├── student/
│   │   │   └── tutor/
│   │   │
│   │   ├── payment/
│   │   ├── services/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── tuitions/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── services/
│   ├── types/
│   └── ...
│
├── .env.local
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone YOUR_FRONTEND_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd mentorlagbe_client
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production, replace the local backend URL with your deployed backend API URL.

### 5. Start the Development Server

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

---

## Backend Integration

The frontend communicates with the separate MentorLagbe backend through REST API endpoints.

The API base URL is configured using:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The frontend communicates with backend services for:

- Authentication and user management.
- Google authentication.
- Tuition listing and details.
- Tuition applications.
- Tutor management.
- Student profiles.
- Image uploading.
- Stripe checkout.
- Payment verification.
- Admin dashboard operations.

The backend repository must be running for the complete application to function locally.

---

## Available Frontend Routes

| Route | Description |
|---|---|
| `/` | Homepage |
| `/sign-in` | User login |
| `/sign-up` | User registration |
| `/tuitions` | Browse tuition listings |
| `/tuitions/[id]` | Tuition details |
| `/dashboard/student` | Student dashboard |
| `/dashboard/tutor` | Tutor dashboard |
| `/dashboard/admin` | Admin dashboard |
| `/dashboard/admin/users` | User management |
| `/dashboard/admin/tutors` | Tutor management |
| `/dashboard/admin/students` | Student management |
| `/dashboard/admin/tuitions` | Tuition management |
| `/dashboard/admin/applications` | Application management |
| `/dashboard/admin/payments` | Payment management |
| `/dashboard/admin/settings` | Admin settings |
| `/payment/success` | Payment success |
| `/payment/cancel` | Payment cancellation |

---

## Backend Repository

MentorLagbe uses a separate backend repository.

**Backend Repository:** Add your server GitHub repository URL here.

The backend is responsible for:

- API development.
- Authentication and authorization.
- Database operations.
- Tuition management.
- Application processing.
- Payment processing.
- Webhook verification.
- Administrative operations.

---

## Deployment

The planned production deployment architecture is:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Payment Gateway | Stripe |
| Image Hosting | ImgBB |

**Live Website:** To be added after deployment.

**Backend API:** To be added after deployment.

---

## Security Considerations

- Passwords are hashed before database storage.
- JWT authentication protects private routes.
- Role-based authorization restricts access.
- Payment verification is handled by the backend.
- Stripe webhook signatures are verified.
- Sensitive credentials are stored in environment variables.
- Frontend environment variables do not contain private payment secrets.

---

## Future Improvements

Potential future enhancements include:

- Student tuition bookmarking.
- Advanced recommendation features.
- Tutor ratings and reviews.
- Enhanced notification system.
- More advanced search and filtering.
- Additional administrative analytics.

---

## Project Status

MentorLagbe has implemented its main frontend and backend modules, including authentication, dashboards, tuition management, applications, and one-time Stripe payments.

Production deployment and final assignment compliance checks are ongoing.

---

## License

This project was developed as an academic project. All rights are reserved by the project contributors unless otherwise specified.

---

**MentorLagbe — Connecting Students with the Right Tutors.**
