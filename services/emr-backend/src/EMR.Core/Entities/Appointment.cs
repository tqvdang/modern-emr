using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMR.Core.Entities;

[Table("appointments")]
public class Appointment : BaseEntity
{
    [Key]
    public long Id { get; set; }

    // Uuid inherited from BaseEntity

    [Required]
    public long PatientId { get; set; }

    [Required]
    public long ProviderId { get; set; }

    public long? FacilityId { get; set; }

    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }

    [Required]
    [StringLength(50)]
    public string Status { get; set; } = "scheduled"; // scheduled, confirmed, checked-in, in-progress, completed, cancelled, no-show

    [Required]
    [StringLength(100)]
    public string AppointmentType { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Priority { get; set; } = "normal"; // low, normal, high, urgent

    [StringLength(200)]
    public string? Title { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(500)]
    public string? ChiefComplaint { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [StringLength(100)]
    public string? ConfirmationNumber { get; set; }

    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CheckedInAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation Properties
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;

    [ForeignKey("ProviderId")]
    public virtual User Provider { get; set; } = null!;

    [ForeignKey("FacilityId")]
    public virtual Facility? Facility { get; set; }

    public virtual ICollection<Encounter> Encounters { get; set; } = [];

    // Computed Properties
    [NotMapped]
    public TimeSpan Duration => EndDateTime - StartDateTime;

    [NotMapped]
    public string StatusDisplayName => Status switch
    {
        "scheduled" => "Scheduled",
        "confirmed" => "Confirmed",
        "checked-in" => "Checked In",
        "in-progress" => "In Progress",
        "completed" => "Completed",
        "cancelled" => "Cancelled",
        "no-show" => "No Show",
        _ => Status
    };
}