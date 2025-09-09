using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMR.Core.Entities;

[Table("patient_allergies")]
public class PatientAllergy : BaseEntity
{
    [Key]
    public long Id { get; set; }

    [Required]
    public long PatientId { get; set; }

    [Required]
    [StringLength(200)]
    public string AllergyName { get; set; } = string.Empty;

    [StringLength(100)]
    public string? AllergyType { get; set; }

    [StringLength(100)]
    public string? Severity { get; set; }

    [StringLength(500)]
    public string? Reaction { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "active";

    // Navigation Properties
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
}