using Microsoft.EntityFrameworkCore;
using EMR.Core.Entities;
using EMR.Core.Interfaces;
using EMR.Infrastructure.Data;

namespace EMR.Infrastructure.Repositories;

public class AppointmentRepository : Repository<Appointment>, IAppointmentRepository
{
    public AppointmentRepository(EmrDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Appointment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => !a.IsDeleted)
            .Include(a => a.Patient)
            .Include(a => a.Provider)
            .Where(a => a.StartDateTime.Date >= startDate.Date && a.StartDateTime.Date <= endDate.Date)
            .OrderBy(a => a.StartDateTime)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Appointment>> GetByPatientIdAsync(long patientId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => !a.IsDeleted)
            .Include(a => a.Provider)
            .Where(a => a.PatientId == patientId)
            .OrderByDescending(a => a.StartDateTime)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Appointment>> GetByProviderIdAsync(long providerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => !a.IsDeleted)
            .Include(a => a.Patient)
            .Where(a => a.ProviderId == providerId)
            .OrderBy(a => a.StartDateTime)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Appointment>> GetUpcomingAsync(int days = 7, CancellationToken cancellationToken = default)
    {
        var endDate = DateTime.UtcNow.AddDays(days);
        
        return await _dbSet
            .Where(a => !a.IsDeleted)
            .Include(a => a.Patient)
            .Include(a => a.Provider)
            .Where(a => a.StartDateTime >= DateTime.UtcNow && a.StartDateTime <= endDate)
            .Where(a => a.Status != "Cancelled")
            .OrderBy(a => a.StartDateTime)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Appointment>> CheckConflictsAsync(long providerId, DateTime startTime, DateTime endTime, long? excludeAppointmentId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Where(a => !a.IsDeleted)
            .Include(a => a.Patient)
            .Include(a => a.Provider)
            .Where(a => a.ProviderId == providerId)
            .Where(a => a.Status != "Cancelled")
            .Where(a => 
                (a.StartDateTime < endTime && a.EndDateTime > startTime) // Overlapping appointments
            );

        if (excludeAppointmentId.HasValue)
        {
            query = query.Where(a => a.Id != excludeAppointmentId.Value);
        }

        return await query.ToListAsync(cancellationToken);
    }
}