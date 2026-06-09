using HRConnect.API.Models;
using System.Net;
using System.Text.Json;

namespace HRConnect.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsyn(HttpContext httpContext)
        {
            try
            {
                await _next(httpContext);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(httpContext, ex);
            }
        }

        private static async Task HandleExceptionAsync(
        HttpContext context,
        Exception exception)
        {
            var response = new ErrorResponse
            {
                Timestamp = DateTime.UtcNow,
                Path = context.Request.Path,
                Message = exception.Message
            };

            switch (exception)
            {
                case NotFoundException:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    response.Error = "Not Found";
                    break;

                case BadRequestException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    response.Error = "Bad Request";
                    break;

                case UnauthorizedAccessException:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    response.Error = "Unauthorized";
                    break;

                default:
                    context.Response.StatusCode =
                        (int)HttpStatusCode.InternalServerError;

                    response.Error = "Internal Server Error";
                    break;
            }

            context.Response.ContentType = "application/json";

            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response));
        }
    }
}
