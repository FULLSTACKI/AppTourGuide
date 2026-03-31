using System;
using System.Threading.Tasks;
using TourGuideBackend.Application.DTOs.Auth;
using TourGuideBackend.Domain.Repositories;
using TourGuideBackend.Domain.Entities;

namespace TourGuideBackend.Application.Services
{
    public class AccountService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly ISessionTokenRepository _tokenRepository;

        public AccountService(IAccountRepository accountRepository, ISessionTokenRepository tokenRepository)
        {
            _accountRepository = accountRepository;
            _tokenRepository = tokenRepository;
        }

        public async Task<string> CreateTokenAsync(string username)
        {
            try
            {
                var token = Guid.NewGuid().ToString();
                await _tokenRepository.CreateAsync(username, token, 60);
                return token;
            }
            catch (Exception e)
            {
                throw new Exception($"TOKEN_CREATION_FAILED: {e.Message}");
            }
        }

        public async Task<string> RefreshTokenAsync(string token)
        {
            try
            {
                await _tokenRepository.RefreshTokenAsync();
                return token;
            }
            catch (Exception e)
            {
                throw new Exception($"TOKEN_REFRESH_FAILED: {e.Message}");
            }
        }

        public async Task<Account?> GetCurrentUserAsync(string token)
        {
            try
            {
                var session = await _tokenRepository.GetByTokenAsync(token);
                if (session == null) throw new Exception("INVALID_TOKEN: Token is invalid or expired");

                var usernameProp = session.GetType().GetProperty("Username");
                var expiresProp = session.GetType().GetProperty("ExpiresAt");
                var username = usernameProp?.GetValue(session)?.ToString();

                if (expiresProp?.GetValue(session) is DateTime expiresAt && expiresAt < DateTime.UtcNow)
                {
                    await _tokenRepository.DeleteAsync(token);
                    throw new Exception("TOKEN_EXPIRED: Session expired");
                }

                if (string.IsNullOrEmpty(username))
                {
                    await _tokenRepository.DeleteAsync(token);
                    throw new Exception("NOT_FOUND: Account does not exist");
                }

                var account = await _accountRepository.GetByUsernameAsync(username);
                if (account == null)
                {
                    await _tokenRepository.DeleteAsync(token);
                    throw new Exception("NOT_FOUND: Account does not exist");
                }

                return account;
            }
            catch (Exception e)
            {
                throw new Exception($"TOKEN_RETRIEVAL_FAILED: {e.Message}");
            }
        }

        public async Task<AccountResponseDto> LoginAsync(AccountLoginRequestDto req)
        {
            var account = await _accountRepository.GetByUsernameAsync(req.Username);
            if (account == null || !account.VerifyPassword(req.Password))
                throw new Exception("LOGIN_FAILED: Username or password is incorrect");

            var accessToken = await CreateTokenAsync(account.Username);

            return new AccountResponseDto
            {
                Success = true,
                Message = "Login successful",
                AccessToken = accessToken,
                ProfileCode = null,
                DisplayName = account.Username,
                Role = account.Role
            };
        }
    }
}
