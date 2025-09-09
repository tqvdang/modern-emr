using MediatR;
using AutoMapper;
using EMR.Application.Common;
using EMR.Application.DTOs;
using EMR.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace EMR.Application.Commands.UpdateAppointment;

public class UpdateAppointmentCommandHandler : IRequestHandler<UpdateAppointmentCommand, ServiceResult<AppointmentDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<UpdateAppointmentCommandHandler> _logger;

    public UpdateAppointmentCommandHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<UpdateAppointmentCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ServiceResult<AppointmentDto>> Handle(UpdateAppointmentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Updating appointment with ID {AppointmentId}", request.Id);

            var appointment = await _unitOfWork.Appointments.GetByIdAsync(request.Id, cancellationToken);
            if (appointment == null)
            {
                return ServiceResult<AppointmentDto>.NotFound("Appointment not found");
            }

            // If updating time, check for conflicts
            if (request.StartDateTime.HasValue && request.EndDateTime.HasValue)
            {
                var conflicts = await _unitOfWork.Appointments.CheckConflictsAsync(
                    appointment.ProviderId, request.StartDateTime.Value, request.EndDateTime.Value, request.Id, cancellationToken);

                if (conflicts.Any())
                {
                    return ServiceResult<AppointmentDto>.Conflict("Provider has a scheduling conflict at the requested time");
                }

                // Validate appointment time is in the future (unless it's already in progress/completed)
                if (request.StartDateTime <= DateTime.UtcNow && appointment.Status == "scheduled")
                {
                    return ServiceResult<AppointmentDto>.BadRequest("Appointment must be scheduled for a future time");
                }

                // Validate end time is after start time
                if (request.EndDateTime <= request.StartDateTime)
                {
                    return ServiceResult<AppointmentDto>.BadRequest("End time must be after start time");
                }

                appointment.StartDateTime = request.StartDateTime.Value;
                appointment.EndDateTime = request.EndDateTime.Value;
            }

            // Update other fields if provided
            if (!string.IsNullOrEmpty(request.AppointmentType))
                appointment.AppointmentType = request.AppointmentType;

            if (!string.IsNullOrEmpty(request.Priority))
                appointment.Priority = request.Priority.ToLowerInvariant();

            if (!string.IsNullOrEmpty(request.Status))
            {
                appointment.Status = request.Status.ToLowerInvariant();
                
                // Set completion time if status is completed
                if (appointment.Status == "completed" && appointment.CompletedAt == null)
                    appointment.CompletedAt = DateTime.UtcNow;
                    
                // Set check-in time if status is checked-in
                if (appointment.Status == "checked-in" && appointment.CheckedInAt == null)
                    appointment.CheckedInAt = DateTime.UtcNow;
                    
                // Set confirmation time if status is confirmed
                if (appointment.Status == "confirmed" && appointment.ConfirmedAt == null)
                    appointment.ConfirmedAt = DateTime.UtcNow;
            }

            if (request.Description != null)
                appointment.Description = request.Description;

            if (request.Title != null)
                appointment.Title = request.Title;

            if (request.ChiefComplaint != null)
                appointment.ChiefComplaint = request.ChiefComplaint;

            if (request.Notes != null)
                appointment.Notes = request.Notes;

            // UpdateAsync may not exist, so we'll just rely on SaveChangesAsync to update the modified entity
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Appointment {AppointmentId} updated successfully", appointment.Id);

            var appointmentDto = _mapper.Map<AppointmentDto>(appointment);
            return ServiceResult<AppointmentDto>.Success(appointmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating appointment {AppointmentId}", request.Id);
            return ServiceResult<AppointmentDto>.Error("An error occurred while updating the appointment");
        }
    }
}