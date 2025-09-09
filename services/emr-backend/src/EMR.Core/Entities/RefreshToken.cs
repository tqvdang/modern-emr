using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EMR.Core.Entities;

[Table("refresh_tokens")]
public class RefreshToken
{
    [Key]
    public long Id { get; set; }

    [Required]
    [StringLength(500)]
    public string Token { get; set; } = string.Empty;

    [Required]
    public long UserId { get; set; }

    [Required]
    public DateTime ExpiresAt { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public bool IsRevoked { get; set; } = false;

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}