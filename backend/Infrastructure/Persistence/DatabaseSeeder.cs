using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Infrastructure.Persistence.Models;

namespace TourGuideBackend.Infrastructure.Persistence
{
    public static class DatabaseSeeder
    {
        // ─── Deterministic GUIDs ─────────────────────────────────
        // Using fixed GUIDs ensures the seed is idempotent across restarts.

        // Place
        private static readonly Guid PlaceId     = Guid.Parse("a1000000-0000-0000-0000-000000000001");

        // Dishes
        private static readonly Guid DishAId     = Guid.Parse("b1000000-0000-0000-0000-000000000001");
        private static readonly Guid DishBId     = Guid.Parse("b1000000-0000-0000-0000-000000000002");
        private static readonly Guid DishCId     = Guid.Parse("b1000000-0000-0000-0000-000000000003");

        // Translations
        private static readonly Guid PlaceTrId   = Guid.Parse("c1000000-0000-0000-0000-000000000001");
        private static readonly Guid DishATrId   = Guid.Parse("c2000000-0000-0000-0000-000000000001");
        private static readonly Guid DishBTrId   = Guid.Parse("c2000000-0000-0000-0000-000000000002");
        private static readonly Guid DishCTrId   = Guid.Parse("c2000000-0000-0000-0000-000000000003");

        // Cross-sell
        private static readonly Guid RelationId  = Guid.Parse("d1000000-0000-0000-0000-000000000001");

        // Combo
        private static readonly Guid ComboId     = Guid.Parse("e1000000-0000-0000-0000-000000000001");
        private static readonly Guid ComboTrId   = Guid.Parse("e2000000-0000-0000-0000-000000000001");
        private static readonly Guid ComboDishAId = Guid.Parse("e3000000-0000-0000-0000-000000000001");
        private static readonly Guid ComboDishBId = Guid.Parse("e3000000-0000-0000-0000-000000000002");
        private static readonly Guid ComboDishCId = Guid.Parse("e3000000-0000-0000-0000-000000000003");

        // ─────────────────────────────────────────────────────────

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
            // Place — Ốc Đêm Vĩnh Khánh
            // ───────────────────────────────────────────────
            var place = new Place
            {
                Id = PlaceId,
                Latitude = 10.7613,
                Longitude = 106.7043,
                CoverImageUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                PriceRange = "10,000 – 165,000 VND",
                Status = true,
                Translations = new List<PlaceTranslation>
                {
                    new()
                    {
                        Id = PlaceTrId,
                        PlaceId = PlaceId,
                        LanguageCode = "vi",
                        Name = "Ốc Đêm Vĩnh Khánh",
                        Description = "Quán ốc hải sản bình dân ngon nhất khu vực.",
                        AudioUrl = "",
                    },
                },
            };

            // ───────────────────────────────────────────────
            // Dish A — Ốc hương xào bơ tỏi (recommended)
            // ───────────────────────────────────────────────
            var dishA = new Dish
            {
                Id = DishAId,
                PlaceId = PlaceId,
                ImageUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                BasePrice = 150_000m,
                IsRecommended = true,
                DietaryTags = "seafood,garlic,dairy,gluten-free",
                Translations = new List<DishTranslation>
                {
                    new()
                    {
                        Id = DishATrId,
                        DishId = DishAId,
                        LanguageCode = "vi",
                        Name = "Ốc hương xào bơ tỏi",
                        Description = "Ốc hương tươi sống xào với bơ Pháp và tỏi phi thơm lừng.",
                    },
                },
            };

            // ───────────────────────────────────────────────
            // Dish B — Bánh mì đặc ruột
            // ───────────────────────────────────────────────
            var dishB = new Dish
            {
                Id = DishBId,
                PlaceId = PlaceId,
                ImageUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                BasePrice = 10_000m,
                IsRecommended = false,
                DietaryTags = "vegetarian,wheat",
                Translations = new List<DishTranslation>
                {
                    new()
                    {
                        Id = DishBTrId,
                        DishId = DishBId,
                        LanguageCode = "vi",
                        Name = "Bánh mì đặc ruột",
                        Description = "Bánh mì nóng giòn.",
                    },
                },
            };

            // ───────────────────────────────────────────────
            // Dish C — Bia Tiger Bạc
            // ───────────────────────────────────────────────
            var dishC = new Dish
            {
                Id = DishCId,
                PlaceId = PlaceId,
                ImageUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                BasePrice = 25_000m,
                IsRecommended = false,
                DietaryTags = "alcohol,cold",
                Translations = new List<DishTranslation>
                {
                    new()
                    {
                        Id = DishCTrId,
                        DishId = DishCId,
                        LanguageCode = "vi",
                        Name = "Bia Tiger Bạc",
                        Description = "cuc cot  ướp lạnh sảng khoái.",
                    },
                },
            };

            place.Dishes = new List<Dish> { dishA, dishB, dishC };

            // ───────────────────────────────────────────────
            // Cross-sell: Dish A ↔ Dish B ("Perfect Match")
            // ───────────────────────────────────────────────
            var relation = new DishRelation
            {
                Id = RelationId,
                PrimaryDishId = DishAId,
                RelatedDishId = DishBId,
            };

            // ───────────────────────────────────────────────
            // Combo — Combo Đêm Sài Gòn
            // ───────────────────────────────────────────────
            var combo = new Combo
            {
                Id = ComboId,
                PlaceId = PlaceId,
                ImageUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                BasePrice = 165_000m,
                Translations = new List<ComboTranslation>
                {
                    new()
                    {
                        Id = ComboTrId,
                        ComboId = ComboId,
                        LanguageCode = "vi",
                        Name = "Combo Đêm Sài Gòn",
                        Description = "1 Phần Ốc hương bơ tỏi + 1 Bánh mì + 1 Bia Tiger. Tiết kiệm 20k!",
                    },
                },
                ComboDishes = new List<ComboDish>
                {
                    new() { Id = ComboDishAId, ComboId = ComboId, DishId = DishAId },
                    new() { Id = ComboDishBId, ComboId = ComboId, DishId = DishBId },
                    new() { Id = ComboDishCId, ComboId = ComboId, DishId = DishCId },
                },
            };

            // ───────────────────────────────────────────────
            // Persist everything in a single transaction
            // ───────────────────────────────────────────────
            context.Places.Add(place);       // cascades Dishes + Translations
            context.DishRelations.Add(relation);
            context.Combos.Add(combo);       // cascades ComboTranslations + ComboDishes

            await context.SaveChangesAsync();
        }
    }
}
