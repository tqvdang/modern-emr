using MediatR;
using EMR.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace EMR.Application.Commands.Authentication;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand, LogoutCommandResult>
{
    private readonly IAuthenticationService _authenticationService;
    private readonly ILogger<LogoutCommandHandler> _logger;

    public LogoutCommandHandler(
        IAuthenticationService authenticationService,
        ILogger<LogoutCommandHandler> logger)
    {
        _authenticationService = authenticationService;
        _logger = logger;
    }

    public async Task<LogoutCommandResult> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Processing logout request");

            var success = await _authenticationService.RevokeTokenAsync(request.RefreshToken, cancellationToken);

            if (!success)
            {
                _logger.LogWarning("Logout failed - token revocation unsuccessful");
                return new LogoutCommandResult
                {
                    IsSuccess = false,
                    ErrorMessage = "Failed to revoke token"
                };
            }

            _logger.LogInformation("Logout successful");

            return new LogoutCommandResult
            {
                IsSuccess = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing logout request");
            return new LogoutCommandResult
            {
                IsSuccess = false,
                ErrorMessage = "An error occurred during logout"
            };
        }
    }
}