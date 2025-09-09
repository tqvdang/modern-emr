# Auth Service - .NET 9 Identity & Authentication

Centralized authentication and authorization service supporting multiple authentication methods and providers.

## 🔐 Authentication Methods

### **Local Authentication**
- Username/Password with secure password hashing (BCrypt)
- Email/Password authentication
- Multi-Factor Authentication (MFA) with TOTP
- Password reset and email verification

### **Social Sign-On (SSO) Providers**
- **Microsoft**: Azure AD, Microsoft 365, Office 365
- **Google**: Google Workspace, Gmail accounts
- **Facebook**: Facebook Login
- **LinkedIn**: LinkedIn OAuth
- **Apple**: Sign in with Apple (mobile)
- **GitHub**: Developer accounts

### **Enterprise SSO**
- **SAML 2.0**: Enterprise identity providers
- **OpenID Connect**: Custom OIDC providers
- **Active Directory**: On-premises AD integration
- **Azure AD**: Enterprise Azure Active Directory

## 🏗️ Architecture

### **Core Components**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Auth Service   │    │  Identity       │
│   Apps          │───▶│   (.NET 9)       │───▶│  Providers      │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   PostgreSQL     │
                       │   + Redis Cache  │
                       └──────────────────┘
```

### **Token Flow**
1. **Login**: User authenticates via local or SSO
2. **JWT Generation**: Service creates access + refresh tokens
3. **API Access**: Frontend uses JWT for API calls
4. **Token Refresh**: Automatic token renewal
5. **Logout**: Token invalidation and cleanup

## 🛠️ Technology Stack

- **Framework**: ASP.NET Core 9.0 Web API
- **Identity**: ASP.NET Core Identity with Entity Framework
- **Database**: PostgreSQL for user data, Redis for sessions/cache
- **JWT**: System.IdentityModel.Tokens.Jwt for token management
- **Validation**: FluentValidation for input validation
- **Logging**: Serilog for comprehensive logging
- **Email**: MailKit for email verification and notifications
- **Security**: BCrypt for password hashing, data protection APIs

## 🚀 Getting Started

### Prerequisites
- .NET 9.0 SDK
- PostgreSQL database
- Redis server
- SMTP server (for email verification)

### Installation
```bash
# Restore packages
dotnet restore

# Update database
dotnet ef database update

# Run service
dotnet run
```

### Configuration
Copy and configure environment variables:
```bash
cp .env.example .env
```

## ⚙️ Configuration

### Database & Cache
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=auth_db;User=postgres;Password=password;",
    "Redis": "localhost:6379"
  }
}
```

### JWT Settings
```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-jwt-key-min-32-characters",
    "Issuer": "EMR.AuthService",
    "Audience": "EMR.Applications",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 30
  }
}
```

### Social Providers
```json
{
  "Authentication": {
    "Google": {
      "ClientId": "your-google-client-id",
      "ClientSecret": "your-google-client-secret"
    },
    "Microsoft": {
      "ClientId": "your-microsoft-client-id",
      "ClientSecret": "your-microsoft-client-secret"
    },
    "Facebook": {
      "AppId": "your-facebook-app-id",
      "AppSecret": "your-facebook-app-secret"
    },
    "LinkedIn": {
      "ClientId": "your-linkedin-client-id",
      "ClientSecret": "your-linkedin-client-secret"
    }
  }
}
```

## 👥 Role-Based Access Control (RBAC)

### **User Types**
```csharp
public enum UserType
{
    Patient,
    Staff,
    Admin
}
```

### **Healthcare Staff Roles**
```csharp
public enum StaffRole
{
    // Clinical Staff
    Physician,
    Nurse, 
    Physiotherapist,
    MedicalAssistant,
    
    // Operations Staff
    FrontDesk,
    BillingStaff,
    PracticeManager,
    
    // Support Staff
    HelpDesk
}
```

### **System Admin Roles**
```csharp
public enum AdminRole
{
    SystemAdmin,
    ITAdministrator,
    SecurityAdmin,
    DatabaseAdmin
}
```

### **Permissions System**
```csharp
public enum Permission
{
    // Patient Data
    ViewPatients,
    CreatePatients,
    EditPatients,
    DeletePatients,
    
    // Clinical
    ViewMedicalRecords,
    EditMedicalRecords,
    CreatePrescriptions,
    ViewLabResults,
    
    // Scheduling
    ViewSchedule,
    ManageAppointments,
    
    // Administrative
    ManageUsers,
    ViewReports,
    ManageSettings,
    
    // System
    SystemConfiguration,
    ViewAuditLogs,
    ManageIntegrations
}
```

## 🔒 API Endpoints

### **Authentication**
```http
POST /api/auth/login                 # Local login
POST /api/auth/logout                # Logout
POST /api/auth/refresh-token         # Refresh JWT token
POST /api/auth/forgot-password       # Password reset
POST /api/auth/reset-password        # Complete password reset
POST /api/auth/verify-email          # Email verification
```

### **Social Authentication**
```http
GET  /api/auth/google                # Google OAuth login
GET  /api/auth/microsoft             # Microsoft OAuth login
GET  /api/auth/facebook              # Facebook OAuth login
GET  /api/auth/linkedin              # LinkedIn OAuth login
POST /api/auth/external-callback     # OAuth callback handler
```

### **User Management**
```http
GET  /api/users/me                   # Current user profile
PUT  /api/users/me                   # Update profile
POST /api/users/change-password      # Change password
POST /api/users/enable-mfa           # Enable 2FA
POST /api/users/verify-mfa           # Verify 2FA code
```

### **Admin Endpoints** (Admin role required)
```http
GET  /api/admin/users                # List all users
POST /api/admin/users                # Create user
PUT  /api/admin/users/{id}           # Update user
DELETE /api/admin/users/{id}         # Deactivate user
POST /api/admin/users/{id}/roles     # Assign roles
```

## 🔐 JWT Token Structure

### **Access Token Claims**
```json
{
  "sub": "user-id",
  "email": "user@example.com", 
  "name": "John Doe",
  "userType": "Staff",
  "roles": ["Physician", "PracticeManager"],
  "permissions": ["ViewPatients", "EditMedicalRecords"],
  "iat": 1640995200,
  "exp": 1640996100,
  "iss": "EMR.AuthService",
  "aud": "EMR.Applications"
}
```

### **Refresh Token**
- Secure, HTTP-only cookie
- Long-lived (30 days default)
- Rotated on each refresh
- Revokable for security

## 🛡️ Security Features

### **Password Security**
- BCrypt hashing with salt
- Configurable complexity requirements
- Account lockout after failed attempts
- Password history prevention

### **Multi-Factor Authentication (MFA)**
- TOTP (Time-based One-Time Password)
- Authenticator app support (Google Authenticator, Authy)
- Backup codes for account recovery
- SMS/Email backup options

### **Session Management**
- JWT with short expiration (15 minutes)
- Automatic token refresh
- Concurrent session limits
- Device-based session tracking

### **Security Headers**
- CORS configuration
- CSRF protection
- Rate limiting
- Security headers middleware

## 📊 Monitoring & Logging

### **Audit Logging**
- All authentication attempts
- Permission changes
- Failed login attempts
- Administrative actions

### **Health Checks**
```http
GET /health                          # Overall health
GET /health/database                 # Database connectivity
GET /health/redis                    # Redis connectivity  
GET /health/external                 # External provider health
```

### **Metrics**
- Active user sessions
- Authentication success/failure rates
- Token refresh patterns
- MFA adoption rates

## 🔄 Integration Examples

### **Frontend Integration (JavaScript)**
```javascript
// Login with credentials
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken, refreshToken } = await loginResponse.json();

// Use JWT for API calls
const apiResponse = await fetch('/api/patients', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// Automatic token refresh
if (apiResponse.status === 401) {
  const newTokens = await refreshAccessToken();
  // Retry with new token
}
```

### **API Service Integration (.NET)**
```csharp
// Validate JWT in other services
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://auth-service.yourdomain.com";
        options.Audience = "EMR.Applications";
        options.RequireHttpsMetadata = true;
    });

// Check permissions
[Authorize(Policy = "ViewPatients")]
public async Task<IActionResult> GetPatients()
{
    // Access user claims
    var userId = User.FindFirst("sub")?.Value;
    var userType = User.FindFirst("userType")?.Value;
    var roles = User.FindAll("roles").Select(c => c.Value);
}
```

## 🚀 Deployment

### **Environment Variables**
```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection="Server=prod-db;Database=auth_db;..."
ConnectionStrings__Redis="prod-redis:6379"
JwtSettings__SecretKey="production-secret-key-32-chars-minimum"
Authentication__Google__ClientId="prod-google-client-id"
```

### **Docker Support**
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY . .
EXPOSE 80
ENTRYPOINT ["dotnet", "Auth.API.dll"]
```

### **Health Monitoring**
- Application Insights integration
- Structured logging with Serilog
- Performance metrics collection
- Error tracking and alerting

## 🔧 Development & Testing

### **Local Development**
```bash
# Install dev certificates
dotnet dev-certs https --trust

# Copy environment config
cp .env.example .env

# Run with hot reload
dotnet watch run

# Generate migration
dotnet ef migrations add InitialCreate

# Update database (with test data)
dotnet ef database update
```

### **🧪 Test User Accounts (Development Mode)**

When `Development__EnableTestUsers=true`, these accounts are automatically seeded:

#### **👤 Patient Test Accounts**
```
Email: patient@test.com
Password: Test123!
Type: Patient
```

#### **👩‍⚕️ Healthcare Staff Test Accounts**
```
Email: doctor@test.com
Password: Test123!
Type: Staff
Role: Physician

Email: nurse@test.com  
Password: Test123!
Type: Staff
Role: Nurse

Email: physio@test.com
Password: Test123!
Type: Staff
Role: Physiotherapist

Email: frontdesk@test.com
Password: Test123!
Type: Staff
Role: FrontDesk

Email: manager@test.com
Password: Test123!
Type: Staff  
Role: PracticeManager
```

#### **💻 Admin Test Accounts**
```
Email: admin@test.com
Password: Admin123!
Type: Admin
Role: SystemAdmin

Email: it@test.com
Password: Admin123!
Type: Admin
Role: ITAdministrator
```

### **🚀 Quick Testing**

#### **Easy Login API Test**
```bash
# Test patient login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"Test123!"}'

# Test staff login (doctor)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor@test.com","password":"Test123!"}'

# Test admin login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
```

#### **Frontend Quick Login Examples**
```javascript
// Quick patient login for testing
const patientLogin = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'patient@test.com',
      password: 'Test123!'
    })
  });
  return response.json();
};

// Quick staff login for testing
const staffLogin = async (role = 'doctor') => {
  const emails = {
    doctor: 'doctor@test.com',
    nurse: 'nurse@test.com',
    physio: 'physio@test.com',
    frontdesk: 'frontdesk@test.com',
    manager: 'manager@test.com'
  };
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emails[role],
      password: 'Test123!'
    })
  });
  return response.json();
};

// Quick admin login for testing
const adminLogin = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@test.com',
      password: 'Admin123!'
    })
  });
  return response.json();
};
```

### **⚙️ Development Configuration**

The `.env.example` file includes relaxed settings for easy development:

- **Password Requirements**: Simplified (6 chars minimum)
- **Email Verification**: Bypassed in development
- **HTTPS**: Optional for local development
- **Rate Limiting**: Disabled
- **CORS**: Permissive for testing
- **Token Expiration**: Longer (60 minutes vs 15 minutes)

### **🔒 Security Notes**

⚠️ **Important**: These settings are for development only!

**DO NOT use in production:**
- Test user accounts
- Weak password requirements  
- Bypassed email verification
- Permissive CORS settings
- Long token expiration times

### **Testing**
```bash
# Unit tests
dotnet test

# Integration tests with TestServer
dotnet test --filter Category=Integration

# Test with specific user types
dotnet test --filter "Category=Integration&TestCategory=PatientAuth"
dotnet test --filter "Category=Integration&TestCategory=StaffAuth"
dotnet test --filter "Category=Integration&TestCategory=AdminAuth"
```

### **🐳 Docker Development**
```bash
# Run with Docker Compose (includes PostgreSQL and Redis)
docker-compose -f docker-compose.dev.yml up

# The auth service will be available at:
# http://localhost:5001
```

### **📱 Mobile App Testing**

For mobile app development, the service supports:
- **HTTP**: Allowed in development for local testing
- **CORS**: Configured for mobile app origins
- **Token Storage**: Supports both cookies and local storage

### **🌐 Browser Testing**

Access the Swagger UI for interactive API testing:
```
http://localhost:5001/swagger
```

Pre-configured with test user credentials for easy API exploration.

---

This authentication service provides enterprise-grade security with support for all major authentication methods while maintaining ease of use and centralized management. The development configuration ensures quick setup and testing while maintaining security best practices for production deployments.