#nullable enable
using System;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;

namespace SmartGrow.Function {

    public static class Photos {

        public static async Task<string> Upload(string photo, string? prefix) {
            Byte[] bitmapData = Convert.FromBase64String(photo);
            string photoName = $"{prefix}-{DateTime.Now.ToString("dd-MM-yyyy hh:mm:ss-fff")}.jpg";
            BlobClient client = new BlobClient(Environment.GetEnvironmentVariable("AzureStorageConnectionString"), containerName, photoName);
            await client.UploadAsync(new MemoryStream(bitmapData));
            return photoName;
        }

        public static async Task Delete(string photo) {
            BlobContainerClient bc = new BlobContainerClient(Environment.GetEnvironmentVariable("AzureStorageConnectionString"), containerName);
            await bc.DeleteBlobIfExistsAsync(photo);
        }

        public static bool ValidateBase64(string base64) {
            Span<byte> buffer = new Span<byte>(new byte[base64.Length]);
            return Convert.TryFromBase64String(base64, buffer , out int _);
        }

        public static readonly string DefaultRoomPhoto = "Room-default.jpg";

        public static readonly string DefaultPlantPhoto = "Plant-default.jpg";

        private static readonly string containerName = "photos";
    }
}