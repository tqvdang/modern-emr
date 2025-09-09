# Modern EMR System

A comprehensive Electronic Medical Record (EMR) system with multi-stack architecture, featuring separate services and applications built with different technology stacks.

## 🏗️ Project Architecture

This project is organized as independent services and applications:

```
modern-emr/
├── services/
│   ├── emr-backend/       # .NET 9 Clean Architecture - Main EMR backend
│   ├── auth-service/      # .NET 9 - Authentication service
│   └── python-ai/         # Python FastAPI - AI/ML processing  
├── apps/
│   ├── patient-portal/    # Next.js PWA - Patient self-service
│   ├── staff-portal/      # Next.js - Healthcare staff (role-based)
│   └── admin-dashboard/   # Next.js - System administration
├── tools/shared/          # Shared utilities and contracts
└── infrastructure/        # Docker, deployment configs
```

## 🛠️ Technology Stacks

### Backend Services
- **.NET 9.0**: Main API and centralized Auth service with Entity Framework Core
- **Python**: AI/ML service with FastAPI, OpenCV, PyTorch/TensorFlow
- **PostgreSQL**: Primary database with Redis for caching and sessions
- **Comprehensive Authentication**: Manual login + SSO (Google, Microsoft, Facebook, LinkedIn, SAML)
- **JWT + Refresh Tokens**: Secure stateless authentication with automatic token refresh

### Frontend Applications  
- **Patient Portal**: Next.js 14 PWA for patient self-service (appointments, records, messaging)
- **Staff Portal**: Next.js 15 for healthcare professionals with clinical workflow management
- **Admin Dashboard**: Next.js 15 for system administrators and technical management
- **TypeScript**: Full type safety across all frontend applications
- **tRPC**: End-to-end type safety between frontend and backend
- **PWA Support**: Installable web apps that work offline

## 🚀 Quick Start

Each service and application runs independently:

### Prerequisites
- .NET 9.0 SDK (for backend services)
- Python 3.11+ (for AI service)
- Node.js 18+ (for frontend apps)
- PostgreSQL and Redis

### Running Services

**Backend Services**:
```bash
cd services/emr-backend && dotnet run --project src/EMR.API
cd services/auth-service && dotnet run
cd services/python-ai && uvicorn main:app --reload
```

**Frontend Applications**:
```bash
cd apps/patient-portal && npm run dev     # Port 3000
cd apps/staff-portal && npm run dev       # Port 3001  
cd apps/admin-dashboard && npm run dev    # Port 3002
```

### Service URLs
- Main API: `http://localhost:5000`
- Auth Service: `http://localhost:5001` 
- AI Service: `http://localhost:8001`
- Patient Portal: `http://localhost:3000`
- Staff Portal: `http://localhost:3001`
- Admin Dashboard: `http://localhost:3002`

## 🏥 Key Features

### Clinical Management
- **Patient Records**: Comprehensive patient demographics and history
- **Appointment Scheduling**: Advanced scheduling system
- **Treatment Plans**: Customizable therapy protocols
- **Clinical Notes**: SOAP notes with templates
- **Progress Tracking**: Visual analytics and outcome measurements

### AI-Powered Capabilities
- **Computer Vision**: Posture analysis and movement assessment
- **Medical Image Processing**: X-ray, MRI analysis assistance
- **Predictive Analytics**: Treatment outcome predictions
- **NLP**: Clinical note analysis and medical coding
- **Voice Recognition**: Speech-to-text documentation

### Patient Portal Features
- **PWA Functionality**: Installable on mobile devices, offline support
- **Patient Self-Service**: Appointment booking, prescription refills, messaging
- **Medical Records Access**: View test results, treatment history, documents  
- **Mobile Optimized**: Touch-friendly interface for phones and tablets

### Staff Portal Features
- **Dashboard Overview**: Real-time view of appointments and clinical metrics
- **Appointment Management**: Schedule, view, and manage patient appointments
- **Patient Records**: Access and update patient information and medical history
- **Treatment Plans**: Create, modify, and track patient treatment plans
- **Progress Notes**: Document patient progress and clinical observations
- **Clinical Workflow**: Morning dashboard, patient check-in, progress documentation
- **Quick Actions**: Fast access to common clinical tasks

### Admin Dashboard Features
- **System Overview**: Real-time metrics and system health monitoring
- **User Management**: Add, edit, deactivate users and manage permissions
- **System Configuration**: Global settings and technical configurations
- **Security Settings**: Authentication, authorization, and security policies
- **Analytics & Reports**: System performance metrics and usage analytics
- **Activity Monitoring**: Real-time system activity and audit logs

## 📚 Documentation

Each service and application has detailed documentation:

- **[EMR Backend](services/emr-backend/README.md)** - Clean Architecture .NET backend with CQRS
- **[Python AI Service](services/python-ai/README.md)** - Machine learning and computer vision
- **[Auth Service](services/auth-service/README.md)** - Authentication and authorization
- **[Patient Portal](apps/patient-portal/README.md)** - Next.js PWA for patient self-service
- **[Staff Portal](apps/staff-portal/README.md)** - Next.js unified healthcare staff interface
- **[Admin Dashboard](apps/admin-dashboard/README.md)** - Next.js system administration

## 🔐 Authentication & Authorization

### **Multi-Method Authentication**
- **👤 Manual Login**: Username/password with secure BCrypt hashing
- **🌐 Social SSO**: Google, Microsoft, Facebook, LinkedIn, Apple, GitHub
- **🏢 Enterprise SSO**: SAML 2.0, Azure AD, Active Directory integration
- **🔒 Multi-Factor Authentication**: TOTP authenticator apps, backup codes

### **Role-Based Access Control (RBAC)**
- **👥 User Types**: Patient, Staff, Admin with distinct access levels
- **🏥 Staff Roles**: Physician, Nurse, Physiotherapist, Front Desk, Practice Manager
- **💻 Admin Roles**: System Admin, IT Administrator, Security Admin
- **🎯 Granular Permissions**: Fine-grained permission system per feature

### **JWT Token Strategy**
- **⚡ Access Tokens**: Short-lived (15 min) with user claims and permissions
- **🔄 Refresh Tokens**: Long-lived (30 days), HTTP-only, automatically rotated
- **🎫 Token Claims**: User ID, roles, permissions, expiration for API authorization
- **🚪 Centralized Auth**: Single auth service for all applications and APIs

### **Development/Testing**
Easy login for local development with pre-seeded test accounts:
```
Patient: patient@test.com / Test123!
Doctor: doctor@test.com / Test123!
Nurse: nurse@test.com / Test123!
Admin: admin@test.com / Admin123!
```

## 🔒 Security & Compliance

- **🛡️ Comprehensive Authentication**: Multiple authentication methods with MFA support
- **🔐 Role-based Access Control**: Granular permissions mapped to healthcare workflows
- **📊 Session Management**: Secure session handling with concurrent session limits
- **🔍 Audit Logging**: Complete authentication and authorization audit trail
- **🏥 HIPAA Compliance**: Healthcare data protection standards and audit requirements
- **🔒 Data Encryption**: Encrypted data transmission (TLS) and storage (AES)

## 🐳 Deployment

Infrastructure and deployment configurations are available in the `infrastructure/` directory for:
- Docker containerization
- Kubernetes orchestration  
- Cloud deployment (AWS, Azure, GCP)
- CI/CD pipeline configurations

## 🛠️ Development

### Project-Specific Development
Each service/app maintains its own:
- Package management and dependencies
- Development and build scripts
- Testing frameworks and configurations
- Environment variables and configuration

### Getting Started with a Service
1. Navigate to the specific service/app directory
2. Follow the README instructions for that technology stack
3. Set up the required dependencies and environment
4. Run the development server

### Cross-Service Communication
Services communicate via:
- REST APIs with OpenAPI/Swagger documentation
- Message queues for async processing
- Shared data contracts and DTOs

## 🤝 Contributing

When contributing to this multi-stack project:
1. Identify which service/app your changes affect
2. Follow the specific technology stack conventions
3. Update relevant documentation
4. Test within the appropriate project context
5. Consider impact on other services

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support or questions about the architecture, create an issue on GitHub or contact the development team.