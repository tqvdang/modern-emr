namespace EMR.Application.Common;

public class ServiceResult<T>
{
    public bool IsSuccess { get; private set; }
    public T? Data { get; private set; }
    public string? ErrorMessage { get; private set; }
    public Dictionary<string, string[]>? ValidationErrors { get; private set; }
    public int StatusCode { get; private set; }

    private ServiceResult(bool isSuccess, T? data, string? errorMessage, Dictionary<string, string[]>? validationErrors, int statusCode)
    {
        IsSuccess = isSuccess;
        Data = data;
        ErrorMessage = errorMessage;
        ValidationErrors = validationErrors;
        StatusCode = statusCode;
    }

    public static ServiceResult<T> Success(T data) => new(true, data, null, null, 200);

    public static ServiceResult<T> Created(T data) => new(true, data, null, null, 201);

    public static ServiceResult<T> NotFound(string message = "Resource not found") => new(false, default, message, null, 404);

    public static ServiceResult<T> BadRequest(string message) => new(false, default, message, null, 400);

    public static ServiceResult<T> Conflict(string message) => new(false, default, message, null, 409);

    public static ServiceResult<T> ValidationError(Dictionary<string, string[]> errors) => new(false, default, "Validation failed", errors, 400);

    public static ServiceResult<T> Error(string message, int statusCode = 500) => new(false, default, message, null, statusCode);

    public static ServiceResult<T> Unauthorized(string message = "Unauthorized") => new(false, default, message, null, 401);

    public static ServiceResult<T> Forbidden(string message = "Forbidden") => new(false, default, message, null, 403);
}

public static class ServiceResult
{
    public static ServiceResult<T> Success<T>(T data) => ServiceResult<T>.Success(data);
    public static ServiceResult<T> Created<T>(T data) => ServiceResult<T>.Created(data);
    public static ServiceResult<T> NotFound<T>(string message = "Resource not found") => ServiceResult<T>.NotFound(message);
    public static ServiceResult<T> BadRequest<T>(string message) => ServiceResult<T>.BadRequest(message);
    public static ServiceResult<T> Conflict<T>(string message) => ServiceResult<T>.Conflict(message);
    public static ServiceResult<T> ValidationError<T>(Dictionary<string, string[]> errors) => ServiceResult<T>.ValidationError(errors);
    public static ServiceResult<T> Error<T>(string message, int statusCode = 500) => ServiceResult<T>.Error(message, statusCode);
    public static ServiceResult<T> Unauthorized<T>(string message = "Unauthorized") => ServiceResult<T>.Unauthorized(message);
    public static ServiceResult<T> Forbidden<T>(string message = "Forbidden") => ServiceResult<T>.Forbidden(message);
}