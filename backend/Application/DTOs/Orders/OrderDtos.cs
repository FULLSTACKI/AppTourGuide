namespace TourGuideBackend.Application.DTOs.Orders
{
    // ─── Request DTOs ───────────────────────────────────────────
    public record CreateOrderRequest(
        Guid PlaceId,
        string CustomerName,
        string ArrivalTime,
        int NumberOfPeople,
        string Note,
        List<OrderItemRequest> Items
    );

    public record OrderItemRequest(
        Guid DishId,
        int Quantity,
        string DishNameSnapshot
    );

    // ─── Response DTOs ──────────────────────────────────────────
    public record OrderDto(
        Guid Id,
        Guid PlaceId,
        string CustomerName,
        string ArrivalTime,
        int NumberOfPeople,
        string Note,
        string Status,
        DateTime CreatedAt,
        List<OrderItemDto> Items
    );

    public record OrderItemDto(
        Guid Id,
        Guid DishId,
        int Quantity,
        string DishNameSnapshot
    );
}
