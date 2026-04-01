using Microsoft.AspNetCore.Mvc;
using TourGuideBackend.Application.DTOs.MenuItems;
using TourGuideBackend.Application.Services;
using TourGuideBackend.Middleware;

namespace TourGuideBackend.Controllers;

[ApiController]
[Route("api/menu-items")]
public class MenuItemsController : ControllerBase
{
    private readonly MenuItemQueryService _queryService;
    private readonly MenuItemCommandService _commandService;

    public MenuItemsController(MenuItemQueryService queryService, MenuItemCommandService commandService)
    {
        _queryService = queryService;
        _commandService = commandService;
    }

    /// <summary>
    /// Get all menu items for a place, with optional dietary filter.
    /// Example: GET /api/menu-items/by-place/{placeId}?lang=en&dietary=vegetarian,peanut-free
    /// </summary>
    [HttpGet("by-place/{placeId:guid}")]
    public async Task<ActionResult<List<MenuItemDto>>> GetByPlace(
        Guid placeId,
        [FromQuery] string lang = "en",
        [FromQuery] string? dietary = null)
    {
        List<string>? dietaryFilters = null;
        if (!string.IsNullOrWhiteSpace(dietary))
        {
            dietaryFilters = dietary
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();
        }

        var items = await _queryService.GetByPlaceIdAsync(placeId, lang, dietaryFilters);
        return Ok(items);
    }

    /// <summary>
    /// Get recommended menu items for a place (cross-sell).
    /// GET /api/menu-items/recommended/{placeId}?lang=en
    /// </summary>
    [HttpGet("recommended/{placeId:guid}")]
    public async Task<ActionResult<List<MenuItemDto>>> GetRecommended(
        Guid placeId,
        [FromQuery] string lang = "en")
    {
        var items = await _queryService.GetRecommendedAsync(placeId, lang);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MenuItemDto>> GetById(Guid id, [FromQuery] string lang = "en")
    {
        var item = await _queryService.GetByIdAsync(id, lang);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpPost]
    public async Task<ActionResult<MenuItemDto>> Create([FromBody] CreateMenuItemRequest req)
    {
        var created = await _commandService.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MenuItemDto>> Update(Guid id, [FromBody] UpdateMenuItemRequest req)
    {
        var updated = await _commandService.UpdateAsync(id, req);
        return Ok(updated);
    }

    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _commandService.DeleteAsync(id);
        return NoContent();
    }
}
