namespace EMR.Application.DTOs;

public record PatientDto
{
    public long Id { get; init; }
    public Guid Uuid { get; init; }
    
    // Personal Information
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string? Title { get; init; }
    
    public DateTime? DateOfBirth { get; init; }
    public int? Age { get; init; }
    public string Gender { get; init; } = string.Empty;
    
    public string? SocialSecurityNumber { get; init; }
    public string? DriversLicense { get; init; }
    
    // Contact Information
    public string? Street { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? CountryCode { get; init; }
    
    public string? PhoneHome { get; init; }
    public string? PhoneMobile { get; init; }
    public string? PhoneWork { get; init; }
    public string? Email { get; init; }
    
    // Demographics
    public string? Race { get; init; }
    public string? Ethnicity { get; init; }
    public string? Language { get; init; }
    public string? Religion { get; init; }
    public string? MaritalStatus { get; init; }
    public string? Occupation { get; init; }
    
    // Medical Information
    public long? PrimaryProviderId { get; init; }
    public UserDto? PrimaryProvider { get; init; }
    
    // Emergency Contact
    public string? EmergencyContactName { get; init; }
    public string? EmergencyContactRelationship { get; init; }
    public string? EmergencyContactPhone { get; init; }
    
    // Insurance & Status
    public string? InsuranceId { get; init; }
    public string Status { get; init; } = "active";
    
    // HIPAA Preferences
    public bool HipaaMailAllowed { get; init; }
    public bool HipaaVoiceAllowed { get; init; }
    public bool HipaaSmsAllowed { get; init; }
    public bool HipaaEmailAllowed { get; init; }
    
    // Audit Information
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}


public record PatientSearchDto
{
    public string? SearchTerm { get; init; }
    public string? Gender { get; init; }
    public DateTime? DateOfBirthFrom { get; init; }
    public DateTime? DateOfBirthTo { get; init; }
    public long? ProviderId { get; init; }
    public string? Status { get; init; }
    
    // Pagination
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 25;
    
    // Sorting
    public string? SortBy { get; init; }
    public bool SortDescending { get; init; } = false;
}

public record PatientStatsDto
{
    public int TotalAppointments { get; init; }
    public int CompletedAppointments { get; init; }
    public int TotalEncounters { get; init; }
    public DateTime? LastAppointmentDate { get; init; }
    public DateTime? NextAppointmentDate { get; init; }
    
    // PT-specific stats
    public int TotalPTSessions { get; init; }
    public int CompletedPTSessions { get; init; }
    public int ActiveTreatmentPlans { get; init; }
}

