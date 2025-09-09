namespace EMR.Application.DTOs;

public class AppointmentDto
{
    public long Id { get; set; }
    public Guid Uuid { get; set; }
    public long PatientId { get; set; }
    public long ProviderId { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AppointmentType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Related entities
    public PatientDto? Patient { get; set; }
    public UserDto? Provider { get; set; }
}

public class UserDto
{
    public long Id { get; set; }
    public Guid Uuid { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public string? Credentials { get; set; }
    public string? Bio { get; set; }
    public long? FacilityId { get; set; }
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class EncounterDto
{
    public long Id { get; set; }
    public Guid Uuid { get; set; }
    public long PatientId { get; set; }
    public long ProviderId { get; set; }
    public DateTime EncounterDateTime { get; set; }
    public string EncounterType { get; set; } = string.Empty;
    public string? ChiefComplaint { get; set; }
    public string? AssessmentAndPlan { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Related entities
    public PatientDto? Patient { get; set; }
    public UserDto? Provider { get; set; }
}