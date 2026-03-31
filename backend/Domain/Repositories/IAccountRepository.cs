using System.Threading.Tasks;
using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IAccountRepository
    {
        Task<Account?> GetByUsernameAsync(string username);
    }
}
