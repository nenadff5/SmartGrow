#nullable enable
using System;
using System.IO;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace SmartGrow.Function {

    public static class PlantsApi {

        [FunctionName("GetPlants")]
        public static async Task<IActionResult> GetPlants([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "plants")] HttpRequest req, ILogger log) {
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if(!auth.IsValid) return new UnauthorizedResult();

            string? roomId = req.Query["roomID"];

            List<PlantDto> plants = new List<PlantDto>();
            try {
                if(roomId != null) Int32.Parse(roomId);
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = @"SELECT
                                        p.*
                                    FROM
                                        Plants p,
                                        Rooms r
                                    WHERE
                                        p.roomID = COALESCE(@roomID, p.roomID) AND p.roomID = r.ID AND r.userID = @userID";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@userID", auth.Id);
                    command.Parameters.AddWithValue("@roomID", string.IsNullOrEmpty(roomId) ? (object)DBNull.Value : roomId);
                    var reader = await command.ExecuteReaderAsync();
                    while(reader.Read()) {
                        PlantDto plantDto = new PlantDto() {
                            Id = (int) reader["ID"],
                            Name = reader["name"].ToString(),
                            Photo = "https://storageaccountsmart8173.blob.core.windows.net/photos/" + reader["photo"].ToString(),
                            RoomId = (int) reader["roomID"]
                        };
                        plants.Add(plantDto);
                    }
                }
            } catch (FormatException) {
                return new BadRequestObjectResult(new Response{ Status = "Failure", Message = "plants.error.invalidRoomIdFormat" });
            } catch (Exception e) {
                log.LogError(e.Message);
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(plants);
        }

        [FunctionName("CreatePlant")]
        public static async Task<IActionResult> CreatePlant([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "plants")] HttpRequest req, ILogger log) {
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if(!auth.IsValid) return new UnauthorizedResult();

            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            InputPlantDto inputPlantDto;

            try {
                inputPlantDto = JsonConvert.DeserializeObject<InputPlantDto>(requestBody);
            } catch (Exception) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "plants.error.invalidJsonData" });
            }

            if(!isValid(inputPlantDto, auth.Id)) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "plants.error.invalidInput" });
            }

            string photo = Photos.DefaultPlantPhoto;
            if(!string.IsNullOrEmpty(inputPlantDto.Photo)) {
                photo = await Photos.Upload(inputPlantDto.Photo, auth.Id);
            }

            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = "INSERT INTO Plants(name, photo, roomID) VALUES (@name, @photo, @roomID)";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@name", inputPlantDto.Name);
                    command.Parameters.AddWithValue("@photo", photo);
                    command.Parameters.AddWithValue("@roomID", inputPlantDto.RoomId);
                    await command.ExecuteNonQueryAsync();
                }
            } catch (Exception e) {
                log.LogError(e.Message);
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(new Response { Status = "Success", Message = "plants.success.created" });

        }

        [FunctionName("UpdatePlant")]
        public static async Task<IActionResult> UpdatePlant([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "plants/{id}")] HttpRequest req, ILogger log, string id) {
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if(!auth.IsValid) return new UnauthorizedResult();

            var requsetBody = await new StreamReader(req.Body).ReadToEndAsync();
            InputPlantDto inputPlantDto;

            try {
                inputPlantDto = JsonConvert.DeserializeObject<InputPlantDto>(requsetBody);
            } catch (Exception) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "plants.error.invalidJsonData" });
            }

            if(!isValid(inputPlantDto, auth.Id)) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "plants.error.invalidInput" });
            }

            // if no photo was found that means that there is no Plant with that id + user id
            string? currentPhoto = getCurrentPhoto(id, auth.Id);
            if(string.IsNullOrEmpty(currentPhoto)) {
                return new NotFoundObjectResult(new Response { Status = "Failure", Message = "plants.error.notFound" });
            }

            string? photo = null;
            if(!string.IsNullOrEmpty(inputPlantDto.Photo)) {
                var uploading = Photos.Upload(inputPlantDto.Photo, auth.Id);
                if(currentPhoto != Photos.DefaultPlantPhoto) {
                    await Photos.Delete(currentPhoto);
                }
                photo = await uploading;
            }

            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = "UPDATE Plants SET name = @name, photo = COALESCE(@photo,photo), roomID = @roomID WHERE ID = @ID";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@name", inputPlantDto.Name);
                    command.Parameters.AddWithValue("@photo", string.IsNullOrEmpty(photo) ? (object)DBNull.Value : photo);
                    command.Parameters.AddWithValue("@roomID", inputPlantDto.RoomId);
                    command.Parameters.AddWithValue("@ID", id);
                    await command.ExecuteNonQueryAsync();
                }
            } catch (Exception e) {
                log.LogError(e.Message);
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(new Response { Status = "Success", Message = "plants.success.updated" });
        }

        [FunctionName("DeletePlant")]
        public static async Task<IActionResult> DeletePlant([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "plants/{id}")] HttpRequest req, ILogger log, string id) {
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if(!auth.IsValid) return new UnauthorizedResult();

            // if no photo was found that means that there is no Plant with that id + user id
            string? currentPhoto = getCurrentPhoto(id, auth.Id);
            if(string.IsNullOrEmpty(currentPhoto)) {
                return new NotFoundObjectResult(new Response { Status = "Failure", Message = "plants.error.notFound" });
            }

            if(currentPhoto != Photos.DefaultPlantPhoto) {
                var deleting = Photos.Delete(currentPhoto);
            }

            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = $"DELETE FROM Plants WHERE ID = {id}";
                    SqlCommand command = new SqlCommand(query, connection);
                    await command.ExecuteNonQueryAsync();
                }
            } catch (Exception e) {
                log.LogError(e.Message);
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(new Response { Status = "Success", Message = "plants.success.deleted" });
        }

        private static string? getCurrentPhoto(string plantId, string userId) {
            try {
                Int32.Parse(plantId);
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = $@"SELECT 
                                        p.photo 
                                    FROM 
                                        Plants p,
                                        Rooms r 
                                    WHERE 
                                        p.roomID = r.ID AND r.userID = {userId} AND p.ID = {plantId}";
                    SqlCommand command = new SqlCommand(query, connection);
                    return command.ExecuteScalar().ToString();
                }
            } catch (Exception) {
                return null;
            }
        }

        private static bool isValid(InputPlantDto inputPlantDto, string userId) {
            if(string.IsNullOrEmpty(inputPlantDto.Name)) {
                return false;
            }

            if(inputPlantDto.Name.Length > 50) {
                return false;
            }

            if(!string.IsNullOrEmpty(inputPlantDto.Photo)) {
                if(!Photos.ValidateBase64(inputPlantDto.Photo)) {
                    return false;
                }

                // allowing max size of a photo to be 2MB
                if(inputPlantDto.Photo.Length > 2796203) {
                    return false;
                }
            }

            if(!validRoom(inputPlantDto.RoomId, userId)) {
                return false;
            }

            return true;
        }

        private static bool validRoom(int roomId, string userId) {
            int count = 0;
            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = $"SELECT count(1) FROM Rooms WHERE ID = {roomId} and userID = {userId}";
                    SqlCommand command = new SqlCommand(query, connection);
                    count = (int) command.ExecuteScalar();
                }
            } catch (Exception) {
                return false;
            }
            return count > 0;
        }
    }
}