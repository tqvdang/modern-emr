using MediatR;
using AutoMapper;
using EMR.Application.Common;
using EMR.Application.DTOs;
using EMR.Core.Entities;
using EMR.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace EMR.Application.Commands.CreateAppointment;

public class CreateAppointmentCommandHandler : IRequestHandler<CreateAppointmentCommand, ServiceResult<AppointmentDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<CreateAppointmentCommandHandler> _logger;

    public CreateAppointmentCommandHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<CreateAppointmentCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ServiceResult<AppointmentDto>> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Creating appointment for patient {PatientId} with provider {ProviderId}", 
                request.PatientId, request.ProviderId);

            // Validate patient exists
            var patient = await _unitOfWork.Patients.GetByIdAsync(request.PatientId, cancellationToken);
            if (patient == null)
            {
                return ServiceResult<AppointmentDto>.NotFound("Patient not found");
            }

            // Validate provider exists
            var provider = await _unitOfWork.Users.GetByIdAsync(request.ProviderId, cancellationToken);
            if (provider == null)
            {
                return ServiceResult<AppointmentDto>.NotFound("Provider not found");
            }

            // Check for scheduling conflicts
            var conflicts = await _unitOfWork.Appointments.CheckConflictsAsync(
                request.ProviderId, request.StartDateTime, request.EndDateTime, null, cancellationToken);

            if (conflicts.Any())
            {
                return ServiceResult<AppointmentDto>.Conflict("Provider has a scheduling conflict at the requested time");
            }

            // Validate appointment time is in the future
            if (request.StartDateTime <= DateTime.UtcNow)
            {
                return ServiceResult<AppointmentDto>.BadRequest("Appointment must be scheduled for a future time");
            }

            // Validate end time is after start time
            if (request.EndDateTime <= request.StartDateTime)
            {
                return ServiceResult<AppointmentDto>.BadRequest("End time must be after start time");
            }

            var appointment = new Appointment
            {
                PatientId = request.PatientId,
                ProviderId = request.ProviderId,
                StartDateTime = request.StartDateTime,
                EndDateTime = request.EndDateTime,
                AppointmentType = request.AppointmentType,
                Priority = request.Priority.ToLowerInvariant(),
                Description = request.Description,
                Title = request.Title,
                Status = "scheduled"
            };

            await _unitOfWork.Appointments.AddAsync(appointment, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Appointment created successfully with ID {AppointmentId}", appointment.Id);

            var appointmentDto = _mapper.Map<AppointmentDto>(appointment);
            return ServiceResult<AppointmentDto>.Success(appointmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating appointment for patient {PatientId}", request.PatientId);
            return ServiceResult<AppointmentDto>.Error("An error occurred while creating the appointment");
        }
    }
}