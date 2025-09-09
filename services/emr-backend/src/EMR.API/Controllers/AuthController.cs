using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using EMR.Application.Commands.Authentication;
using System.ComponentModel.DataAnnotations;

namespace EMR.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IMediator mediator, ILogger<AuthController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate user and return JWT tokens
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>Authentication result with tokens</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            _logger.LogInformation("Login attempt for email: {Email}", request.Email);

            var command = new LoginCommand
            {
                Email = request.Email,
                Password = request.Password
            };

            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
            {
                _logger.LogWarning("Login failed for email: {Email}", request.Email);
                return Unauthorized(new ErrorResponse { Message = result.ErrorMessage ?? "Invalid credentials" });
            }

            var response = new LoginResponse
            {
                AccessToken = result.AccessToken!,
                RefreshToken = result.RefreshToken!,
                ExpiresAt = result.ExpiresAt!.Value,
                User = new UserResponse
                {
                    Id = result.User!.Id,
                    Uuid = result.User.Uuid,
                    FirstName = result.User.FirstName,
                    LastName = result.User.LastName,
                    Email = result.User.Email,
                    UserType = result.User.UserType,
                    Role = result.User.Role,
                    FullName = result.User.FullName
                }
            };

            _logger.LogInformation("Login successful for email: {Email}", request.Email);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return StatusCode(500, new ErrorResponse { Message = "An internal error occurred" });
        }
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    /// <param name="request">Refresh token</param>
    /// <returns>New tokens</returns>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(RefreshResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            _logger.LogInformation("Token refresh attempt");

            var command = new RefreshTokenCommand
            {
                RefreshToken = request.RefreshToken
            };

            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
            {
                _logger.LogWarning("Token refresh failed");
                return Unauthorized(new ErrorResponse { Message = result.ErrorMessage ?? "Invalid refresh token" });
            }

            var response = new RefreshResponse
            {
                AccessToken = result.AccessToken!,
                RefreshToken = result.RefreshToken!,
                ExpiresAt = result.ExpiresAt!.Value
            };

            _logger.LogInformation("Token refresh successful");
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return StatusCode(500, new ErrorResponse { Message = "An internal error occurred" });
        }
    }

    /// <summary>
    /// Logout and revoke refresh token
    /// </summary>
    /// <param name="request">Refresh token to revoke</param>
    /// <returns>Logout result</returns>
    [HttpPost("logout")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        try
        {
            _logger.LogInformation("Logout attempt");

            var command = new LogoutCommand
            {
                RefreshToken = request.RefreshToken
            };

            var result = await _mediator.Send(command);

            if (!result.IsSuccess)
            {
                _logger.LogWarning("Logout failed");
                return BadRequest(new ErrorResponse { Message = result.ErrorMessage ?? "Logout failed" });
            }

            _logger.LogInformation("Logout successful");
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, new ErrorResponse { Message = "An internal error occurred" });
        }
    }

    /// <summary>
    /// Get current user information
    /// </summary>
    /// <returns>Current user details</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var userType = User.FindFirst("UserType")?.Value;
            var role = User.FindFirst("Role")?.Value;
            var uuid = User.FindFirst("Uuid")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var response = new UserResponse
            {
                Id = long.Parse(userId),
                Uuid = Guid.Parse(uuid ?? Guid.Empty.ToString()),
                Email = email ?? "",
                FullName = name ?? "",
                UserType = userType ?? "",
                Role = role
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, new ErrorResponse { Message = "An internal error occurred" });
        }
    }
}

// Request/Response DTOs
public class LoginRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }
}

public class RefreshTokenRequest
{
    [Required]
    public required string RefreshToken { get; set; }
}

public class LogoutRequest
{
    [Required]
    public required string RefreshToken { get; set; }
}

public class LoginResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public required UserResponse User { get; set; }
}

public class RefreshResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public required DateTime ExpiresAt { get; set; }
}

public class UserResponse
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

public class ErrorResponse
{
    public required string Message { get; set; }
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}