using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Repositories;
using TourGuideBackend.Infrastructure.Persistence.Models;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class AuditRepository : IAuditRepository
    {
        private readonly AppDbContext _dbContext;

        public AuditRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<List<AuditBaseModel>> GetHistoryAsync(string tableName, string recordId)
        {
            return await _dbContext.AuditLogs.AsNoTracking().Where(x => x.TableName == tableName && x.RecordId == recordId).OrderByDescending(x => x.ChangedAt).ToListAsync();
        }
    }
}