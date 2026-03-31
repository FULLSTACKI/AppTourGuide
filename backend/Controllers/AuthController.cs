using Microsoft.AspNetCore.Mvc;
using TourGuideBackend.Application.DTOs.Auth;
using TourGuideBackend.Application.Services;
using TourGuideBackend.Middleware;
using System.Security.Claims;

namespace TourGuideBackend.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AccountService _service;

    public AuthController(AccountService service) => _service = service;

    [HttpPost("login")]
    public async Task<ActionResult<AccountResponseDto>> Login([FromBody] AccountLoginRequestDto req)
        => Ok(await _service.LoginAsync(req));

    /// <summary>
    /// Returns the currently authenticated user info.
    /// Used by the frontend to validate a stored token on page reload.
    /// </summary>
    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpGet("me")]
    public ActionResult<AccountResponseDto> Me()
    {
        var username = User.FindFirstValue(ClaimTypes.Name) ?? "";
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";

        return Ok(new AccountResponseDto
        {
            Success = true,
            Message = "Authenticated",
            DisplayName = username,
            Role = role,
        });
    }
}