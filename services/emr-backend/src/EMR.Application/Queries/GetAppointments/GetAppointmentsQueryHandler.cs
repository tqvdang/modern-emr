using MediatR;
using AutoMapper;
using EMR.Application.Common;
using EMR.Application.DTOs;
using EMR.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace EMR.Application.Queries.GetAppointments;

public class GetAppointmentsQueryHandler : IRequestHandler<GetAppointmentsQuery, ServiceResult<IEnumerable<AppointmentDto>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<GetAppointmentsQueryHandler> _logger;

    public GetAppointmentsQueryHandler(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<GetAppointmentsQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<ServiceResult<IEnumerable<AppointmentDto>>> Handle(GetAppointmentsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Retrieving appointments with filters - PatientId: {PatientId}, ProviderId: {ProviderId}, Status: {Status}",
                request.PatientId, request.ProviderId, request.Status);

            var appointments = await _unitOfWork.Appointments.GetAllAsync(cancellationToken);

            // Apply filters
            if (request.PatientId.HasValue)
            {
                var patientAppointments = await _unitOfWork.Appointments.GetByPatientIdAsync(request.PatientId.Value, cancellationToken);
                appointments = patientAppointments.ToList();
            }
            else if (request.ProviderId.HasValue)
            {
                var providerAppointments = await _unitOfWork.Appointments.GetByProviderIdAsync(request.ProviderId.Value, cancellationToken);
                appointments = providerAppointments.ToList();
            }
            else if (request.StartDate.HasValue && request.EndDate.HasValue)
            {
                var dateRangeAppointments = await _unitOfWork.Appointments.GetByDateRangeAsync(request.StartDate.Value, request.EndDate.Value, cancellationToken);
                appointments = dateRangeAppointments.ToList();
            }

            // Apply status filter
            if (!string.IsNullOrEmpty(request.Status))
            {
                appointments = appointments.Where(a => a.Status.Equals(request.Status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Apply pagination
            var pagedAppointments = appointments
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            var appointmentDtos = _mapper.Map<IEnumerable<AppointmentDto>>(pagedAppointments);

            _logger.LogInformation("Retrieved {Count} appointments", appointmentDtos.Count());

            return ServiceResult<IEnumerable<AppointmentDto>>.Success(appointmentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving appointments");
            return ServiceResult<IEnumerable<AppointmentDto>>.Error("An error occurred while retrieving appointments");
        }
    }
}