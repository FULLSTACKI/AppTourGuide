using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Infrastructure.Persistence;
using TourGuideBackend.Domain.Repositories;
using TourGuideBackend.Infrastructure.Persistence.Repositories;
using TourGuideBackend.Infrastructure.ExternalServices;
using TourGuideBackend.Application.Services;
using TourGuideBackend.Middleware;
using TourGuideBackend.Domain.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();

// Auth filter (for [ServiceFilter(typeof(RequireAuthFilter))])
builder.Services.AddScoped<RequireAuthFilter>();

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var dbUrl = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Host=localhost;Database=tourguide;Username=postgres;Password=postgres";
    options.UseNpgsql(dbUrl);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Infrastructure repositories
builder.Services.AddScoped<IAuditRepository, AuditRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<ISessionTokenRepository, SessionTokenRepository>();
builder.Services.AddScoped<IPlaceCommandRepository, PlaceCommandRepository>();
builder.Services.AddScoped<IPlaceQueryRepository, PlaceQueryRepository>();
builder.Services.AddScoped<IDishCommandRepository, DishCommandRepository>();
builder.Services.AddScoped<IDishQueryRepository, DishQueryRepository>();
builder.Services.AddScoped<ITranslateService, TranslateService>();
builder.Services.AddScoped<IStorageService, StorageService>();
builder.Services.AddScoped<ICurrencyExchangeService, CurrencyExchangeService>();
builder.Services.AddScoped<IMenuItemCommandRepository, MenuItemCommandRepository>();
builder.Services.AddScoped<IMenuItemQueryRepository, MenuItemQueryRepository>();
builder.Services.AddScoped<IComboQueryRepository, ComboQueryRepository>();

// Application services
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<PlaceCommandService>();
builder.Services.AddScoped<PlaceQueryService>();
builder.Services.AddScoped<DishCommandService>();
builder.Services.AddScoped<DishQueryService>();
builder.Services.AddScoped<MenuItemQueryService>();
builder.Services.AddScoped<MenuItemCommandService>();
builder.Services.AddScoped<ComboQueryService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        dbContext.Database.Migrate();
        Console.WriteLine("Database migrated successfully.");

        await DatabaseSeeder.SeedAsync(dbContext);
        Console.WriteLine("Database seeded successfully.");
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

app.UseCors("AllowReact");

app.UseHttpsRedirection();

// Custom session-token authentication middleware
app.UseMiddleware<TokenAuthMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();