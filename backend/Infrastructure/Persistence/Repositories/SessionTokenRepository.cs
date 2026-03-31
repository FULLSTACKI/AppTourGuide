using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Repositories;
using TourGuideBackend.Infrastructure.Persistence.Models;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class SessionTokenRepository : ISessionTokenRepository
    {
        private readonly AppDbContext _db;

        public SessionTokenRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<SessionTokenModel> CreateAsync(string username, string token, int expireMinutes)
        {
            var now = DateTime.UtcNow;
            // Resolve account id from username
            var account = await _db.Accounts.FirstOrDefaultAsync(a => a.Username == username);
            if (account == null) throw new ArgumentException($"Account not found: {username}");

            var session = new SessionTokenModel
            {
                Token = token,
                AccountId = account.Id,
                CreatedAt = now,
                ExpiresAt = now.AddMinutes(expireMinutes)
            };
            _db.Set<SessionTokenModel>().Add(session);
            await _db.SaveChangesAsync();
            return session;
        }

        public async Task<SessionTokenModel?> GetByTokenAsync(string token)
        {
            return await _db.Set<SessionTokenModel>().FirstOrDefaultAsync(t => t.Token == token);
        }

        public async Task DeleteAsync(string token)
        {
            var s = await GetByTokenAsync(token);
            if (s != null)
            {
                _db.Set<SessionTokenModel>().Remove(s);
                await _db.SaveChangesAsync();
            }
        }

        public Task RefreshTokenAsync()
        {
            // Placeholder: original interface had a refresh operation with parameters.
            return Task.CompletedTask;
        }
    }
}
