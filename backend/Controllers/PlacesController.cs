using Microsoft.AspNetCore.Mvc;
using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Application.Services;
using TourGuideBackend.Middleware;

namespace TourGuideBackend.Controllers;

[ApiController]
[Route("api/places")]
public class PlacesController : ControllerBase
{
    private readonly PlaceQueryService _queryService;
    private readonly PlaceCommandService _commandService;

    public PlacesController(PlaceQueryService queryService, PlaceCommandService commandService)
    {
        _queryService = queryService;
        _commandService = commandService;
    }

    [HttpGet]
    public async Task<ActionResult<List<PlaceDto>>> GetAll([FromQuery] string lang = "en")
    {
        var places = await _queryService.GetAllAsync(lang);
        return Ok(places);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PlaceDto>> GetById(Guid id, [FromQuery] string lang = "en")
    {
        var place = await _queryService.GetByIdAsync(id, lang);
        if (place == null) return NotFound();
        return Ok(place);
    }

    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpPost]
    public async Task<ActionResult<PlaceDto>> Create([FromBody] CreatePlaceRequest req)
    {
        var created = await _commandService.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PlaceDto>> Update(Guid id, [FromBody] UpdatePlaceRequest req)
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
