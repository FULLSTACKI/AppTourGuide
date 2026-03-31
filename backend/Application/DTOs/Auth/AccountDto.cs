namespace TourGuideBackend.Application.DTOs.Auth
{
    public class AccountLoginRequestDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AccountResponseDto
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? AccessToken { get; set; }
        public string? Role { get; set; }
        public string? ProfileCode { get; set; }
        public string? DisplayName { get; set; }
    }
}
