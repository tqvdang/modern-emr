using MediatR;
using EMR.Application.Common;
using EMR.Application.DTOs;

namespace EMR.Application.Commands.CreatePatient;

public record CreatePatientCommand : IRequest<ServiceResult<PatientDto>>
{
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? MiddleName { get; init; }
    public string? Title { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public string Gender { get; init; } = string.Empty;
    public string? SocialSecurityNumber { get; init; }
    public string? DriversLicense { get; init; }
    
    // Contact Information
    public string? Street { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public string? CountryCode { get; init; } = "US";
    public string? PhoneHome { get; init; }
    public string? PhoneMobile { get; init; }
    public string? PhoneWork { get; init; }
    public string? Email { get; init; }
    
    // Demographics
    public string? Race { get; init; }
    public string? Ethnicity { get; init; }
    public string? Language { get; init; } = "en";
    public string? Religion { get; init; }
    public string? MaritalStatus { get; init; }
    public string? Occupation { get; init; }
    
    // Medical
    public long? PrimaryProviderId { get; init; }
    
    // Emergency Contact
    public string? EmergencyContactName { get; init; }
    public string? EmergencyContactRelationship { get; init; }
    public string? EmergencyContactPhone { get; init; }
    
    // Insurance & Preferences
    public string? InsuranceId { get; init; }
    public bool HipaaMailAllowed { get; init; } = true;
    public bool HipaaVoiceAllowed { get; init; } = true;
    public bool HipaaSmsAllowed { get; init; } = false;
    public bool HipaaEmailAllowed { get; init; } = false;
}