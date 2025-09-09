using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMR.Core.Entities;

[Table("users")]
public class User : BaseEntity
{
    [Key]
    public long Id { get; set; }

    // Uuid inherited from BaseEntity

    // Authentication (handled by Auth Service)
    [Required]
    [StringLength(100)]
    public string AuthServiceUserId { get; set; } = string.Empty;

    // Personal Information
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [StringLength(100)]
    public string? MiddleName { get; set; }

    [Required]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Phone { get; set; }

    // Professional Information
    [Required]
    [StringLength(50)]
    public string UserType { get; set; } = string.Empty; // Staff, Admin

    [StringLength(50)]
    public string? Role { get; set; } // Physician, Nurse, etc.

    [StringLength(100)]
    public string? Title { get; set; } // Dr., RN, PA, etc.

    [StringLength(100)]
    public string? Department { get; set; }

    [StringLength(100)]
    public string? Specialty { get; set; }

    [StringLength(50)]
    public string? LicenseNumber { get; set; }

    [StringLength(50)]
    public string? NpiNumber { get; set; }

    [StringLength(50)]
    public string? DeaNumber { get; set; }

    // Settings
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "active"; // active, inactive, suspended

    [StringLength(10)]
    public string? PreferredLanguage { get; set; } = "en";

    [StringLength(50)]
    public string? TimeZone { get; set; } = "UTC";

    // Navigation Properties
    public virtual ICollection<Patient> PrimaryPatients { get; set; } = [];
    public virtual ICollection<Appointment> Appointments { get; set; } = [];
    public virtual ICollection<Encounter> Encounters { get; set; } = [];
    public virtual ICollection<Prescription> Prescriptions { get; set; } = [];

    // Computed Properties
    [NotMapped]
    public string FullName => $"{FirstName} {MiddleName} {LastName}".Replace("  ", " ").Trim();

    [NotMapped]
    public string DisplayName => !string.IsNullOrEmpty(Title) 
        ? $"{Title} {FirstName} {LastName}" 
        : $"{FirstName} {LastName}";

    [NotMapped]
    public string ProfessionalName => $"{DisplayName}{(!string.IsNullOrEmpty(Department) ? $", {Department}" : "")}";
}