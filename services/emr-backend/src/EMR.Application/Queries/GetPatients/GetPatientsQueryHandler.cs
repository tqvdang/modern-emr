using MediatR;
using EMR.Core.Interfaces;
using EMR.Application.Common;
using EMR.Application.DTOs;
using EMR.Core.Entities;
using System.Linq.Expressions;

namespace EMR.Application.Queries.GetPatients;

public class GetPatientsQueryHandler : IRequestHandler<GetPatientsQuery, ServiceResult<IReadOnlyList<PatientDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPatientsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ServiceResult<IReadOnlyList<PatientDto>>> Handle(GetPatientsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Build the predicate for filtering
            var patients = await _unitOfWork.Patients.GetAsync(
                predicate: BuildPredicate(request),
                orderBy: BuildOrderBy(request),
                includeString: "",
                disableTracking: true,
                cancellationToken: cancellationToken
            );

            // Apply pagination
            var offset = (request.Page - 1) * request.PageSize;
            var paginatedPatients = patients.Skip(offset).Take(request.PageSize).ToList();

            var patientDtos = paginatedPatients.Select(MapToDto).ToList();

            return ServiceResult<IReadOnlyList<PatientDto>>.Success(patientDtos);
        }
        catch (Exception ex)
        {
            return ServiceResult<IReadOnlyList<PatientDto>>.Error($"An error occurred while retrieving patients: {ex.Message}");
        }
    }

    private static Expression<Func<Patient, bool>> BuildPredicate(GetPatientsQuery request)
    {
        // Start with the base predicate to filter out deleted patients
        Expression<Func<Patient, bool>> basePredicate = p => !p.IsDeleted;

        // Build search term filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLowerInvariant();
            Expression<Func<Patient, bool>> searchPredicate = p =>
                p.FirstName.ToLower().Contains(searchTerm) ||
                p.LastName.ToLower().Contains(searchTerm) ||
                (p.Email != null && p.Email.ToLower().Contains(searchTerm)) ||
                (p.PhoneMobile != null && p.PhoneMobile.Contains(searchTerm)) ||
                (p.PhoneHome != null && p.PhoneHome.Contains(searchTerm));
                
            basePredicate = CombinePredicates(basePredicate, searchPredicate);
        }

        // Apply gender filter
        if (!string.IsNullOrWhiteSpace(request.Gender))
        {
            Expression<Func<Patient, bool>> genderPredicate = p => p.Gender == request.Gender;
            basePredicate = CombinePredicates(basePredicate, genderPredicate);
        }

        // Apply date of birth range filter
        if (request.DateOfBirthFrom.HasValue)
        {
            var fromDate = request.DateOfBirthFrom.Value;
            Expression<Func<Patient, bool>> fromDatePredicate = p => p.DateOfBirth >= fromDate;
            basePredicate = CombinePredicates(basePredicate, fromDatePredicate);
        }

        if (request.DateOfBirthTo.HasValue)
        {
            var toDate = request.DateOfBirthTo.Value;
            Expression<Func<Patient, bool>> toDatePredicate = p => p.DateOfBirth <= toDate;
            basePredicate = CombinePredicates(basePredicate, toDatePredicate);
        }

        // Apply provider filter
        if (request.ProviderId.HasValue)
        {
            var providerId = request.ProviderId.Value;
            Expression<Func<Patient, bool>> providerPredicate = p => p.PrimaryProviderId == providerId;
            basePredicate = CombinePredicates(basePredicate, providerPredicate);
        }

        // Apply status filter
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var status = request.Status;
            Expression<Func<Patient, bool>> statusPredicate = p => p.Status == status;
            basePredicate = CombinePredicates(basePredicate, statusPredicate);
        }

        return basePredicate;
    }

    private static Expression<Func<T, bool>> CombinePredicates<T>(
        Expression<Func<T, bool>> first,
        Expression<Func<T, bool>> second)
    {
        var parameter = first.Parameters[0];
        var secondBody = ReplaceParameterVisitor.ReplaceParameters(second.Body, second.Parameters[0], parameter);
        return Expression.Lambda<Func<T, bool>>(Expression.AndAlso(first.Body, secondBody), parameter);
    }

    private class ReplaceParameterVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _oldParameter;
        private readonly ParameterExpression _newParameter;

        private ReplaceParameterVisitor(ParameterExpression oldParameter, ParameterExpression newParameter)
        {
            _oldParameter = oldParameter;
            _newParameter = newParameter;
        }

        public static Expression ReplaceParameters(Expression expression, ParameterExpression oldParameter, ParameterExpression newParameter)
        {
            return new ReplaceParameterVisitor(oldParameter, newParameter).Visit(expression);
        }

        protected override Expression VisitParameter(ParameterExpression node)
        {
            return node == _oldParameter ? _newParameter : base.VisitParameter(node);
        }
    }

    private static Func<IQueryable<Patient>, IOrderedQueryable<Patient>>? BuildOrderBy(GetPatientsQuery request)
    {
        if (string.IsNullOrWhiteSpace(request.SortBy))
        {
            // Default sorting by last name, then first name
            return query => query.OrderBy(p => p.LastName).ThenBy(p => p.FirstName);
        }

        return request.SortBy.ToLowerInvariant() switch
        {
            "firstname" => request.SortDescending 
                ? query => query.OrderByDescending(p => p.FirstName)
                : query => query.OrderBy(p => p.FirstName),
            "lastname" => request.SortDescending 
                ? query => query.OrderByDescending(p => p.LastName)
                : query => query.OrderBy(p => p.LastName),
            "dateofbirth" => request.SortDescending 
                ? query => query.OrderByDescending(p => p.DateOfBirth)
                : query => query.OrderBy(p => p.DateOfBirth),
            "createdat" => request.SortDescending 
                ? query => query.OrderByDescending(p => p.CreatedAt)
                : query => query.OrderBy(p => p.CreatedAt),
            "status" => request.SortDescending 
                ? query => query.OrderByDescending(p => p.Status)
                : query => query.OrderBy(p => p.Status),
            _ => query => query.OrderBy(p => p.LastName).ThenBy(p => p.FirstName)
        };
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
            FullName = patient.FullName,
            DisplayName = patient.DisplayName,
            Title = patient.Title,
            DateOfBirth = patient.DateOfBirth,
            Age = patient.Age,
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