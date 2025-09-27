# EMR Admin Dashboard

System administration and technical management interface for the Modern EMR platform.

## Overview

The Admin Dashboard provides system administrators with comprehensive tools to manage users, configure system settings, monitor performance, and handle security-related tasks. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **System Overview**: Real-time metrics and system health monitoring
- **User Management**: Add, edit, deactivate users and manage permissions
- **System Configuration**: Global settings and technical configurations
- **Security Settings**: Authentication, authorization, and security policies
- **Analytics & Reports**: System performance metrics and usage analytics
- **Activity Monitoring**: Real-time system activity and audit logs

## Key Metrics Dashboard

- Total Users: Active user count across the platform
- Active Sessions: Currently logged-in users
- System Alerts: Critical system notifications
- API Performance: Real-time API call metrics

## Quick Actions

- System Configuration Management
- User Account Administration
- Security Policy Management
- Analytics and Reporting Tools

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

The application will be available at http://localhost:3002

### Available Scripts

- `npm run dev` - Start development server on port 3002
- `npm run build` - Build for production
- `npm run start` - Start production server on port 3002
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Technology Stack

- **Framework**: Next.js 15.5.2
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with Tailwind
- **Development**: ESLint, TypeScript compiler

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
└── components/           # Reusable UI components
```

## Port Configuration

This application runs on port 3002 to avoid conflicts with other EMR applications:
- Patient Portal: 3000
- Staff Portal: 3001
- Admin Dashboard: 3002

## Development

The admin dashboard is designed for system administrators and technical staff. It provides comprehensive system management capabilities while maintaining a clean, professional interface.

## Integration

The Admin Dashboard integrates with the EMR backend services to provide:
- Real-time system monitoring
- User management operations
- Configuration management
- Security and audit logging
