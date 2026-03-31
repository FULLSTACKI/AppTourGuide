using System.ComponentModel.DataAnnotations;

namespace TourGuideBackend.Infrastructure.Persistence.Models
{
    public class AccountModel
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Username { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string Role { get; set; } = default!;
    }
}
