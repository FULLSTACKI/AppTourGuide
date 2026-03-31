using Microsoft.AspNetCore.Mvc;
using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Application.Services;
using TourGuideBackend.Middleware;

namespace TourGuideBackend.Controllers;

[ApiController]
[Route("api/dishes")]
public class DishesController : ControllerBase
{
    private readonly DishQueryService _queryService;
    private readonly DishCommandService _commandService;

    public DishesController(DishQueryService queryService, DishCommandService commandService)
    {
        _queryService = queryService;
        _commandService = commandService;
    }

    [HttpGet("by-place/{placeId:guid}")]
    public async Task<ActionResult<List<DishDto>>> GetByPlace(Guid placeId, [FromQuery] string lang = "en")
    {
        var dishes = await _queryService.GetByPlaceIdAsync(placeId, lang);
        return Ok(dishes);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DishDto>> GetById(Guid id, [FromQuery] string lang = "en")
    {
        var dish = await _queryService.GetByIdAsync(id, lang);
        if (dish == null) return NotFound();
        return Ok(dish);
    }

    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpPost]
    public async Task<ActionResult<DishDto>> Create([FromBody] CreateDishRequest req)
    {
        var created = await _commandService.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<DishDto>> Update(Guid id, [FromBody] UpdateDishRequest req)
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
