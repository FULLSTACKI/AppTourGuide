using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Infrastructure.Persistence.Models;

namespace TourGuideBackend.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        // Infrastructure tables
        public DbSet<AuditBaseModel> AuditLogs => Set<AuditBaseModel>();
        public DbSet<SessionTokenModel> SessionTokens => Set<SessionTokenModel>();
        public DbSet<AccountModel> Accounts => Set<AccountModel>();

        // Domain tables
        public DbSet<Place> Places => Set<Place>();
        public DbSet<PlaceTranslation> PlaceTranslations => Set<PlaceTranslation>();
        public DbSet<Dish> Dishes => Set<Dish>();
        public DbSet<DishTranslation> DishTranslations => Set<DishTranslation>();
        public DbSet<DishRelation> DishRelations => Set<DishRelation>();
        public DbSet<Combo> Combos => Set<Combo>();
        public DbSet<ComboTranslation> ComboTranslations => Set<ComboTranslation>();
        public DbSet<ComboDish> ComboDishes => Set<ComboDish>();
        public DbSet<MenuItem> MenuItems => Set<MenuItem>();
        public DbSet<MenuItemTranslation> MenuItemTranslations => Set<MenuItemTranslation>();

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var auditEntries = new List<AuditBaseModel>();

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is AuditBaseModel || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                    continue;

                var auditEntry = new AuditBaseModel
                {
                    TableName = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                    Action = entry.State.ToString().ToUpper(),
                    RecordId = entry.Properties.FirstOrDefault(c => c.Metadata.IsPrimaryKey())?.CurrentValue?.ToString() ?? ""
                };

                var oldValues = new Dictionary<string, object?>();
                var newValues = new Dictionary<string, object?>();

                foreach (var property in entry.Properties)
                {
                    string propertyName = property.Metadata.Name;

                    switch (entry.State)
                    {
                        case EntityState.Added:
                            newValues[propertyName] = property.CurrentValue;
                            break;
                        case EntityState.Deleted:
                            oldValues[propertyName] = property.OriginalValue;
                            break;
                        case EntityState.Modified:
                            if (property.IsModified)
                            {
                                oldValues[propertyName] = property.OriginalValue;
                                newValues[propertyName] = property.CurrentValue;
                            }
                            break;
                    }
                }

                auditEntry.OldVal = oldValues.Count == 0 ? null : JsonSerializer.Serialize(oldValues);
                auditEntry.NewVal = newValues.Count == 0 ? null : JsonSerializer.Serialize(newValues);

                auditEntries.Add(auditEntry);
            }

            if (auditEntries.Any())
            {
                AuditLogs.AddRange(auditEntries);
            }

            return await base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Place -> PlaceTranslation (1:N)
            modelBuilder.Entity<Place>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Latitude).IsRequired();
                entity.Property(e => e.Longitude).IsRequired();
                entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
                entity.Property(e => e.PriceRange).HasMaxLength(50);
                entity.Property(e => e.Status).HasDefaultValue(true);

                entity.HasMany(e => e.Translations)
                    .WithOne(t => t.Place)
                    .HasForeignKey(t => t.PlaceId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(e => e.Dishes)
                    .WithOne(d => d.Place)
                    .HasForeignKey(d => d.PlaceId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PlaceTranslation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LanguageCode).HasMaxLength(10).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.AudioUrl).HasMaxLength(500);

                entity.HasIndex(e => new { e.PlaceId, e.LanguageCode }).IsUnique();
            });

            // Dish -> DishTranslation (1:N)
            modelBuilder.Entity<Dish>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.BasePrice).HasPrecision(18, 2);
                entity.Property(e => e.DietaryTags).HasMaxLength(500);

                entity.HasMany(e => e.Translations)
                    .WithOne(t => t.Dish)
                    .HasForeignKey(t => t.DishId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<DishTranslation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LanguageCode).HasMaxLength(10).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(2000);

                entity.HasIndex(e => new { e.DishId, e.LanguageCode }).IsUnique();
            });

            // DishRelation: self-referencing M:N (RESTRICT to avoid multiple cascade paths)
            modelBuilder.Entity<DishRelation>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => new { e.PrimaryDishId, e.RelatedDishId }).IsUnique();

                entity.HasOne(e => e.PrimaryDish)
                    .WithMany()
                    .HasForeignKey(e => e.PrimaryDishId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.RelatedDish)
                    .WithMany()
                    .HasForeignKey(e => e.RelatedDishId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Combo -> ComboTranslation (1:N), Combo -> Place (N:1)
            modelBuilder.Entity<Combo>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.BasePrice).HasPrecision(18, 2);

                entity.HasOne(e => e.Place)
                    .WithMany()
                    .HasForeignKey(e => e.PlaceId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(e => e.Translations)
                    .WithOne(t => t.Combo)
                    .HasForeignKey(t => t.ComboId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(e => e.ComboDishes)
                    .WithOne(cd => cd.Combo)
                    .HasForeignKey(cd => cd.ComboId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ComboTranslation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.LanguageCode).HasMaxLength(10).IsRequired();
                entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(2000);

                entity.HasIndex(e => new { e.ComboId, e.LanguageCode }).IsUnique();
            });

            // ComboDish: junction M:N between Combo and Dish
            modelBuilder.Entity<ComboDish>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => new { e.ComboId, e.DishId }).IsUnique();

                entity.HasOne(e => e.Dish)
                    .WithMany()
                    .HasForeignKey(e => e.DishId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Account
            modelBuilder.Entity<AccountModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).HasMaxLength(100).IsRequired();
                entity.HasIndex(e => e.Username).IsUnique();
            });

            // SessionToken -> Account (N:1)
            modelBuilder.Entity<SessionTokenModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Account)
                    .WithMany()
                    .HasForeignKey(e => e.AccountId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}