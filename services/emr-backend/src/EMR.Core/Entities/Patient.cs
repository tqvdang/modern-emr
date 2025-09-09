using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMR.Core.Entities;

[Table("patients")]
public class Patient : BaseEntity
{
    [Key]
    public long Id { get; set; }

    // Uuid inherited from BaseEntity

    // Personal Information
    [StringLength(10)]
    public string? Title { get; set; } // Mr, Mrs, Dr, etc

    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [StringLength(100)]
    public string? MiddleName { get; set; }

    [Column(TypeName = "date")]
    public DateTime? DateOfBirth { get; set; }

    [Required]
    [StringLength(10)]
    public string Gender { get; set; } = string.Empty; // M, F, Other

    [StringLength(50)]
    public string? SocialSecurityNumber { get; set; }

    [StringLength(50)]
    public string? DriversLicense { get; set; }

    // Contact Information
    [StringLength(200)]
    public string? Street { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(50)]
    public string? State { get; set; }

    [StringLength(20)]
    public string? PostalCode { get; set; }

    [StringLength(10)]
    public string? CountryCode { get; set; } = "US";

    [StringLength(20)]
    public string? PhoneHome { get; set; }

    [StringLength(20)]
    public string? PhoneMobile { get; set; }

    [StringLength(20)]
    public string? PhoneWork { get; set; }

    [StringLength(100)]
    public string? Email { get; set; }

    // Demographics
    [StringLength(100)]
    public string? Race { get; set; }

    [StringLength(100)]
    public string? Ethnicity { get; set; }

    [StringLength(50)]
    public string? Language { get; set; } = "en";

    [StringLength(100)]
    public string? Religion { get; set; }

    [StringLength(100)]
    public string? MaritalStatus { get; set; }

    // Medical Information
    [StringLength(200)]
    public string? Occupation { get; set; }

    public long? PrimaryProviderId { get; set; }

    public int? PharmacyId { get; set; }

    // Status
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "active"; // active, inactive, deceased

    // Emergency Contact
    [StringLength(100)]
    public string? EmergencyContactName { get; set; }

    [StringLength(50)]
    public string? EmergencyContactRelationship { get; set; }

    [StringLength(20)]
    public string? EmergencyContactPhone { get; set; }

    // Insurance & Financial
    [StringLength(100)]
    public string? InsuranceId { get; set; }

    [StringLength(50)]
    public string? PublicPatientId { get; set; }

    // HIPAA Preferences
    public bool HipaaMailAllowed { get; set; } = true;
    public bool HipaaVoiceAllowed { get; set; } = true;
    public bool HipaaSmsAllowed { get; set; } = false;
    public bool HipaaEmailAllowed { get; set; } = false;

    // Navigation Properties
    [ForeignKey("PrimaryProviderId")]
    public virtual User? PrimaryProvider { get; set; }

    public virtual ICollection<Encounter> Encounters { get; set; } = [];
    public virtual ICollection<Appointment> Appointments { get; set; } = [];
    public virtual ICollection<PatientAllergy> Allergies { get; set; } = [];
    public virtual ICollection<PatientMedication> Medications { get; set; } = [];
    public virtual ICollection<PatientProblem> Problems { get; set; } = [];
    public virtual ICollection<VitalSign> VitalSigns { get; set; } = [];
    public virtual ICollection<LabResult> LabResults { get; set; } = [];
    public virtual ICollection<Document> Documents { get; set; } = [];

    // PT-specific Navigation Properties
    public virtual ICollection<PTEvaluation> PTEvaluations { get; set; } = [];
    public virtual ICollection<PTSession> PTSessions { get; set; } = [];
    public virtual ICollection<PTTreatmentPlan> PTTreatmentPlans { get; set; } = [];
    public virtual ICollection<RangeOfMotionTest> ROMTests { get; set; } = [];

    // Computed Properties
    [NotMapped]
    public string FullName => $"{FirstName} {MiddleName} {LastName}".Replace("  ", " ").Trim();

    [NotMapped]
    public int? Age
    {
        get
        {
            if (!DateOfBirth.HasValue) return null;
            var today = DateTime.Today;
            var age = today.Year - DateOfBirth.Value.Year;
            if (DateOfBirth.Value.Date > today.AddYears(-age)) age--;
            return age;
        }
    }

    [NotMapped]
    public string DisplayName => $"{LastName}, {FirstName} {(!string.IsNullOrEmpty(MiddleName) ? MiddleName[0] + "." : "")}".Trim();
}