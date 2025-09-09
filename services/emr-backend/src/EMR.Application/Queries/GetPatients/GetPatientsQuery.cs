using MediatR;
using EMR.Application.Common;
using EMR.Application.DTOs;

namespace EMR.Application.Queries.GetPatients;

public record GetPatientsQuery : IRequest<ServiceResult<IReadOnlyList<PatientDto>>>
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