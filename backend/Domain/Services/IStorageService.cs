namespace TourGuideBackend.Domain.Repositories
{
    /// <summary>
    /// Abstraction for cloud file storage operations.
    /// Infrastructure implementations may target Firebase Storage, Azure Blob, AWS S3, etc.
    /// </summary>
    public interface IStorageService
    {
        /// <summary>
        /// Uploads a file stream to cloud storage and returns the publicly accessible URL.
        /// </summary>
        /// <param name="fileStream">The raw file stream to upload.</param>
        /// <param name="fileName">The destination object name (including any virtual path prefix).</param>
        /// <param name="contentType">MIME type of the file (e.g. "image/jpeg").</param>
        /// <returns>The public download URL of the uploaded object.</returns>
        Task<string> SaveCloudAsync(Stream fileStream, string fileName, string contentType);
    }
}
