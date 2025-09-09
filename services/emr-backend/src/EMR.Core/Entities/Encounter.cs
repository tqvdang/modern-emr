using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMR.Core.Entities;

[Table("encounters")]
public class Encounter : BaseEntity
{
    [Key]
    public long Id { get; set; }

    // Uuid inherited from BaseEntity

    [Required]
    public long PatientId { get; set; }

    [Required]  
    public long ProviderId { get; set; }

    public long? FacilityId { get; set; }
    public long? AppointmentId { get; set; }

    [Required]
    public DateTime EncounterDate { get; set; }

    [Required]
    [StringLength(100)]
    public string EncounterType { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "in-progress";

    [StringLength(500)]
    public string? ChiefComplaint { get; set; }

    [StringLength(2000)]
    public string EncounterSummary { get; set; } = string.Empty;

    // SOAP Notes
    public string? SubjectiveNotes { get; set; }
    public string? ObjectiveNotes { get; set; }
    public string? AssessmentNotes { get; set; }
    public string? PlanNotes { get; set; }

    // Navigation Properties
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;

    [ForeignKey("ProviderId")]
    public virtual User Provider { get; set; } = null!;

    [ForeignKey("FacilityId")]
    public virtual Facility? Facility { get; set; }

    [ForeignKey("AppointmentId")]
    public virtual Appointment? Appointment { get; set; }
}