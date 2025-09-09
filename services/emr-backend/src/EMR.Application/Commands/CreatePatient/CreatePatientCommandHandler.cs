using MediatR;
using EMR.Core.Entities;
using EMR.Core.Interfaces;
using EMR.Application.Common;
using EMR.Application.DTOs;

namespace EMR.Application.Commands.CreatePatient;

public class CreatePatientCommandHandler : IRequestHandler<CreatePatientCommand, ServiceResult<PatientDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreatePatientCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<PatientDto>> Handle(CreatePatientCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if patient with email already exists
            if (!string.IsNullOrEmpty(request.Email))
            {
                var existingPatient = await _unitOfWork.Patients.GetByEmailAsync(request.Email, cancellationToken);
                if (existingPatient != null)
                {
                    return ServiceResult<PatientDto>.Conflict("A patient with this email already exists.");
                }
            }

            // Create new patient entity
            var patient = new Patient
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                MiddleName = request.MiddleName,
                Title = request.Title,
                DateOfBirth = request.DateOfBirth ?? DateTime.MinValue,
                Gender = request.Gender,
                SocialSecurityNumber = request.SocialSecurityNumber,
                DriversLicense = request.DriversLicense,
                
                // Contact Information
                Street = request.Street,
                City = request.City,
                State = request.State,
                PostalCode = request.PostalCode,
                CountryCode = request.CountryCode ?? "US",
                PhoneHome = request.PhoneHome,
                PhoneMobile = request.PhoneMobile,
                PhoneWork = request.PhoneWork,
                Email = request.Email,
                
                // Demographics
                Race = request.Race,
                Ethnicity = request.Ethnicity,
                Language = request.Language ?? "en",
                Religion = request.Religion,
                MaritalStatus = request.MaritalStatus,
                Occupation = request.Occupation,
                
                // Medical
                PrimaryProviderId = request.PrimaryProviderId,
                
                // Emergency Contact
                EmergencyContactName = request.EmergencyContactName,
                EmergencyContactRelationship = request.EmergencyContactRelationship,
                EmergencyContactPhone = request.EmergencyContactPhone,
                
                // Insurance & Preferences
                InsuranceId = request.InsuranceId,
                HipaaMailAllowed = request.HipaaMailAllowed,
                HipaaVoiceAllowed = request.HipaaVoiceAllowed,
                HipaaSmsAllowed = request.HipaaSmsAllowed,
                HipaaEmailAllowed = request.HipaaEmailAllowed,
                
                // Default values
                Status = "Active",
                Uuid = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Validate primary provider exists if specified
            if (request.PrimaryProviderId.HasValue)
            {
                var provider = await _unitOfWork.Users.GetByIdAsync(request.PrimaryProviderId.Value, cancellationToken);
                if (provider == null || provider.Role != "Provider")
                {
                    return ServiceResult<PatientDto>.BadRequest("Invalid primary provider specified.");
                }
            }

            // Add patient to database
            await _unitOfWork.Patients.AddAsync(patient, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Map to DTO
            var patientDto = MapToDto(patient);

            return ServiceResult<PatientDto>.Created(patientDto);
        }
        catch (Exception ex)
        {
            return ServiceResult<PatientDto>.Error($"An error occurred while creating the patient: {ex.Message}");
        }
    }

    private static PatientDto MapToDto(Patient patient)
    {
        return new PatientDto
        {
            Id = patient.Id,
            Uuid = patient.Uuid,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            MiddleName = patient.MiddleName,
            Title = patient.Title,
            DateOfBirth = patient.DateOfBirth,
            Gender = patient.Gender,
            SocialSecurityNumber = patient.SocialSecurityNumber,
            DriversLicense = patient.DriversLicense,
            
            // Contact Information
            Street = patient.Street,
            City = patient.City,
            State = patient.State,
            PostalCode = patient.PostalCode,
            CountryCode = patient.CountryCode,
            PhoneHome = patient.PhoneHome,
            PhoneMobile = patient.PhoneMobile,
            PhoneWork = patient.PhoneWork,
            Email = patient.Email,
            
            // Demographics
            Race = patient.Race,
            Ethnicity = patient.Ethnicity,
            Language = patient.Language,
            Religion = patient.Religion,
            MaritalStatus = patient.MaritalStatus,
            Occupation = patient.Occupation,
            
            // Medical
            PrimaryProviderId = patient.PrimaryProviderId,
            
            // Emergency Contact
            EmergencyContactName = patient.EmergencyContactName,
            EmergencyContactRelationship = patient.EmergencyContactRelationship,
            EmergencyContactPhone = patient.EmergencyContactPhone,
            
            // Insurance & Preferences
            InsuranceId = patient.InsuranceId,
            HipaaMailAllowed = patient.HipaaMailAllowed,
            HipaaVoiceAllowed = patient.HipaaVoiceAllowed,
            HipaaSmsAllowed = patient.HipaaSmsAllowed,
            HipaaEmailAllowed = patient.HipaaEmailAllowed,
            
            Status = patient.Status,
            CreatedAt = patient.CreatedAt,
            UpdatedAt = patient.UpdatedAt
        };
    }
}