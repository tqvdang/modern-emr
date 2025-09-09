using MediatR;
using AutoMapper;
using EMR.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace EMR.Application.Commands.Authentication;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginCommandResult>
{
    private readonly IAuthenticationService _authenticationService;
    private readonly IMapper _mapper;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        IAuthenticationService authenticationService,
        IMapper mapper,
        ILogger<LoginCommandHandler> logger)
    {
        _authenticationService = authenticationService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<LoginCommandResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Processing login request for email: {Email}", request.Email);

            var result = await _authenticationService.AuthenticateAsync(request.Email, request.Password, cancellationToken);

            if (!result.IsSuccess)
            {
                _logger.LogWarning("Login failed for email: {Email}. Reason: {ErrorMessage}", request.Email, result.ErrorMessage);
                return new LoginCommandResult
                {
                    IsSuccess = false,
                    ErrorMessage = result.ErrorMessage
                };
            }

            _logger.LogInformation("Login successful for email: {Email}", request.Email);

            var userDto = _mapper.Map<UserDto>(result.User);

            return new LoginCommandResult
            {
                IsSuccess = true,
                AccessToken = result.AccessToken,
                RefreshToken = result.RefreshToken,
                ExpiresAt = result.ExpiresAt,
                User = userDto
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing login request for email: {Email}", request.Email);
            return new LoginCommandResult
            {
                IsSuccess = false,
                ErrorMessage = "An error occurred during authentication"
            };
        }
    }
}