using Microsoft.EntityFrameworkCore;
using EMR.Core.Entities;
using EMR.Core.Interfaces;
using EMR.Infrastructure.Data;

namespace EMR.Infrastructure.Repositories;

public class EncounterRepository : Repository<Encounter>, IEncounterRepository
{
    public EncounterRepository(EmrDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Encounter>> GetByPatientIdAsync(long patientId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => !e.IsDeleted)
            .Include(e => e.Provider)
            .Where(e => e.PatientId == patientId)
            .OrderByDescending(e => e.EncounterDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Encounter?> GetByAppointmentIdAsync(long appointmentId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => !e.IsDeleted)
            .Include(e => e.Provider)
            .Include(e => e.Patient)
            .FirstOrDefaultAsync(e => e.AppointmentId == appointmentId, cancellationToken);
    }

    public async Task<IEnumerable<Encounter>> GetByProviderIdAsync(long providerId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(e => !e.IsDeleted)
            .Include(e => e.Patient)
            .Where(e => e.ProviderId == providerId)
            .OrderByDescending(e => e.EncounterDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}