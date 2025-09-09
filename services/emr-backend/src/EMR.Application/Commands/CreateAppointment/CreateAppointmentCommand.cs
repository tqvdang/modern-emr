using MediatR;
using EMR.Application.Common;
using EMR.Application.DTOs;

namespace EMR.Application.Commands.CreateAppointment;

public record CreateAppointmentCommand : IRequest<ServiceResult<AppointmentDto>>
{
    public long PatientId { get; init; }
    public long ProviderId { get; init; }
    public DateTime StartDateTime { get; init; }
    public DateTime EndDateTime { get; init; }
    public string AppointmentType { get; init; } = string.Empty;
    public string Priority { get; init; } = "Normal";
    public string? Description { get; init; }
    public string? Title { get; init; }
}