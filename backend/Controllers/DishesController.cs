using Microsoft.AspNetCore.Mvc;
using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Application.Services;
using TourGuideBackend.Middleware;

namespace TourGuideBackend.Controllers;

[ApiController]
[Route("api")]
public class DishesController : ControllerBase
{
    private readonly DishQueryService _queryService;
    private readonly DishCommandService _commandService;

    public DishesController(DishQueryService queryService, DishCommandService commandService)
    {
        _queryService = queryService;
        _commandService = commandService;
    }

    /// <summary>
    /// Smart Dietary & Allergy Search + Visual Ordering (OriginalName).
    /// GET /api/places/{placeId}/dishes?lang=en&dietary=peanut,shellfish
    /// Filters OUT dishes containing ANY of the specified dietary tags.
    /// </summary>
    [HttpGet("places/{placeId:guid}/dishes")]
    public async Task<ActionResult<List<DishDto>>> GetDishesByPlace(
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

        var dishes = await _queryService.GetDishesByPlaceAsync(placeId, lang, dietaryFilters);
        return Ok(dishes);
    }

    /// <summary>
    /// Cross-sell Recommendations: returns only IsRecommended dishes.
    /// GET /api/places/{placeId}/dishes/recommended?lang=en
    /// </summary>
    [HttpGet("places/{placeId:guid}/dishes/recommended")]
    public async Task<ActionResult<List<DishDto>>> GetRecommendedDishes(
        Guid placeId,
        [FromQuery] string lang = "en")
    {
        var dishes = await _queryService.GetRecommendedDishesAsync(placeId, lang);
        return Ok(dishes);
    }

    /// <summary>
    /// Legacy single-dish lookup (kept for backward compatibility).
    /// </summary>
    [HttpGet("dishes/{id:guid}")]
    public async Task<ActionResult<DishDto>> GetById(Guid id, [FromQuery] string lang = "en")
    {
        var dish = await _queryService.GetByIdAsync(id, lang);
        if (dish == null) return NotFound();
        return Ok(dish);
    }

    /// <summary>
    /// "Perfect Match" — related dishes for a given dish (bidirectional).
    /// GET /api/dishes/{dishId}/related?lang=en
    /// </summary>
    [HttpGet("dishes/{dishId:guid}/related")]
    public async Task<ActionResult<List<DishDto>>> GetRelatedDishes(
        Guid dishId,
        [FromQuery] string lang = "en")
    {
        var related = await _queryService.GetRelatedDishesAsync(dishId, lang);
        return Ok(related);
    }

    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpPost("dishes")]
    public async Task<ActionResult<DishDto>> Create([FromBody] CreateDishRequest req)
    {
        var created = await _commandService.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpPut("dishes/{id:guid}")]
    public async Task<ActionResult<DishDto>> Update(Guid id, [FromBody] UpdateDishRequest req)
    {
        var updated = await _commandService.UpdateAsync(id, req);
        return Ok(updated);
    }

    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpDelete("dishes/{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _commandService.DeleteAsync(id);
        return NoContent();
    }
}
