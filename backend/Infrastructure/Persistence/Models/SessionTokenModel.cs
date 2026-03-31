using System;
using System.ComponentModel.DataAnnotations;

namespace TourGuideBackend.Infrastructure.Persistence.Models
{
    public class SessionTokenModel
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Token { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }

        public Guid AccountId { get; set; }
        public AccountModel? Account { get; set; }
    }
}
