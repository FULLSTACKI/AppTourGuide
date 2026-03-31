using Microsoft.AspNetCore.Mvc;
using TourGuideBackend.Application.DTOs.Orders;
using TourGuideBackend.Application.Services;
using TourGuideBackend.Middleware;

namespace TourGuideBackend.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrdersController(OrderService orderService)
    {
        _orderService = orderService;
    }

    // Public – customer creates a pre-order / booking
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create([FromBody] CreateOrderRequest req)
    {
        var created = await _orderService.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // Public – customer can check their order
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetById(Guid id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    // Admin – list all orders
    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetAll()
    {
        var orders = await _orderService.GetAllAsync();
        return Ok(orders);
    }

    // Admin – list orders for a place
    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpGet("place/{placeId:guid}")]
    public async Task<ActionResult<List<OrderDto>>> GetByPlace(Guid placeId)
    {
        var orders = await _orderService.GetByPlaceIdAsync(placeId);
        return Ok(orders);
    }

    // Admin – update order status (confirm / cancel)
    [ServiceFilter(typeof(RequireAuthFilter))]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest req)
    {
        var updated = await _orderService.UpdateStatusAsync(id, req.Status);
        return Ok(updated);
    }
}

public record UpdateOrderStatusRequest(string Status);
