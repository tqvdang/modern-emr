using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMR.Core.Entities;

// Placeholder entities - will be properly implemented later

[Table("patient_medications")]
public class PatientMedication : BaseEntity
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    public long PatientId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string MedicationName { get; set; } = string.Empty;
    
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
}

[Table("patient_problems")]
public class PatientProblem : BaseEntity
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    public long PatientId { get; set; }
    
    [Required]
    [StringLength(500)]
    public string ProblemDescription { get; set; } = string.Empty;
    
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
}

[Table("vital_signs")]
public class VitalSign : BaseEntity
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    public long PatientId { get; set; }
    
    [Required]
    public DateTime RecordedAt { get; set; }
    
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
}

[Table("lab_results")]
public class LabResult : BaseEntity
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    public long PatientId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string TestName { get; set; } = string.Empty;
    
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
}

[Table("documents")]
public class Document : BaseEntity
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    public long PatientId { get; set; }
    
    [Required]
    [StringLength(500)]
    public string FileName { get; set; } = string.Empty;
    
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
}

[Table("prescriptions")]
public class Prescription : BaseEntity
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    public long PatientId { get; set; }
    
    [Required]
    public long ProviderId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string MedicationName { get; set; } = string.Empty;
    
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
    
    [ForeignKey("ProviderId")]
    public virtual User Provider { get; set; } = null!;
}

// PT-specific placeholder entities

[Table("pt_evaluations")]
public class PTEvaluation : BaseEntity
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    public long PatientId { get; set; }
    
    [Required]
    public DateTime EvaluationDate { get; set; }
    
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
}

[Table("pt_sessions")]
public class PTSession : BaseEntity
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    public long PatientId { get; set; }
    
    [Required]
    public DateTime SessionDate { get; set; }
    
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
}

[Table("pt_treatment_plans")]
public class PTTreatmentPlan : BaseEntity
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    public long PatientId { get; set; }
    
    [Required]
    public DateTime CreatedDate { get; set; }
    
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
}

[Table("range_of_motion_tests")]
public class RangeOfMotionTest : BaseEntity
{
    [Key]
    public long Id { get; set; }
    
    [Required]
    public long PatientId { get; set; }
    
    [Required]
    public DateTime TestDate { get; set; }
    
    [ForeignKey("PatientId")]
    public virtual Patient Patient { get; set; } = null!;
}