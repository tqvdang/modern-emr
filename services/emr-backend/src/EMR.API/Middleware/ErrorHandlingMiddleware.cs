using System.Net;
using System.Text.Json;
using EMR.Application.Common;

namespace EMR.API.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new ErrorResponse();

        switch (exception)
        {
            case ApplicationException ex:
                errorResponse.Message = ex.Message;
                errorResponse.Code = "APPLICATION_ERROR";
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case ArgumentException ex:
                errorResponse.Message = ex.Message;
                errorResponse.Code = "INVALID_ARGUMENT";
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case UnauthorizedAccessException ex:
                errorResponse.Message = "Access denied";
                errorResponse.Code = "ACCESS_DENIED";
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                break;

            case KeyNotFoundException ex:
                errorResponse.Message = "Resource not found";
                errorResponse.Code = "NOT_FOUND";
                response.StatusCode = (int)HttpStatusCode.NotFound;
                break;

            case ValidationException ex:
                errorResponse.Message = ex.Message;
                errorResponse.Code = "VALIDATION_ERROR";
                errorResponse.ValidationErrors = ex.Errors;
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;

            case TimeoutException ex:
                errorResponse.Message = "Request timeout";
                errorResponse.Code = "TIMEOUT";
                response.StatusCode = (int)HttpStatusCode.RequestTimeout;
                break;

            default:
                errorResponse.Message = "An internal server error occurred";
                errorResponse.Code = "INTERNAL_ERROR";
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

        errorResponse.StatusCode = response.StatusCode;
        errorResponse.Timestamp = DateTime.UtcNow;
        errorResponse.RequestId = context.TraceIdentifier;

        var result = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await response.WriteAsync(result);
    }
}

public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public DateTime Timestamp { get; set; }
    public string RequestId { get; set; } = string.Empty;
    public Dictionary<string, string[]>? ValidationErrors { get; set; }
}

public class ValidationException : Exception
{
    public Dictionary<string, string[]> Errors { get; }

    public ValidationException(Dictionary<string, string[]> errors)
        : base("Validation failed")
    {
        Errors = errors;
    }

    public ValidationException(string field, string error)
        : base("Validation failed")
    {
        Errors = new Dictionary<string, string[]>
        {
            { field, new[] { error } }
        };
    }
}