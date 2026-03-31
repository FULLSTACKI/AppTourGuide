using System.Threading.Tasks;
using TourGuideBackend.Infrastructure.Persistence.Models;

namespace TourGuideBackend.Domain.Repositories
{
    public interface ISessionTokenRepository
    {
        Task<SessionTokenModel> CreateAsync(string username, string token, int expireMinutes);
        Task<SessionTokenModel?> GetByTokenAsync(string token);
        Task DeleteAsync(string token);
        Task RefreshTokenAsync();
    }
}
