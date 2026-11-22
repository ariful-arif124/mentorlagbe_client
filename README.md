# MentorLagbe – Online Tutor & Tuition Management Platform

<p align="center">
  <strong>Connecting Students with the Right Tutors</strong>
</p>

<p align="center">
  A full-stack educational platform designed to connect students seeking academic support with tutors offering personalized teaching services.
</p>

## Live Website

**Live Project:** https://mentorlagbe-client-five.vercel.app/

**Frontend:** Next.js (Vercel)

**Backend:** Node.js, Express.js (Render)

---

## 1. Project Overview

MentorLagbe is an online tutor and tuition management platform that connects students with qualified tutors. The platform provides an organized environment where students can discover tuition opportunities, apply for suitable listings, and manage their applications.

Tutors can create tuition posts, manage their listings, review student applications, and upgrade their membership plans to access additional features.

The platform also includes an administrative dashboard for managing platform activities.

The main goal of this project is to make finding tutors and managing tuition opportunities easier, more accessible, and more efficient.

## 2. Technologies Used

### Frontend
- Next.js 14
- React.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- HTML5
- CSS3

### Backend Integration
- Node.js
- Express.js
- MongoDB
- RESTful API
- JWT Authentication
- Google OAuth 2.0

### Payment Integration
- Stripe Payment Gateway

### Deployment
- Vercel – Frontend Hosting
- Render – Backend Hosting
- MongoDB Atlas – Database Hosting
- GitHub – Version Control

## 3. Main Features and Functionalities

### A. Public Website

- Professional and responsive landing page.
- Attractive hero section with clear call-to-action buttons.
- Browse available tuition listings.
- Explore popular subjects.
- Featured tuition opportunities.
- How It Works section explaining the platform.
- Statistics and testimonials sections.
- Membership pricing section.
- Responsive navigation bar and footer.

### B. User Authentication

- Student and tutor registration.
- Email and password authentication.
- Google Sign-In integration.
- Role-based account registration.
- Password validation.
- Login and logout functionality.
- Protected dashboard access.
- Role-based navigation and redirection.
- Dynamic user profile information.

### C. Student Dashboard

Students can:

- View their dashboard and account information.
- Browse available tuition opportunities.
- Explore tuition details.
- Apply for suitable tuition listings.
- Track submitted applications.
- Monitor application status.
- Update their profile.
- View membership information.
- Upgrade to the Pro membership plan.

### D. Tutor Dashboard

Tutors can:

- Access a personalized tutor dashboard.
- View tuition statistics.
- Create and publish tuition posts.
- Manage their existing tuition listings.
- Edit and manage posted tuitions.
- Review student applications.
- View applicant information.
- Accept or reject applications.
- Manage their profile.
- View payment history.
- Monitor membership status.
- Upgrade to the Tutor Pro plan.

### E. Admin Dashboard

The platform includes a separate administrative workspace for authorized administrators.

Administrative functionality includes platform overview and management features, with access controlled through user roles.

### F. Membership and Pricing System

MentorLagbe provides separate membership plans for students and tutors.

**Student Membership**

| Feature | Free | Pro |
|---|---|---|
| Browse tuition listings | Yes | Yes |
| Apply for tuition | Yes | Yes |
| Track applications | Yes | Yes |
| Priority booking | No | Yes |
| Price | $0 | $10 |

**Tutor Membership**

| Feature | Free | Pro |
|---|---|---|
| Create tuition posts | Up to 2 | Unlimited |
| Manage applications | Yes | Yes |
| Manage listings | Yes | Yes |
| Verified tutor badge | No | Yes |
| Price | $0 | $15 |

### G. Payment Integration

- Stripe payment gateway integration.
- Student Pro membership payment.
- Tutor Pro membership payment.
- Payment processing through the backend.
- Payment records and transaction history.
- Membership status management.

## 4. User Roles

The platform supports three primary user roles:

1. **Student:** Searches for tutors, browses tuition listings, applies for opportunities, and manages applications.
2. **Tutor:** Creates tuition posts, manages listings, reviews applicants, and manages membership.
3. **Admin:** Accesses administrative functionality and oversees platform activities.

Each role has its own dashboard and access permissions.

## 5. Responsive Design

The frontend was developed with responsive design principles to support different screen sizes.

- Desktop computers
- Laptops
- Tablets
- Mobile devices

The interface uses a consistent green-based visual identity, clean layouts, reusable components, responsive navigation, and interactive animations.

## 6. Project Structure

The frontend follows the Next.js App Router architecture.

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
│   │   │   ├── tutor/
│   │   │   └── profile/
│   │   │
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── tuitions/
│   │   ├── pricing/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   ├── services/
│   └── ...
│
├── .env.local
├── package.json
├── tsconfig.json
└── README.md
```

## 7. Installation and Setup

### Prerequisites

- Node.js
- npm
- Git
- A running MentorLagbe backend server

### Step 1: Clone the Repository

```bash
git clone YOUR_CLIENT_REPOSITORY_URL
```

### Step 2: Navigate to the Project

```bash
cd client
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For the deployed frontend, configure the production backend URL in Vercel:

```env
NEXT_PUBLIC_API_URL=https://mentorlagbe-server-2oyc.onrender.com/api
```

### Step 5: Start the Development Server

```bash
npm run dev
```

Open the following address:

http://localhost:3000

### Step 6: Build for Production

```bash
npm run build
```

## 8. Deployment

The frontend application is deployed on Vercel.

**Live URL:**

https://mentorlagbe-client-five.vercel.app/

The backend is hosted separately on Render, and the frontend communicates with it through REST API endpoints.

MongoDB Atlas is used for persistent data storage.

## 9. Key Learning Outcomes

Through developing MentorLagbe, the project demonstrates practical experience in:

- Developing full-stack web applications.
- Building responsive interfaces using Next.js and Tailwind CSS.
- Implementing role-based authentication and authorization.
- Integrating Google OAuth.
- Connecting frontend applications with REST APIs.
- Managing application state and user sessions.
- Developing student, tutor, and administrative dashboards.
- Integrating Stripe payment functionality.
- Working with MongoDB-based applications.
- Deploying applications using Vercel and Render.
- Managing source code using Git and GitHub.

## 10. Conclusion

MentorLagbe is a full-stack educational platform designed to simplify the connection between students and tutors.

The project brings together tuition discovery, application management, tutor services, user authentication, membership subscriptions, and administrative functionality in one platform.

The development of this project provided practical experience in modern frontend development, backend integration, authentication, payment processing, responsive UI design, and production deployment.

---

**Project Name:** MentorLagbe

**Project Type:** Full-Stack Web Application

**Frontend Framework:** Next.js 14

**Programming Language:** TypeScript

**Live Website:** https://mentorlagbe-client-five.vercel.app/

**Status:** Deployed