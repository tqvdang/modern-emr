using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using EMR.Core.Entities;
using EMR.Core.Interfaces;
using EMR.Infrastructure.Data;

namespace EMR.Infrastructure.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly EmrDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthenticationService(EmrDbContext context, ITokenService tokenService, IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    public async Task<AuthenticationResult> AuthenticateAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        try
        {
            // In a real EMR system, you might integrate with an external auth service (Auth0, Keycloak, etc.)
            // For this implementation, we'll use a simple password hash comparison
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted, cancellationToken);

            if (user == null)
            {
                return new AuthenticationResult 
                { 
                    IsSuccess = false, 
                    ErrorMessage = "Invalid credentials" 
                };
            }

            // Simple password verification (in production, use proper hashing like BCrypt)
            if (!VerifyPassword(password, user.AuthServiceUserId)) // Using AuthServiceUserId as password hash temporarily
            {
                return new AuthenticationResult 
                { 
                    IsSuccess = false, 
                    ErrorMessage = "Invalid credentials" 
                };
            }

            if (user.Status != "active")
            {
                return new AuthenticationResult 
                { 
                    IsSuccess = false, 
                    ErrorMessage = "Account is not active" 
                };
            }

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            var refreshTokenEntity = new EMR.Core.Entities.RefreshToken
            {
                Token = refreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                CreatedAt = DateTime.UtcNow
            };

            await _tokenService.SaveRefreshTokenAsync(refreshTokenEntity, cancellationToken);

            return new AuthenticationResult
            {
                IsSuccess = true,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = user,
                ExpiresAt = DateTime.UtcNow.AddHours(int.Parse(_configuration["Jwt:ExpirationHours"] ?? "24"))
            };
        }
        catch (Exception ex)
        {
            return new AuthenticationResult 
            { 
                IsSuccess = false, 
                ErrorMessage = "Authentication failed" 
            };
        }
    }

    public async Task<AuthenticationResult> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        try
        {
            var tokenEntity = await _tokenService.GetRefreshTokenAsync(refreshToken, cancellationToken);
            
            if (tokenEntity == null || tokenEntity.ExpiresAt < DateTime.UtcNow || tokenEntity.IsRevoked)
            {
                return new AuthenticationResult 
                { 
                    IsSuccess = false, 
                    ErrorMessage = "Invalid or expired refresh token" 
                };
            }

            var user = tokenEntity.User;
            if (user.Status != "active")
            {
                return new AuthenticationResult 
                { 
                    IsSuccess = false, 
                    ErrorMessage = "Account is not active" 
                };
            }

            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            // Revoke old refresh token
            await _tokenService.RevokeRefreshTokenAsync(refreshToken, cancellationToken);

            // Create new refresh token
            var newRefreshTokenEntity = new EMR.Core.Entities.RefreshToken
            {
                Token = newRefreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                CreatedAt = DateTime.UtcNow
            };

            await _tokenService.SaveRefreshTokenAsync(newRefreshTokenEntity, cancellationToken);

            return new AuthenticationResult
            {
                IsSuccess = true,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = user,
                ExpiresAt = DateTime.UtcNow.AddHours(int.Parse(_configuration["Jwt:ExpirationHours"] ?? "24"))
            };
        }
        catch (Exception ex)
        {
            return new AuthenticationResult 
            { 
                IsSuccess = false, 
                ErrorMessage = "Token refresh failed" 
            };
        }
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        try
        {
            await _tokenService.RevokeRefreshTokenAsync(refreshToken, cancellationToken);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> ValidateTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _tokenService.ValidateRefreshTokenAsync(token, cancellationToken);
    }

    public string GenerateJwtToken(User user)
    {
        return _tokenService.GenerateAccessToken(user);
    }

    public string GenerateRefreshToken()
    {
        return _tokenService.GenerateRefreshToken();
    }

    private static bool VerifyPassword(string password, string hash)
    {
        // Simple implementation - in production use BCrypt or similar
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        var hashedPassword = Convert.ToBase64String(hashedBytes);
        return hashedPassword == hash;
    }

    public static string HashPassword(string password)
    {
        // Simple implementation - in production use BCrypt or similar
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}