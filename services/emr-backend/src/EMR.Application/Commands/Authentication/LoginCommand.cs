using MediatR;
using EMR.Core.Interfaces;

namespace EMR.Application.Commands.Authentication;

public class LoginCommand : IRequest<LoginCommandResult>
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}

public class LoginCommandResult
{
    public bool IsSuccess { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public UserDto? User { get; set; }
}

public class UserDto
{
    public long Id { get; set; }
    public Guid Uuid { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string FullName { get; set; } = string.Empty;
}