using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;
using TourGuideBackend.Domain.Repositories; // Thay bằng namespace chứa IStorageService của bạn

namespace TourGuideBackend.Infrastructure.Persistence.Repositories
{
    public class StorageService : IStorageService
    {
        private readonly Cloudinary _cloudinary;

        public StorageService(IConfiguration config)
        {
            // Lấy thông tin từ appsettings.json
            var cloudName = config["Cloudinary:CloudName"] ?? throw new ArgumentNullException("Cloudinary CloudName is missing");
            var apiKey = config["Cloudinary:ApiKey"] ?? throw new ArgumentNullException("Cloudinary ApiKey is missing");
            var apiSecret = config["Cloudinary:ApiSecret"] ?? throw new ArgumentNullException("Cloudinary ApiSecret is missing");

            // Khởi tạo tài khoản Cloudinary
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true; // Bắt buộc dùng HTTPS
        }

        public async Task<string> SaveCloudAsync(Stream fileStream, string fileName, string contentType)
        {
            if (fileStream == null || fileStream.Length == 0)
                throw new ArgumentException("File stream is empty.");

            // Tạo tên file ngẫu nhiên (không có đuôi mở rộng, Cloudinary tự lo)
            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(fileName)}";

            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(uniqueFileName, fileStream),
                PublicId = uniqueFileName, // Tên file lưu trên mây
                Folder = "tourguide_images", // Thư mục trên Cloudinary (tùy chọn)
                Overwrite = true
            };

            // Đẩy luồng dữ liệu lên Cloudinary
            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new Exception($"Lỗi upload ảnh lên Cloudinary: {uploadResult.Error.Message}");
            }

            // Trả về đường link ảnh bảo mật (HTTPS)
            return uploadResult.SecureUrl.ToString();
        }
    }
}