using Microsoft.EntityFrameworkCore;
using EMR.Core.Entities;
using EMR.Core.Interfaces;
using EMR.Infrastructure.Data;

namespace EMR.Infrastructure.Repositories;

public class FacilityRepository : Repository<Facility>, IFacilityRepository
{
    public FacilityRepository(EmrDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Facility>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(f => !f.IsDeleted && f.Status == "active")
            .OrderBy(f => f.Name)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Facility?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(f => f.Name == name && !f.IsDeleted, cancellationToken);
    }
}