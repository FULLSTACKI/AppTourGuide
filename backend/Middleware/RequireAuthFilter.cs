using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TourGuideBackend.Middleware;

/// <summary>
/// Action filter that requires the user to be authenticated via <see cref="TokenAuthMiddleware"/>.
/// Apply via [ServiceFilter(typeof(RequireAuthFilter))] on actions or controllers.
/// Optionally checks a required role.
/// </summary>
public class RequireAuthFilter : IActionFilter
{
    private readonly string? _role;

    public RequireAuthFilter() { }
    public RequireAuthFilter(string role) => _role = role;

    public void OnActionExecuting(ActionExecutingContext context)
    {
        var user = context.HttpContext.User;

        if (user.Identity is not { IsAuthenticated: true })
        {
            context.Result = new UnauthorizedObjectResult(new { error = "Authentication required." });
            return;
        }

        if (!string.IsNullOrEmpty(_role) && !user.IsInRole(_role))
        {
            context.Result = new ObjectResult(new { error = "Insufficient permissions." }) { StatusCode = 403 };
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
