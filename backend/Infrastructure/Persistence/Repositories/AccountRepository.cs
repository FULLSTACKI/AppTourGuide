using Microsoft.EntityFrameworkCore;
using TourGuideBackend.Domain.Entities;
using TourGuideBackend.Domain.Repositories;
using TourGuideBackend.Infrastructure.Persistence.Models;

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly AppDbContext _dbContext;

        public AccountRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Account?> GetByUsernameAsync(string username)
        {
            var accountModel = await _dbContext.Accounts
                .FirstOrDefaultAsync(a => a.Username == username);

            if (accountModel == null)
                return null;

            return new Account(
                accountModel.Username,
                accountModel.Password,
                accountModel.Role
            );
        }
    }
}
