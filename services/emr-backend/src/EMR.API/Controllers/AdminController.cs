using Microsoft.AspNetCore.Mvc;

namespace EMR.API.Controllers;

[ApiController]
[Route("api/v1/admin")]
public class AdminController : ControllerBase
{
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        // Mock user data for now
        var users = new[]
        {
            new
            {
                id = 1,
                uuid = "user-1",
                username = "admin",
                email = "admin@example.com",
                firstName = "System",
                lastName = "Administrator",
                role = "Administrator",
                status = "Active",
                lastLogin = "2025-09-07T10:30:00Z",
                createdAt = "2025-01-01T00:00:00Z",
                updatedAt = "2025-09-07T10:30:00Z"
            },
            new
            {
                id = 2,
                uuid = "user-2",
                username = "dr_smith",
                email = "smith@clinic.com",
                firstName = "Dr. Sarah",
                lastName = "Smith",
                role = "Provider",
                status = "Active",
                lastLogin = "2025-09-07T09:15:00Z",
                createdAt = "2025-01-01T00:00:00Z",
                updatedAt = "2025-09-06T16:45:00Z"
            },
            new
            {
                id = 3,
                uuid = "user-3",
                username = "nurse_johnson",
                email = "johnson@clinic.com",
                firstName = "Mark",
                lastName = "Johnson",
                role = "Staff",
                status = "Active",
                lastLogin = "2025-09-07T08:00:00Z",
                createdAt = "2025-01-15T00:00:00Z",
                updatedAt = "2025-09-07T08:00:00Z"
            },
            new
            {
                id = 4,
                uuid = "user-4",
                username = "receptionist",
                email = "reception@clinic.com",
                firstName = "Lisa",
                lastName = "Williams",
                role = "Staff",
                status = "Inactive",
                lastLogin = "2025-09-05T17:30:00Z",
                createdAt = "2025-02-01T00:00:00Z",
                updatedAt = "2025-09-05T17:30:00Z"
            }
        };

        return Ok(users);
    }

    [HttpGet("system/health")]
    public async Task<IActionResult> GetSystemHealth()
    {
        var health = new
        {
            status = "Healthy",
            version = "1.0.0",
            uptime = 86400, // 24 hours in seconds
            database = new
            {
                status = "Connected",
                responseTime = 25
            },
            redis = new
            {
                status = "Connected",
                responseTime = 5
            },
            services = new[]
            {
                new { name = "API Server", status = "Running", responseTime = 15 },
                new { name = "Background Jobs", status = "Running", responseTime = 10 },
                new { name = "File Storage", status = "Running", responseTime = 50 }
            }
        };

        return Ok(health);
    }

    [HttpGet("system/stats")]
    public async Task<IActionResult> GetSystemStats()
    {
        var stats = new
        {
            totalUsers = 1234,
            activeUsers = 89,
            totalPatients = 5678,
            totalAppointments = 12345,
            systemAlerts = 3,
            apiCallsPerHour = 45200,
            systemLoad = new
            {
                cpu = 45.2,
                memory = 68.9,
                disk = 34.1
            }
        };

        return Ok(stats);
    }

    [HttpGet("system/config")]
    public async Task<IActionResult> GetSystemConfigs()
    {
        var configs = new[]
        {
            new
            {
                id = "1",
                key = "MAX_UPLOAD_SIZE",
                value = "10485760",
                description = "Maximum file upload size in bytes (10MB)",
                category = "File Management",
                isReadOnly = false,
                updatedAt = "2025-09-01T10:00:00Z"
            },
            new
            {
                id = "2",
                key = "SESSION_TIMEOUT",
                value = "3600",
                description = "User session timeout in seconds (1 hour)",
                category = "Security",
                isReadOnly = false,
                updatedAt = "2025-09-01T10:00:00Z"
            },
            new
            {
                id = "3",
                key = "BACKUP_RETENTION_DAYS",
                value = "30",
                description = "Number of days to retain system backups",
                category = "Backup",
                isReadOnly = false,
                updatedAt = "2025-09-01T10:00:00Z"
            },
            new
            {
                id = "4",
                key = "API_RATE_LIMIT",
                value = "1000",
                description = "API requests per hour per user",
                category = "API",
                isReadOnly = false,
                updatedAt = "2025-09-01T10:00:00Z"
            },
            new
            {
                id = "5",
                key = "SYSTEM_VERSION",
                value = "1.0.0",
                description = "Current system version",
                category = "System",
                isReadOnly = true,
                updatedAt = "2025-09-01T10:00:00Z"
            }
        };

        return Ok(configs);
    }

    [HttpGet("audit/logs")]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int limit = 100, [FromQuery] int offset = 0)
    {
        var logs = new[]
        {
            new
            {
                id = 1,
                userId = 1,
                action = "LOGIN",
                entity = "User",
                entityId = "1",
                changes = (string?)null,
                ipAddress = "192.168.1.100",
                userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                timestamp = "2025-09-07T10:30:00Z",
                user = new
                {
                    id = 1,
                    username = "admin",
                    firstName = "System",
                    lastName = "Administrator"
                }
            },
            new
            {
                id = 2,
                userId = 2,
                action = "CREATE",
                entity = "Patient",
                entityId = "123",
                changes = "{\"firstName\":\"John\",\"lastName\":\"Smith\",\"email\":\"john.smith@email.com\"}",
                ipAddress = "192.168.1.101",
                userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                timestamp = "2025-09-07T09:15:00Z",
                user = new
                {
                    id = 2,
                    username = "dr_smith",
                    firstName = "Dr. Sarah",
                    lastName = "Smith"
                }
            },
            new
            {
                id = 3,
                userId = 1,
                action = "UPDATE",
                entity = "SystemConfig",
                entityId = "MAX_UPLOAD_SIZE",
                changes = "{\"old_value\":\"5242880\",\"new_value\":\"10485760\"}",
                ipAddress = "192.168.1.100",
                userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                timestamp = "2025-09-07T08:45:00Z",
                user = new
                {
                    id = 1,
                    username = "admin",
                    firstName = "System",
                    lastName = "Administrator"
                }
            }
        };

        return Ok(new { logs, total = 150 });
    }

    [HttpGet("security/events")]
    public async Task<IActionResult> GetSecurityEvents([FromQuery] int limit = 50, [FromQuery] int offset = 0)
    {
        var events = new object[]
        {
            new
            {
                id = 1,
                type = "FAILED_LOGIN",
                severity = "Medium",
                description = "Multiple failed login attempts detected",
                ipAddress = "203.0.113.45",
                userId = (int?)null,
                metadata = new
                {
                    attempts = 5,
                    username = "admin",
                    timeWindow = "5 minutes"
                },
                timestamp = "2025-09-07T11:15:00Z",
                resolved = false
            },
            new
            {
                id = 2,
                type = "SUSPICIOUS_API_ACTIVITY",
                severity = "High",
                description = "Unusual API request pattern detected",
                ipAddress = "198.51.100.22",
                userId = 5,
                metadata = new
                {
                    requestCount = 500,
                    timeWindow = "1 minute",
                    endpoints = new[] { "/api/patients", "/api/appointments" }
                },
                timestamp = "2025-09-07T10:45:00Z",
                resolved = false
            },
            new
            {
                id = 3,
                type = "UNAUTHORIZED_ACCESS",
                severity = "High",
                description = "Attempt to access restricted endpoint without proper permissions",
                ipAddress = "192.168.1.150",
                userId = 8,
                metadata = new
                {
                    endpoint = "/admin/system/config",
                    userRole = "Staff"
                },
                timestamp = "2025-09-07T09:30:00Z",
                resolved = true
            }
        };

        return Ok(new { events, total = 25 });
    }

    [HttpPost("security/events/{id}/resolve")]
    public async Task<IActionResult> ResolveSecurityEvent(int id)
    {
        // In a real implementation, this would update the database
        return Ok();
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] object userData)
    {
        // Mock response - in real implementation would create actual user
        var newUser = new
        {
            id = 5,
            uuid = "user-5",
            username = "new_user",
            email = "newuser@example.com",
            firstName = "New",
            lastName = "User",
            role = "Staff",
            status = "Active",
            lastLogin = (string?)null,
            createdAt = DateTime.UtcNow.ToString("O"),
            updatedAt = DateTime.UtcNow.ToString("O")
        };

        return CreatedAtAction(nameof(GetUsers), new { id = newUser.id }, newUser);
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] object userData)
    {
        // Mock response - in real implementation would update actual user
        var updatedUser = new
        {
            id,
            uuid = $"user-{id}",
            username = "updated_user",
            email = "updated@example.com",
            firstName = "Updated",
            lastName = "User",
            role = "Staff",
            status = "Active",
            lastLogin = "2025-09-07T10:30:00Z",
            createdAt = "2025-01-01T00:00:00Z",
            updatedAt = DateTime.UtcNow.ToString("O")
        };

        return Ok(updatedUser);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        // In real implementation would delete the user
        return NoContent();
    }

    [HttpPost("users/{id}/reset-password")]
    public async Task<IActionResult> ResetUserPassword(int id)
    {
        // Mock temporary password
        return Ok(new { temporaryPassword = "TempPass123!" });
    }
}