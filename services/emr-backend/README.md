# EMR Backend Solution

A modern EMR (Electronic Medical Records) backend built with .NET 9.0, implementing Clean Architecture principles with CQRS pattern using MediatR.

## Architecture

This solution follows **Clean Architecture** principles with clear separation of concerns across multiple projects:

### Projects Structure

```
src/
├── EMR.API/                    # Presentation Layer (Controllers, Middleware, Filters)
├── EMR.Application/           # Application Layer (Commands, Queries, DTOs, Validators)
├── EMR.Core/                  # Domain Layer (Entities, Value Objects, Interfaces)
└── EMR.Infrastructure/        # Infrastructure Layer (Data, Repositories, External Services)

tests/
├── EMR.Tests.Unit/           # Unit tests
└── EMR.Tests.Integration/    # Integration tests
```

### Key Patterns & Technologies

- **Clean Architecture**: Dependency inversion with clear separation of layers
- **CQRS**: Command Query Responsibility Segregation using MediatR
- **Entity Framework Core**: ORM with PostgreSQL database
- **FluentValidation**: Input validation
- **AutoMapper**: Object-to-object mapping
- **Serilog**: Structured logging
- **Swagger/OpenAPI**: API documentation
- **Health Checks**: Application monitoring

## Layer Responsibilities

### EMR.Core (Domain Layer)
- **Entities**: Domain models (Patient, User, Appointment, etc.)
- **Value Objects**: Immutable objects representing domain concepts
- **Interfaces**: Abstract contracts for repositories and services
- **Domain Events**: Business events that occur within the domain
- **Specifications**: Domain validation rules

**Dependencies**: None (Pure domain logic)

### EMR.Application (Application Layer)
- **Commands**: Write operations using CQRS pattern
- **Queries**: Read operations using CQRS pattern  
- **DTOs**: Data Transfer Objects for API responses
- **Validators**: FluentValidation rules for commands/queries
- **Mappings**: AutoMapper profiles
- **Behaviors**: Cross-cutting concerns (logging, validation, caching)

**Dependencies**: EMR.Core

### EMR.Infrastructure (Infrastructure Layer)
- **Data**: Entity Framework DbContext and configurations
- **Repositories**: Data access implementations
- **Services**: External service implementations
- **Caching**: Redis and memory caching
- **Storage**: File storage (AWS S3, Azure Blob)
- **Messaging**: Message bus implementations

**Dependencies**: EMR.Core, EMR.Application

### EMR.API (Presentation Layer)
- **Controllers**: REST API endpoints
- **Middleware**: Custom HTTP middleware
- **Filters**: Action/Exception filters
- **Extensions**: Service registration extensions
- **Hubs**: SignalR hubs for real-time communication

**Dependencies**: EMR.Core, EMR.Application, EMR.Infrastructure

## Getting Started

### Prerequisites
- .NET 9.0 SDK
- PostgreSQL 13+
- Redis (optional, for caching)

### Setup

1. **Clone and navigate to the solution**:
   ```bash
   cd /Users/dang/dev/modern-emr/services/emr-backend
   ```

2. **Restore packages**:
   ```bash
   dotnet restore
   ```

3. **Update database connection**:
   Edit connection string in `src/EMR.API/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=emr_db;Username=postgres;Password=your_password"
     }
   }
   ```

4. **Build the solution**:
   ```bash
   dotnet build
   ```

5. **Run the API**:
   ```bash
   cd src/EMR.API
   dotnet run
   ```

6. **Access Swagger UI**:
   Navigate to `https://localhost:5001` (or the port shown in console)

## API Endpoints

### Patients
- `POST /api/v1/patients` - Create a new patient
- `GET /api/v1/patients/{id}` - Get patient by ID
- `GET /api/v1/patients` - Search patients with filters

### Health Checks
- `GET /health` - Application health status

## CQRS Implementation

### Commands (Write Operations)
Commands are located in `EMR.Application/Commands/` and follow this pattern:
- `CreatePatientCommand` - Command model
- `CreatePatientHandler` - Business logic
- `CreatePatientValidator` - Input validation

### Queries (Read Operations)  
Queries are located in `EMR.Application/Queries/` and follow this pattern:
- `GetPatientByIdQuery` - Query model
- `GetPatientByIdHandler` - Data retrieval logic

### Example Usage
```csharp
// In Controller
[HttpPost]
public async Task<ActionResult<PatientDto>> CreatePatient([FromBody] CreatePatientCommand command)
{
    var result = await _mediator.Send(command);
    return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
}
```

## Database

### Entity Framework Core
- **Provider**: Npgsql (PostgreSQL)
- **Migrations**: Located in `EMR.Infrastructure/Migrations/`
- **Configuration**: Fluent API in `EMR.Infrastructure/Data/`

### Key Entities
- **Patient**: Core patient information and demographics
- **User**: Healthcare providers and staff
- **Appointment**: Patient appointments
- **Encounter**: Clinical encounters
- **PT-specific entities**: PTEvaluation, PTSession, PTTreatmentPlan, RangeOfMotionTest

## Configuration

### Environment Variables
- `ASPNETCORE_ENVIRONMENT` - Environment (Development, Staging, Production)
- `ConnectionStrings__DefaultConnection` - Database connection string
- `Redis__ConnectionString` - Redis connection (if using Redis caching)

### appsettings.json Structure
```json
{
  "Logging": {
    "LogLevel": { "Default": "Information" }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=emr_db;Username=postgres;Password=password"
  },
  "AllowedHosts": "*"
}
```

## Development Guidelines

### Adding New Features
1. **Define Domain Entity** in `EMR.Core/Entities/`
2. **Create DTOs** in `EMR.Application/DTOs/`
3. **Implement Commands/Queries** in `EMR.Application/Commands|Queries/`
4. **Add Controllers** in `EMR.API/Controllers/`
5. **Configure EF mappings** in `EMR.Infrastructure/Data/`

### Code Standards
- Use nullable reference types
- Follow Clean Architecture boundaries
- Implement proper validation using FluentValidation
- Use async/await for all I/O operations
- Include XML documentation for public APIs

## Future Enhancements

- [ ] Complete PT-specific entity implementations
- [ ] Add comprehensive validation rules
- [ ] Implement caching strategies
- [ ] Add authentication/authorization
- [ ] Create database migrations
- [ ] Add comprehensive test coverage
- [ ] Implement background job processing
- [ ] Add real-time features with SignalR

## Migration from Old Structure

This solution replaces the previous single-project `dotnet-api` with a proper multi-project Clean Architecture implementation. Key benefits:

- **Better Separation of Concerns**: Clear boundaries between layers
- **Improved Testability**: Each layer can be tested in isolation  
- **Enhanced Maintainability**: Changes in one layer don't affect others
- **CQRS Performance**: Optimized read/write operations
- **Industry Best Practices**: Following established .NET architecture patterns