# ETHIO-EMR: Hospital Management System

A comprehensive, production-ready Electronic Medical Records (EMR) system built with modern web technologies.

## System Overview

ETHIO-EMR is a full-featured hospital management platform that streamlines patient care, appointments, prescriptions, lab results, billing, and video consultations. The system is designed with a professional UI/UX that provides an intuitive experience for hospital staff.

## Key Features

### 1. **Dashboard**
- Real-time statistics (total patients, appointments, prescriptions, pending bills)
- Recent activity feed
- Department performance tracking
- Financial summary
- Appointment status overview

### 2. **Patient Management**
- Complete patient database with demographics
- Advanced search and filtering
- Patient profile with full medical history
- Medical conditions and allergies tracking
- Emergency contact information
- Vital signs monitoring
- Pagination support for large datasets

### 3. **Appointments**
- Appointment scheduling calendar
- Appointment status tracking (scheduled, completed, cancelled)
- Date-based appointment filtering
- Doctor and patient assignment
- Reason for visit documentation
- Real-time appointment list

### 4. **Prescriptions**
- Medication prescribing system
- Prescription tracking with status
- Dosage and frequency management
- Expiry date tracking
- Active/inactive prescription filtering
- Download capabilities

### 5. **Laboratory Results**
- Lab test result management
- Multiple test categories
- Result value and normal range tracking
- Abnormal result flagging
- Advanced filtering and search
- Category-based organization

### 6. **Billing & Finance**
- Invoice creation and management
- Amount tracking (total, paid, balance)
- Bill status management (pending, paid, overdue)
- Financial summary dashboard
- Bill download capability
- Real-time financial calculations

### 7. **Consultation Room**
- Video consultation interface
- Real-time consultation management
- Mic and video controls
- Fullscreen mode
- Upcoming consultations queue
- Consultation notes
- Connection status monitoring

### 8. **User Authentication**
- Email/password authentication with Supabase
- Role-based access control
- Secure session management
- Sign up and sign in functionality

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with responsive design
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Hooks & Context API

## Database Schema

### Core Tables

**users**
- Hospital staff (doctors, nurses, admins)
- Role-based access control
- Department assignment

**patients**
- Patient demographics
- Medical information
- Contact details
- Blood type and allergies

**appointments**
- Appointment scheduling
- Doctor-patient assignment
- Status tracking
- Visit reason documentation

**prescriptions**
- Medication details
- Dosage and frequency
- Duration tracking
- Active status management

**lab_results**
- Test results with values
- Normal ranges
- Status (completed, abnormal)
- Test categorization

**bills**
- Invoice management
- Amount and payment tracking
- Status (pending, paid, overdue)
- Category classification

**consultations**
- Video consultation records
- Room assignment
- Status tracking
- Doctor-patient assignment

**medical_history**
- Patient diagnosis records
- Treatment information
- Historical tracking

**vital_signs**
- Temperature, pulse, BP
- Oxygen saturation
- Weight, height, BMI
- Recording timestamps

**departments**
- Department information
- Department head assignment

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account

### Environment Setup

Create a `.env` file with Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Demo Credentials

```
Email: demo@hospital.com
Password: demo123456
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Sidebar.tsx
│   ├── StatsCard.tsx
│   ├── AddPatientModal.tsx
│   └── ChartComponent.tsx
├── pages/              # Main page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Patients.tsx
│   ├── PatientDetails.tsx
│   ├── Appointments.tsx
│   ├── Prescriptions.tsx
│   ├── LabResults.tsx
│   ├── Billing.tsx
│   └── Consultation.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utility functions
│   ├── supabase.ts
│   └── seedData.ts
└── App.tsx            # Main app component
```

## Security Features

- **Row Level Security (RLS)**: All tables have RLS enabled
- **Authentication**: Supabase email/password auth
- **Data Protection**: User data is protected with proper policies
- **Secure API**: All API calls through secure Supabase client
- **Session Management**: Automatic session handling

## Key Functionalities

### Patient Management
- Add new patients with comprehensive information
- Edit patient records
- View complete patient history
- Track medical history and vital signs
- Delete inactive records

### Appointment Scheduling
- Schedule appointments by date
- Assign doctors to appointments
- Track appointment status
- Filter by date range
- Cancel or reschedule appointments

### Prescription Management
- Create prescriptions with complete details
- Track medication expiry
- Mark prescriptions as active/inactive
- Filter by status
- Download prescription records

### Lab Result Management
- Record lab test results
- Track normal ranges
- Flag abnormal results
- Categorize tests
- Search and filter results

### Billing System
- Generate invoices
- Track payments
- Monitor outstanding balances
- Export billing records
- Financial reporting

### Consultation Room
- Initiate video consultations
- Control audio/video
- View consultation queue
- Add notes to consultations
- Track consultation duration

## Performance Optimizations

- Efficient database queries with Supabase
- Pagination for large datasets
- Debounced search functionality
- Optimized re-renders with React hooks
- CSS-in-JS for reduced bundle size
- Code splitting with Vite

## Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop full-featured interface
- Touch-friendly controls
- Flexible grid layouts

## Browser Compatibility

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## API Endpoints

All data operations are handled through Supabase with the following main tables:
- `/patients` - Patient CRUD operations
- `/appointments` - Appointment management
- `/prescriptions` - Prescription records
- `/lab_results` - Lab test results
- `/bills` - Billing information
- `/consultations` - Consultation sessions
- `/users` - Staff information

## Error Handling

- Comprehensive error messages
- Network failure handling
- Validation errors
- Authentication errors
- Graceful error recovery

## Future Enhancements

- SMS notifications for appointments
- Email reminders
- Advanced analytics dashboard
- Telemedicine integration
- Mobile app version
- Multi-language support
- Print functionality
- Backup and recovery system

## Support & Maintenance

For issues or feature requests, contact the development team.

## License

© 2025 ETHIO-EMR. All rights reserved.

---

**Version**: 1.0.0
**Last Updated**: May 24, 2025
