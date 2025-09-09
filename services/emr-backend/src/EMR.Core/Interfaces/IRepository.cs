using System.Linq.Expressions;
using EMR.Core.Entities;

namespace EMR.Core.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<T?> GetByGuidAsync(Guid guid, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetAsync(Expression<Func<T, bool>>? predicate = null, 
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, 
        string includeString = "", 
        bool disableTracking = true,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetAsync(Expression<Func<T, bool>>? predicate = null, 
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, 
        List<Expression<Func<T, object>>>? includes = null, 
        bool disableTracking = true,
        CancellationToken cancellationToken = default);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    void Update(T entity);
    void UpdateRange(IEnumerable<T> entities);
    void Delete(T entity);
    void DeleteRange(IEnumerable<T> entities);
}

public interface IPatientRepository : IRepository<Patient>
{
    Task<Patient?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IEnumerable<Patient>> SearchAsync(string searchTerm, CancellationToken cancellationToken = default);
    Task<Patient?> GetWithMedicalHistoryAsync(long id, CancellationToken cancellationToken = default);
}

public interface IAppointmentRepository : IRepository<Appointment>
{
    Task<IEnumerable<Appointment>> GetByPatientIdAsync(long patientId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Appointment>> GetByProviderIdAsync(long providerId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Appointment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IEnumerable<Appointment>> CheckConflictsAsync(long providerId, DateTime startTime, DateTime endTime, long? excludeAppointmentId = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<Appointment>> GetUpcomingAsync(int days = 7, CancellationToken cancellationToken = default);
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByAuthServiceUserIdAsync(string authServiceUserId, CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetProvidersAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetByTypeAsync(string userType, CancellationToken cancellationToken = default);
}

public interface IEncounterRepository : IRepository<Encounter>
{
    Task<IEnumerable<Encounter>> GetByPatientIdAsync(long patientId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Encounter>> GetByProviderIdAsync(long providerId, CancellationToken cancellationToken = default);
    Task<Encounter?> GetByAppointmentIdAsync(long appointmentId, CancellationToken cancellationToken = default);
}

public interface IFacilityRepository : IRepository<Facility>
{
    Task<IEnumerable<Facility>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<Facility?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}

public interface IUnitOfWork : IDisposable
{
    IPatientRepository Patients { get; }
    IAppointmentRepository Appointments { get; }
    IUserRepository Users { get; }
    IEncounterRepository Encounters { get; }
    IFacilityRepository Facilities { get; }
    IRepository<T> Repository<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}