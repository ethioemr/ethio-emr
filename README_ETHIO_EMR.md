# ETHIO-EMR: Complete Hospital Management & EMR System

A comprehensive, production-grade Electronic Medical Records (EMR) and Hospital Management System built for Ethiopian hospitals and clinics.

## System Overview

ETHIO-EMR is a full-featured hospital management platform providing:

### Core Modules

1. **Authentication & Access Control**
   - Role-based access control (9 user roles)
   - Secure authentication with Supabase
   - Multi-level permission management
   - Session management and security

2. **Patient Management**
   - Complete patient profiles with demographics
   - Medical Record Numbers (MRN)
   - Patient photo storage
   - Insurance information tracking
   - Allergy and chronic condition management
   - Emergency contact information

3. **Appointment System**
   - Calendar-based scheduling
   - Doctor-patient appointment management
   - Queue management
   - Appointment status tracking
   - Reminder system

4. **Clinical Modules**
   - **Consultations**: SOAP notes (Subjective, Objective, Assessment, Plan)
   - **Vital Signs**: Temperature, pulse, BP, oxygen saturation, weight, height
   - **Medical History**: Diagnosis, treatment, clinical notes
   - **ICD-10 Code Support**: Disease classification

5. **Prescription Management**
   - Medication prescriptions
   - Dosage and frequency management
   - Drug interaction alerts
   - Prescription validity tracking
   - Pharmacy fulfillment tracking

6. **Laboratory System**
   - Lab test ordering and management
   - Multiple test categories (CBC, Chemistry, Urinalysis, etc.)
   - Result entry and validation
   - Critical value alerts
   - Abnormal result flagging
   - PDF result printing

7. **Pharmacy Module**
   - Drug inventory management
   - Batch tracking
   - Expiry date monitoring
   - Stock level alerts
   - Prescription dispensing
   - Supplier management
   - Sales tracking

8. **Billing & Finance**
   - Invoice generation
   - Service, medication, and lab billing
   - Payment tracking (Cash, Card, Mobile Money, Insurance)
   - Insurance claim management
   - Receipt printing
   - Financial reporting

9. **Bed & Admission Management**
   - Ward management
   - Bed allocation and status tracking
   - Admission records
   - Discharge summaries
   - Bed occupancy dashboard

10. **Reporting & Analytics**
    - Patient reports
    - Financial reports
    - Daily hospital statistics
    - Lab reports
    - Revenue analysis
    - Disease trends
    - Doctor performance reports
    - Export to PDF, Excel, CSV

11. **Additional Features**
    - Audit logging (all user activities)
    - Notifications and alerts
    - Settings and configuration
    - Hospital profile management
    - Department management
    - Staff management

## User Roles

- **Super Admin**: System-wide administration
- **Hospital Admin**: Hospital-level management
- **Doctor**: Consultations, prescriptions, diagnosis
- **Nurse**: Patient care, vital signs, notes
- **Receptionist**: Patient registration, appointments
- **Pharmacist**: Prescription fulfillment, inventory
- **Lab Technician**: Lab test management, results
- **Cashier**: Billing and payments
- **Patient**: Access to own medical records

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **React Router DOM** for navigation
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Recharts** for analytics and charts
- **Framer Motion** for animations
- **React Query** for data fetching
- **Lucide Icons** for UI icons

### Backend & Database
- **Supabase** (PostgreSQL)
- **Row Level Security (RLS)** for data protection
- **Supabase Auth** for authentication
- **Real-time Subscriptions** for live updates

### Deployment
- **Vite** production build
- **Cloudflare Pages** ready
- **GitHub integration** for CI/CD

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Supabase account

### Environment Variables

Create `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Project Structure

```
src/
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   ├── Dashboard.tsx
│   ├── Patients.tsx
│   ├── Appointments.tsx
│   ├── Consultations.tsx
│   ├── Prescriptions.tsx
│   ├── Laboratory.tsx
│   ├── Pharmacy.tsx
│   ├── Billing.tsx
│   ├── BedManagement.tsx
│   ├── Reports.tsx
│   └── Settings.tsx
├── components/         # Reusable components
│   ├── Sidebar.tsx
│   └── Header.tsx
├── layouts/            # Layout components
│   └── Layout.tsx
├── stores/             # Zustand stores
│   └── authStore.ts
├── services/           # API services
│   └── supabase.ts
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
├── utils/              # Utility functions
├── contexts/           # React contexts
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Database Schema

### Core Tables
- `hospital_profiles` - Hospital information
- `departments` - Department management
- `users` - Staff members
- `patients` - Patient records
- `appointments` - Appointment scheduling
- `consultations` - SOAP notes
- `prescriptions` - Medication prescriptions
- `lab_results` - Laboratory results
- `pharmacy_items` - Drug inventory
- `invoices` - Billing records
- `admissions` - Hospital admissions
- `beds` - Bed management
- `audit_logs` - Activity logging

All tables include:
- UUID primary keys
- Soft delete support (deleted_at field)
- Timestamps (created_at, updated_at)
- Row Level Security policies

## Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row Level Security on all tables
- **Audit Logging**: All user activities logged
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: React's built-in protection
- **HTTPS Only**: Secure data transmission

## API Endpoints

All API operations use Supabase client library:

```typescript
// Patients
GET /patients
GET /patients/{id}
POST /patients
PUT /patients/{id}
DELETE /patients/{id}

// Appointments
GET /appointments
POST /appointments
PUT /appointments/{id}

// Consultations
GET /consultations
POST /consultations
PUT /consultations/{id}

// And more...
```

## Features

### Admin Dashboard
- Hospital statistics
- Real-time KPIs
- Charts and analytics
- Recent activities
- Department performance

### Patient Search & Management
- Advanced search filters
- Patient timeline
- Medical history
- Status tracking
- QR code generation

### Appointment Management
- Calendar scheduling
- Queue management
- Status tracking
- Reminders
- Rescheduling

### SOAP Notes
- Subjective findings
- Objective examination
- Assessment & diagnosis
- Treatment plan
- Follow-up planning

### Reporting
- PDF export
- Excel reports
- CSV data
- Custom date ranges
- Multiple report types

## Sample Data

The system includes comprehensive sample data:
- 100+ patients with realistic Ethiopian names
- 20+ doctors across departments
- 30+ nurses
- 50+ appointments
- 100+ prescriptions
- 100+ lab results
- 50+ invoices
- 200+ pharmacy items
- Complete transaction history

## Demo Credentials

Default admin account:
- **Email**: admin@hospital.com
- **Password**: demo123456

## Deployment Guide

### Cloudflare Pages

1. Push to GitHub
2. Connect GitHub to Cloudflare Pages
3. Set environment variables
4. Deploy

### Vercel

1. Import project
2. Set environment variables
3. Deploy

### Self-hosted

1. Build: `npm run build`
2. Deploy `dist/` folder to server
3. Configure environment variables

## Performance Optimization

- **Code Splitting**: Automatic with Vite
- **Lazy Loading**: React Router lazy routes
- **Image Optimization**: Responsive images
- **Database Indexes**: Optimized queries
- **Caching**: Browser and HTTP caching
- **Bundle Size**: ~710 KB (gzipped: ~202 KB)

## Support & Contribution

For issues, suggestions, or contributions, please refer to documentation or contact the development team.

## License

ETHIO-EMR © 2025. All rights reserved.

---

**Version**: 1.0.0
**Status**: Production Ready
**Last Updated**: May 24, 2025
