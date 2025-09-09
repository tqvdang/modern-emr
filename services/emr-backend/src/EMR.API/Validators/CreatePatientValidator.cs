using FluentValidation;
using EMR.Application.Commands.CreatePatient;

namespace EMR.API.Validators;

public class CreatePatientValidator : AbstractValidator<CreatePatientCommand>
{
    public CreatePatientValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .Length(2, 50).WithMessage("First name must be between 2 and 50 characters")
            .Matches(@"^[a-zA-Z\s-']+$").WithMessage("First name can only contain letters, spaces, hyphens, and apostrophes");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .Length(2, 50).WithMessage("Last name must be between 2 and 50 characters")
            .Matches(@"^[a-zA-Z\s-']+$").WithMessage("Last name can only contain letters, spaces, hyphens, and apostrophes");

        RuleFor(x => x.MiddleName)
            .MaximumLength(50).WithMessage("Middle name must not exceed 50 characters")
            .Matches(@"^[a-zA-Z\s-']*$").WithMessage("Middle name can only contain letters, spaces, hyphens, and apostrophes")
            .When(x => !string.IsNullOrEmpty(x.MiddleName));

        RuleFor(x => x.DateOfBirth)
            .NotEmpty().WithMessage("Date of birth is required")
            .LessThan(DateTime.Now).WithMessage("Date of birth must be in the past")
            .GreaterThan(DateTime.Now.AddYears(-150)).WithMessage("Date of birth cannot be more than 150 years ago");

        RuleFor(x => x.Gender)
            .NotEmpty().WithMessage("Gender is required")
            .Must(x => new[] { "Male", "Female", "Other", "Unknown" }.Contains(x))
            .WithMessage("Gender must be one of: Male, Female, Other, Unknown");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Email must be a valid email address")
            .MaximumLength(100).WithMessage("Email must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.PhoneHome)
            .Matches(@"^[\+]?[1-9][\d]{0,15}$").WithMessage("Home phone must be a valid phone number")
            .When(x => !string.IsNullOrEmpty(x.PhoneHome));

        RuleFor(x => x.PhoneMobile)
            .Matches(@"^[\+]?[1-9][\d]{0,15}$").WithMessage("Mobile phone must be a valid phone number")
            .When(x => !string.IsNullOrEmpty(x.PhoneMobile));

        RuleFor(x => x.Street)
            .MaximumLength(200).WithMessage("Street must not exceed 200 characters");

        RuleFor(x => x.City)
            .MaximumLength(100).WithMessage("City must not exceed 100 characters");

        RuleFor(x => x.State)
            .MaximumLength(50).WithMessage("State must not exceed 50 characters");

        RuleFor(x => x.PostalCode)
            .MaximumLength(20).WithMessage("Postal code must not exceed 20 characters");

        RuleFor(x => x.CountryCode)
            .MaximumLength(100).WithMessage("Country code must not exceed 100 characters");

        RuleFor(x => x.EmergencyContactName)
            .MaximumLength(100).WithMessage("Emergency contact name must not exceed 100 characters");

        RuleFor(x => x.EmergencyContactPhone)
            .Matches(@"^[\+]?[1-9][\d]{0,15}$").WithMessage("Emergency contact phone must be a valid phone number")
            .When(x => !string.IsNullOrEmpty(x.EmergencyContactPhone));

        RuleFor(x => x.EmergencyContactRelationship)
            .MaximumLength(50).WithMessage("Emergency contact relationship must not exceed 50 characters");

        // At least one contact method required
        RuleFor(x => x)
            .Must(x => !string.IsNullOrEmpty(x.Email) || !string.IsNullOrEmpty(x.PhoneHome) || !string.IsNullOrEmpty(x.PhoneMobile))
            .WithMessage("At least one contact method (email or phone) is required")
            .WithName("ContactMethod");
    }
}

public class CreateAppointmentValidator : AbstractValidator<object>
{
    public CreateAppointmentValidator()
    {
        // This would be for appointment creation validation
        // Since we don't have the actual appointment command yet, this is a placeholder
    }
}

public class CreateUserValidator : AbstractValidator<object>
{
    public CreateUserValidator()
    {
        // This would be for user creation validation
        // Since we don't have the actual user command yet, this is a placeholder
    }
}