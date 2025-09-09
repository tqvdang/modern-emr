using Microsoft.EntityFrameworkCore;
using EMR.Core.Entities;
using EMR.Core.Interfaces;
using EMR.Infrastructure.Data;

namespace EMR.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(EmrDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        return await _dbSet
            .Where(u => !u.IsDeleted)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<User?> GetByAuthServiceUserIdAsync(string authServiceUserId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(authServiceUserId))
            return null;

        return await _dbSet
            .Where(u => !u.IsDeleted)
            .FirstOrDefaultAsync(u => u.AuthServiceUserId == authServiceUserId, cancellationToken);
    }

    public async Task<IEnumerable<User>> GetByTypeAsync(string userType, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(u => !u.IsDeleted)
            .Where(u => u.UserType == userType)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<User>> GetProvidersAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(u => !u.IsDeleted)
            .Where(u => u.UserType == "Provider" || u.UserType == "Doctor")
            .Where(u => u.Status == "Active")
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}