using MediatR;

namespace EMR.Application.Commands.Authentication;

public class RefreshTokenCommand : IRequest<RefreshTokenCommandResult>
{
    public required string RefreshToken { get; set; }
}

public class RefreshTokenCommandResult
{
    public bool IsSuccess { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? ExpiresAt { get; set; }
}