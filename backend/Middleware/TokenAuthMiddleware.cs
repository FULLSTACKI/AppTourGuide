using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Infrastructure.Persistence;

namespace TourGuideBackend.Middleware;

/// <summary>
/// Validates session-token from "Authorization: Bearer {token}" header.
/// Sets HttpContext.User with Username and Role claims when token is valid.
/// </summary>
public class TokenAuthMiddleware
{
    private readonly RequestDelegate _next;

    public TokenAuthMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = authHeader["Bearer ".Length..].Trim();

            var session = await db.SessionTokens
                .Include(s => s.Account)
                .FirstOrDefaultAsync(s => s.Token == token);

            if (session is not null && session.ExpiresAt > DateTime.UtcNow && session.Account is not null)
            {
                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, session.Account.Username),
                    new Claim(ClaimTypes.Role, session.Account.Role),
                };

                var identity = new ClaimsIdentity(claims, "SessionToken");
                context.User = new ClaimsPrincipal(identity);
            }
        }

        await _next(context);
    }
}
