using System;

namespace TourGuideBackend.Application.DTOs.Auth
{
    public class TokenDto
    {
        public string? AccessToken { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string? Username { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
