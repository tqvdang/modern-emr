using Microsoft.EntityFrameworkCore;
using EMR.Core.Entities;
using EMR.Core.Interfaces;
using EMR.Infrastructure.Data;

namespace EMR.Infrastructure.Repositories;

public class PatientRepository : Repository<Patient>, IPatientRepository
{
    public PatientRepository(EmrDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Patient>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return await GetAllAsync(cancellationToken);

        var term = searchTerm.Trim().ToLower();
        
        return await _dbSet
            .Where(p => !p.IsDeleted)
            .Where(p => 
                p.FirstName.ToLower().Contains(term) ||
                p.LastName.ToLower().Contains(term) ||
                p.Email != null && p.Email.ToLower().Contains(term) ||
                p.PhoneMobile != null && p.PhoneMobile.Contains(term) ||
                p.PhoneHome != null && p.PhoneHome.Contains(term) ||
                (p.FirstName + " " + p.LastName).ToLower().Contains(term))
            .OrderBy(p => p.LastName)
            .ThenBy(p => p.FirstName)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Patient?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        return await _dbSet
            .Where(p => !p.IsDeleted)
            .FirstOrDefaultAsync(p => p.Email != null && p.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<Patient?> GetWithMedicalHistoryAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => !p.IsDeleted)
            .Include(p => p.Appointments)
                .ThenInclude(a => a.Provider)
            .Include(p => p.Encounters)
                .ThenInclude(e => e.Provider)
            .Include(p => p.Allergies)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Patient>> GetActiveRecentPatientsAsync(int count, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => !p.IsDeleted && p.Status == "Active")
            .OrderByDescending(p => p.UpdatedAt)
            .Take(count)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}