using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Infrastructure.Persistence.Models;

namespace TourGuideBackend.Infrastructure.Persistence
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            await SeedAdminAsync(context);
            await SeedPlacesAsync(context);
        }

        private static async Task SeedAdminAsync(AppDbContext context)
        {
            if (await context.Accounts.AnyAsync(a => a.Username == "admin"))
                return;

            var passwordHash = Account.Create("admin", "admin123", "Admin").PasswordHash;

            context.Accounts.Add(new AccountModel
            {
                Id = Guid.NewGuid(),
                Username = "admin",
                Password = passwordHash,
                Role = "Admin",
            });

            await context.SaveChangesAsync();
        }

        private static async Task SeedPlacesAsync(AppDbContext context)
        {
            if (await context.Places.AnyAsync())
                return;

            // ───────────────────────────────────────────────
            // Place 1 — Ốc Oanh (Vinh Khanh, District 4)
            // ───────────────────────────────────────────────
            var ocOanh = new Place
            {
                Id = Guid.NewGuid(),
                Latitude = 10.761530,
                Longitude = 106.704250,
                CoverImageUrl = "https://placehold.co/600x400/e74c3c/white?text=Oc+Oanh",
                PriceRange = "50,000 - 150,000 VND",
                Status = true,
            };

            var ocOanhDish = new Dish
            {
                Id = Guid.NewGuid(),
                PlaceId = ocOanh.Id,
                ImageUrl = "https://placehold.co/400x300/e67e22/white?text=Oc+Huong+Rang+Muoi",
            };

            ocOanh.Translations = new List<PlaceTranslation>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    PlaceId = ocOanh.Id,
                    LanguageCode = "vi",
                    Name = "Ốc Oanh",
                    Description = "Quán ốc nhộn nhịp và nổi tiếng nhất nhì khu Vĩnh Khánh. Đặc sản là ốc hương rang muối ớt.",
                    AudioUrl = "",
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    PlaceId = ocOanh.Id,
                    LanguageCode = "en",
                    Name = "Oc Oanh Seafood",
                    Description = "The most bustling and famous snail restaurant in Vinh Khanh. The signature dish is sweet snails roasted with chili salt.",
                    AudioUrl = "",
                },
            };

            ocOanh.Dishes = new List<Dish> { ocOanhDish };

            ocOanhDish.Translations = new List<DishTranslation>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    DishId = ocOanhDish.Id,
                    LanguageCode = "vi",
                    Name = "Ốc hương rang muối",
                    Description = "Ốc hương tươi được rang cùng muối ớt cay nồng, thơm lừng.",
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    DishId = ocOanhDish.Id,
                    LanguageCode = "en",
                    Name = "Chili Salt Sweet Snails",
                    Description = "Fresh sweet snails roasted with fragrant chili salt, bursting with aroma.",
                },
            };

            // ───────────────────────────────────────────────
            // Place 2 — Ốc Vũ (Vinh Khanh, District 4)
            // ───────────────────────────────────────────────
            var ocVu = new Place
            {
                Id = Guid.NewGuid(),
                Latitude = 10.761800,
                Longitude = 106.704500,
                CoverImageUrl = "https://placehold.co/600x400/2980b9/white?text=Oc+Vu",
                PriceRange = "40,000 - 120,000 VND",
                Status = true,
            };

            var ocVuDish = new Dish
            {
                Id = Guid.NewGuid(),
                PlaceId = ocVu.Id,
                ImageUrl = "https://placehold.co/400x300/27ae60/white?text=So+Diep+Nuong",
            };

            ocVu.Translations = new List<PlaceTranslation>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    PlaceId = ocVu.Id,
                    LanguageCode = "vi",
                    Name = "Ốc Vũ",
                    Description = "Không gian rộng rãi, giá cả bình dân. Các món nướng mỡ hành ở đây cực kỳ thơm ngon.",
                    AudioUrl = "",
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    PlaceId = ocVu.Id,
                    LanguageCode = "en",
                    Name = "Vu Snails",
                    Description = "Spacious environment and affordable prices. The grilled dishes with scallion oil are incredibly delicious.",
                    AudioUrl = "",
                },
            };

            ocVu.Dishes = new List<Dish> { ocVuDish };

            ocVuDish.Translations = new List<DishTranslation>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    DishId = ocVuDish.Id,
                    LanguageCode = "vi",
                    Name = "Sò điệp nướng mỡ hành",
                    Description = "Sò điệp tươi nướng trên bếp than, phủ mỡ hành phi vàng giòn.",
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    DishId = ocVuDish.Id,
                    LanguageCode = "en",
                    Name = "Grilled Scallops with Scallion Oil",
                    Description = "Fresh scallops grilled over charcoal, topped with crispy golden scallion oil.",
                },
            };

            // ───────────────────────────────────────────────
            // Persist everything
            // ───────────────────────────────────────────────
            context.Places.AddRange(ocOanh, ocVu);
            await context.SaveChangesAsync();
        }
    }
}
