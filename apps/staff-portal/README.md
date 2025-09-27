# EMR Staff Portal

Healthcare staff interface with role-based access for the Modern EMR platform.

## Overview

The Staff Portal provides healthcare professionals with a comprehensive dashboard to manage their daily workflow, patient appointments, treatment plans, and clinical documentation. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview**: Real-time view of today's appointments and key metrics
- **Appointment Management**: Schedule, view, and manage patient appointments
- **Patient Records**: Access and update patient information and medical history
- **Treatment Plans**: Create, modify, and track patient treatment plans
- **Progress Notes**: Document patient progress and clinical observations
- **Quick Actions**: Fast access to common clinical tasks
- **Task Management**: Track pending tasks and clinical requirements

## Dashboard Metrics

- **Today's Appointments**: Total scheduled appointments
- **Completed**: Finished appointments and sessions
- **Pending**: Upcoming appointments and tasks
- **Urgent**: Priority cases requiring immediate attention

## Quick Actions

- **New Patient**: Add new patient records to the system
- **Treatment Plan**: Create comprehensive treatment plans
- **Progress Notes**: Update patient progress and clinical notes
- **Schedule Appointment**: Book new appointments and follow-ups

## Clinical Workflow

The staff portal is designed around healthcare workflows:
- Morning dashboard review of daily schedule
- Patient check-in and session management
- Real-time progress documentation
- Task completion and follow-up scheduling

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3001

### Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server on port 3001
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Technology Stack

- **Framework**: Next.js 15.5.2
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom healthcare-focused components
- **Development**: ESLint, TypeScript compiler

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
└── components/           # Clinical UI components
```

## Port Configuration

This application runs on port 3001 to avoid conflicts with other EMR applications:
- Patient Portal: 3000
- Staff Portal: 3001
- Admin Dashboard: 3002

## Role-Based Access

The Staff Portal is designed for healthcare professionals including:
- Physicians and Doctors
- Physical Therapists
- Nurses and Clinical Staff
- Healthcare Assistants

## Integration

The Staff Portal integrates with the EMR backend to provide:
- Real-time patient data access
- Appointment scheduling system
- Clinical documentation tools
- Treatment plan management
- Progress tracking and reporting
