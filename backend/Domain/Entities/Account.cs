using BCrypt.Net;
using TourGuideBackend.Config;

namespace TourGuideBackend.Domain.Entities
{
    public class Account
    {
        public string Username { get; }
        public string PasswordHash { get; }
        public string Role { get; }

        public Account(string username, string passwordHash, string role)
        {
            Username = username;
            PasswordHash = passwordHash;
            Role = role;
        }

        public static Account Create(string username, string password, string role)
        {
            var hashedPassword = HashPassword(password);
            return new Account(username, hashedPassword, role);
        }

        public bool VerifyPassword(string reqPass)
        {
            return BCrypt.Net.BCrypt.Verify(reqPass, PasswordHash);
        }

        internal static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }
    }
}