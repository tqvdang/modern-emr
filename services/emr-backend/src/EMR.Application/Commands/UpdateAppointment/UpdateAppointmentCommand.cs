using MediatR;
using EMR.Application.Common;
using EMR.Application.DTOs;

namespace EMR.Application.Commands.UpdateAppointment;

public record UpdateAppointmentCommand : IRequest<ServiceResult<AppointmentDto>>
{
    public long Id { get; init; }
    public DateTime? StartDateTime { get; init; }
    public DateTime? EndDateTime { get; init; }
    public string? AppointmentType { get; init; }
    public string? Priority { get; init; }
    public string? Status { get; init; }
    public string? Description { get; init; }
    public string? Title { get; init; }
    public string? ChiefComplaint { get; init; }
    public string? Notes { get; init; }
}