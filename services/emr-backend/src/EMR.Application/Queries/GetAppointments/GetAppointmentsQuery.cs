using MediatR;
using EMR.Application.Common;
using EMR.Application.DTOs;

namespace EMR.Application.Queries.GetAppointments;

public class GetAppointmentsQuery : IRequest<ServiceResult<IEnumerable<AppointmentDto>>>
{
    public long? PatientId { get; set; }
    public long? ProviderId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}