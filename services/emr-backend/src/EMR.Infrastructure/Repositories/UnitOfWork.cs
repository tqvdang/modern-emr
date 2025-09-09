using EMR.Core.Interfaces;
using EMR.Infrastructure.Data;

namespace EMR.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly EmrDbContext _context;
    private readonly Dictionary<Type, object> _repositories = new();

    public UnitOfWork(EmrDbContext context)
    {
        _context = context;
    }

    public IPatientRepository Patients => 
        (IPatientRepository)GetRepository<IPatientRepository>(() => new PatientRepository(_context));

    public IAppointmentRepository Appointments => 
        (IAppointmentRepository)GetRepository<IAppointmentRepository>(() => new AppointmentRepository(_context));

    public IUserRepository Users => 
        (IUserRepository)GetRepository<IUserRepository>(() => new UserRepository(_context));

    public IEncounterRepository Encounters => 
        (IEncounterRepository)GetRepository<IEncounterRepository>(() => new EncounterRepository(_context));
    
    public IFacilityRepository Facilities => 
        (IFacilityRepository)GetRepository<IFacilityRepository>(() => new FacilityRepository(_context));

    public IRepository<T> Repository<T>() where T : class
    {
        return (IRepository<T>)GetRepository<IRepository<T>>(() => new Repository<T>(_context));
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        await _context.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        await _context.CommitTransactionAsync(cancellationToken);
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        await _context.RollbackTransactionAsync(cancellationToken);
    }

    private object GetRepository<TInterface>(Func<object> factory)
    {
        var type = typeof(TInterface);
        if (!_repositories.ContainsKey(type))
        {
            _repositories[type] = factory();
        }
        return _repositories[type];
    }

    public void Dispose()
    {
        _context?.Dispose();
    }
}