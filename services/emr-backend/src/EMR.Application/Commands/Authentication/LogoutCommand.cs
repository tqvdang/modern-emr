using MediatR;

namespace EMR.Application.Commands.Authentication;

public class LogoutCommand : IRequest<LogoutCommandResult>
{
    public required string RefreshToken { get; set; }
}

public class LogoutCommandResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
}