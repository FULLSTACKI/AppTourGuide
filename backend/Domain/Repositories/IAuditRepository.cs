using System.Threading.Tasks;
using TourGuideBackend.Infrastructure.Persistence.Models;

namespace TourGuideBackend.Domain.Repositories
{
    public interface IAuditRepository
    {
        Task<List<AuditBaseModel>> GetHistoryAsync(string tableName, string recordId);
    }
}