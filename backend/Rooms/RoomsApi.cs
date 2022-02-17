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
using System.Linq;

namespace SmartGrow.Function {

    public static class RoomsApi {

        [FunctionName("GetRooms")]
        public static async Task<IActionResult> GetRooms([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "rooms")] HttpRequest req, ILogger log) {
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid) return new UnauthorizedResult();

            List<RoomDto> rooms = new List<RoomDto>();
            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = @"SELECT 
                                        r.*,
                                        (SELECT count(1) FROM Plants p WHERE p.roomID = r.ID) as plantsCount,
                                        (SELECT count(1) FROM Notes n, plants p WHERE n.plantID = p.ID and p.roomID = r.id) as notesCount,
                                        STUFF((SELECT ',' + CAST(ID as varchar) FROM Plants p WHERE p.roomID = r.ID FOR XML PATH ('')),1,1,'') as plants
                                    FROM
                                        Rooms r
                                    WHERE 
                                        r.userID = @userID";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("userID", auth.Id);
                    var reader = await command.ExecuteReaderAsync();
                    while(reader.Read()) {
                        RoomDto roomDto = new RoomDto() {
                            Id = (int) reader["ID"],
                            UserId = (int) reader["userID"],
                            Name = reader["name"].ToString(),
                            Photo = "https://storageaccountsmart8173.blob.core.windows.net/photos/" + reader["photo"].ToString(),
                            PlantsCount = (int) reader["plantsCount"],
                            NotesCount = (int) reader["notesCount"],
                            Plants = new List<int>()
                        };
                        // database returns ID's of plants as string seperated by comas
                        if(reader["plants"].ToString() != "") {
                            roomDto.Plants = reader["plants"].ToString()!.Split(',').Select(int.Parse).ToList();
                        }
                        rooms.Add(roomDto);
                    }
                }
            } catch (Exception e) {
                log.LogError(e.Message);
                return new StatusCodeResult(500);
            }
            
            return new OkObjectResult(rooms);    
        }

        [FunctionName("CreateRoom")]
        public static async Task<IActionResult> CreateRoom([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "rooms")] HttpRequest req, ILogger log) {
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid) return new UnauthorizedResult();

            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            InputRoomDto inputRoomDto = JsonConvert.DeserializeObject<InputRoomDto>(requestBody);

            if(!isValid(inputRoomDto)) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "rooms.error.invalidInput" });
            }

            string photo = Photos.DefaultRoomPhoto;
            if(!string.IsNullOrEmpty(inputRoomDto.Photo)) {
                photo = await Photos.Upload(inputRoomDto.Photo, auth.Id);
            }

            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = @"INSERT INTO Rooms(name, photo, userID) values (@name, @photo, @userID)";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@name", inputRoomDto.Name);
                    command.Parameters.AddWithValue("@photo", photo);
                    command.Parameters.AddWithValue("@userID",auth.Id);
                    await command.ExecuteNonQueryAsync();
                }
            } catch (Exception e) {
                log.LogError(e.Message);
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(new Response { Status = "Success", Message = "rooms.success.created" });
        }

        [FunctionName("UpdateRoom")]
        public static async Task<IActionResult> UpdateRoom([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "rooms/{id}")] HttpRequest req, ILogger log, string id) {
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid) return new UnauthorizedResult();
            
            var requsetBody = await new StreamReader(req.Body).ReadToEndAsync();
            InputRoomDto inputRoomDto = JsonConvert.DeserializeObject<InputRoomDto>(requsetBody);

            if(!isValid(inputRoomDto)) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "rooms.error.invalidInput" });
            }

            // if no photo was found that means that there is no Room with that id + user id
            string? currentPhoto = getCurrentPhoto(id, auth.Id);
            if(string.IsNullOrEmpty(currentPhoto)) {
                return new NotFoundObjectResult(new Response { Status = "Failure", Message = "rooms.error.notFound" });
            }

            string? photo = null;
            if(!string.IsNullOrEmpty(inputRoomDto.Photo)) {
                var uploading = Photos.Upload(inputRoomDto.Photo, auth.Id);
                if(currentPhoto != Photos.DefaultRoomPhoto) {
                    await Photos.Delete(currentPhoto);
                }
                photo = await uploading;
            }

            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = @"UPDATE Rooms SET name = @name, photo = COALESCE(@photo,photo) WHERE ID = @ID AND userID = @userID";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@name",inputRoomDto.Name);
                    command.Parameters.AddWithValue("@photo",string.IsNullOrEmpty(photo) ? (object)DBNull.Value : photo);
                    command.Parameters.AddWithValue("@ID",id);
                    command.Parameters.AddWithValue("@userID",auth.Id);
                    await command.ExecuteNonQueryAsync();
                }
            } catch (Exception e) {
                log.LogError(e.Message);
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(new Response { Status = "Success", Message = "rooms.success.updated" });
        }

        [FunctionName("DeleteRoom")]
        public static async Task<IActionResult> DeleteRoom([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "rooms/{id}")] HttpRequest req, ILogger log, string id) {
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid) return new UnauthorizedResult();

            // if no photo was found that means that there is no Room with that id + user id
            string? currentPhoto = getCurrentPhoto(id, auth.Id);
            if(string.IsNullOrEmpty(currentPhoto)) {
                return new NotFoundObjectResult(new Response { Status = "Failure", Message = "rooms.error.notFound" });
            }

            if(currentPhoto != Photos.DefaultRoomPhoto) {
                var deleting = Photos.Delete(currentPhoto);
            }

            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = @"DELETE FROM Rooms WHERE ID = @ID AND userID = @userID";
                    SqlCommand command = new SqlCommand(query,connection);
                    command.Parameters.AddWithValue("@ID",id);
                    command.Parameters.AddWithValue("@userID",auth.Id);
                    await command.ExecuteNonQueryAsync();
                }
            } catch (Exception e) {
                log.LogError(e.Message);
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(new Response { Status = "Success", Message = "rooms.success.deleted" });
        }

        private static string? getCurrentPhoto(string roomId, string userId) {
            try {
                Int32.Parse(roomId);
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = $"SELECT photo FROM Rooms WHERE ID = {roomId} AND userID = {userId}";
                    SqlCommand command = new SqlCommand(query,connection);
                    return command.ExecuteScalar().ToString();
                }
            } catch(Exception) {
                return null;
            }
        }

        private static bool isValid(InputRoomDto inputRoomDto) {
            if(string.IsNullOrEmpty(inputRoomDto.Name)) {
                return false;
            }

            if(inputRoomDto.Name.Length > 50) {
                return false;
            }

            if(!string.IsNullOrEmpty(inputRoomDto.Photo)) {
                if(!Photos.ValidateBase64(inputRoomDto.Photo)) {
                    return false;
                }

                // allowing max size of a photo to be 2MB
                if(inputRoomDto.Photo.Length > 2796203) {
                    return false;
                }
            }

            return true;
        }
    }
}