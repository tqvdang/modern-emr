using MediatR;
using EMR.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace EMR.Application.Commands.Authentication;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenCommandResult>
{
    private readonly IAuthenticationService _authenticationService;
    private readonly ILogger<RefreshTokenCommandHandler> _logger;

    public RefreshTokenCommandHandler(
        IAuthenticationService authenticationService,
        ILogger<RefreshTokenCommandHandler> logger)
    {
        _authenticationService = authenticationService;
        _logger = logger;
    }

    public async Task<RefreshTokenCommandResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Processing refresh token request");

            var result = await _authenticationService.RefreshTokenAsync(request.RefreshToken, cancellationToken);

            if (!result.IsSuccess)
            {
                _logger.LogWarning("Refresh token failed. Reason: {ErrorMessage}", result.ErrorMessage);
                return new RefreshTokenCommandResult
                {
                    IsSuccess = false,
                    ErrorMessage = result.ErrorMessage
                };
            }

            _logger.LogInformation("Refresh token successful");

            return new RefreshTokenCommandResult
            {
                IsSuccess = true,
                AccessToken = result.AccessToken,
                RefreshToken = result.RefreshToken,
                ExpiresAt = result.ExpiresAt
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refresh token request");
            return new RefreshTokenCommandResult
            {
                IsSuccess = false,
                ErrorMessage = "An error occurred during token refresh"
            };
        }
    }
}