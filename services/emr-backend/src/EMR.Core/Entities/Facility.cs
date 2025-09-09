using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMR.Core.Entities;

[Table("facilities")]
public class Facility : BaseEntity
{
    [Key]
    public long Id { get; set; }

    // Uuid inherited from BaseEntity

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(50)]
    public string? Code { get; set; }

    [StringLength(100)]
    public string? Type { get; set; }

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
    public string? Phone { get; set; }

    [StringLength(100)]
    public string? Email { get; set; }

    [Required]
    [StringLength(20)]
    public string Status { get; set; } = "active";

    // Navigation Properties
    public virtual ICollection<Appointment> Appointments { get; set; } = [];
    public virtual ICollection<Encounter> Encounters { get; set; } = [];
}