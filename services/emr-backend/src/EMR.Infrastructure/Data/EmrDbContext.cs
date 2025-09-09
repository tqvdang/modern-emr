using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using EMR.Core.Entities;

namespace EMR.Infrastructure.Data;

public class EmrDbContext : DbContext
{
    private IDbContextTransaction? _currentTransaction;
    
    public EmrDbContext(DbContextOptions<EmrDbContext> options) : base(options)
    {
    }

    public bool HasActiveTransaction => _currentTransaction != null;

    // Core Entities
    public DbSet<Patient> Patients { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Appointment> Appointments { get; set; } = null!;
    public DbSet<Encounter> Encounters { get; set; } = null!;
    public DbSet<Facility> Facilities { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    // Additional entities will be added as we migrate them
    public DbSet<PatientAllergy> PatientAllergies { get; set; } = null!;
    public DbSet<PatientMedication> PatientMedications { get; set; } = null!;
    public DbSet<PatientProblem> PatientProblems { get; set; } = null!;
    public DbSet<VitalSign> VitalSigns { get; set; } = null!;
    public DbSet<LabResult> LabResults { get; set; } = null!;
    public DbSet<Document> Documents { get; set; } = null!;
    public DbSet<Prescription> Prescriptions { get; set; } = null!;

    // PT-specific entities
    public DbSet<PTEvaluation> PTEvaluations { get; set; } = null!;
    public DbSet<PTSession> PTSessions { get; set; } = null!;
    public DbSet<PTTreatmentPlan> PTTreatmentPlans { get; set; } = null!;
    public DbSet<RangeOfMotionTest> RangeOfMotionTests { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships and constraints
        ConfigurePatientRelationships(modelBuilder);
        ConfigureUserRelationships(modelBuilder);
        ConfigureAppointmentRelationships(modelBuilder);

        // Configure indexes for performance
        ConfigureIndexes(modelBuilder);

        // Configure audit fields
        ConfigureAuditFields(modelBuilder);
    }

    private static void ConfigurePatientRelationships(ModelBuilder modelBuilder)
    {
        // Patient -> PrimaryProvider relationship
        modelBuilder.Entity<Patient>()
            .HasOne(p => p.PrimaryProvider)
            .WithMany(u => u.PrimaryPatients)
            .HasForeignKey(p => p.PrimaryProviderId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureUserRelationships(ModelBuilder modelBuilder)
    {
        // User -> Appointments relationship
        modelBuilder.Entity<User>()
            .HasMany(u => u.Appointments)
            .WithOne(a => a.Provider)
            .HasForeignKey(a => a.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureAppointmentRelationships(ModelBuilder modelBuilder)
    {
        // Appointment -> Patient relationship
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Patient)
            .WithMany(p => p.Appointments)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        // Appointment -> Provider relationship is already configured in ConfigureUserRelationships
    }

    private static void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        // Patient indexes
        modelBuilder.Entity<Patient>()
            .HasIndex(p => p.Email)
            .IsUnique()
            .HasFilter("\"Email\" IS NOT NULL AND \"IsDeleted\" = false");

        modelBuilder.Entity<Patient>()
            .HasIndex(p => p.Uuid)
            .IsUnique();

        modelBuilder.Entity<Patient>()
            .HasIndex(p => new { p.LastName, p.FirstName });

        // User indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Uuid)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.AuthServiceUserId)
            .IsUnique();

        // Appointment indexes
        modelBuilder.Entity<Appointment>()
            .HasIndex(a => a.StartDateTime);

        modelBuilder.Entity<Appointment>()
            .HasIndex(a => a.PatientId);

        modelBuilder.Entity<Appointment>()
            .HasIndex(a => a.ProviderId);
    }

    private static void ConfigureAuditFields(ModelBuilder modelBuilder)
    {
        // Configure audit fields for all entities inheriting from BaseEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property("CreatedAt")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                modelBuilder.Entity(entityType.ClrType)
                    .Property("IsDeleted")
                    .HasDefaultValue(false);

                // Add index on IsDeleted for soft delete queries
                modelBuilder.Entity(entityType.ClrType)
                    .HasIndex("IsDeleted");
            }
        }
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_currentTransaction != null)
        {
            return;
        }

        _currentTransaction = await Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await SaveChangesAsync(cancellationToken);
            await (_currentTransaction?.CommitAsync(cancellationToken) ?? Task.CompletedTask);
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_currentTransaction != null)
            {
                _currentTransaction.Dispose();
                _currentTransaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await (_currentTransaction?.RollbackAsync(cancellationToken) ?? Task.CompletedTask);
        }
        finally
        {
            if (_currentTransaction != null)
            {
                _currentTransaction.Dispose();
                _currentTransaction = null;
            }
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Automatically update audit fields
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    if (entry.Entity.Uuid == Guid.Empty)
                        entry.Entity.Uuid = Guid.NewGuid();
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}