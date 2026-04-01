using Microsoft.AspNetCore.Mvc;
using TourGuideBackend.Application.DTOs.Places;
using TourGuideBackend.Application.Services;

namespace TourGuideBackend.Controllers;

[ApiController]
[Route("api")]
public class CombosController : ControllerBase
{
    private readonly ComboQueryService _queryService;

    public CombosController(ComboQueryService queryService)
    {
        _queryService = queryService;
    }

    /// <summary>
    /// Fetches all combos / set menus for a place with dual-language translations
    /// and real-time currency conversion.
    /// GET /api/places/{placeId}/combos?lang=en
    /// </summary>
    [HttpGet("places/{placeId:guid}/combos")]
    public async Task<ActionResult<List<ComboDto>>> GetCombosByPlace(
        Guid placeId,
        [FromQuery] string lang = "en")
    {
        var combos = await _queryService.GetCombosByPlaceAsync(placeId, lang);
        return Ok(combos);
    }
}
