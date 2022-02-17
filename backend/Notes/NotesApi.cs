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

    public static class NotesApi {

        [FunctionName("GetNotes")]
        public static async Task<IActionResult> GetNotes([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "notes")] HttpRequest req, ILogger log) {
            // Check if token is valid
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid) {
                return new UnauthorizedResult();
            }

            string? plantId = req.Query["plantID"];
            List<GetNoteDto> notes = new List<GetNoteDto>();

            // try getting notes
            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = @"SELECT 
                                        n.*,
                                        (SELECT p.roomId from Plants p WHERE p.ID = n.plantID) as roomID
                                    FROM Notes n, Plants p, Rooms r
                                    WHERE
                                        n.plantID = COALESCE(@plantID, n.plantID) AND n.plantID = p.ID AND roomID = r.ID AND r.userID = @userID";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@userID", auth.Id);
                    command.Parameters.AddWithValue("@plantID", string.IsNullOrEmpty(plantId) ? (object)DBNull.Value : plantId);
                    var reader = await command.ExecuteReaderAsync();
                    while(reader.Read()) {
                        GetNoteDto noteDto = new GetNoteDto() {
                            Id = (int) reader["ID"],
                            Text = reader["text"].ToString(),
                            PlantId = (int) reader["plantId"],
                            RoomId = (int) reader["roomId"]
                        };
                        notes.Add(noteDto);
                    }
                }
            } catch {
                return new StatusCodeResult(500);
            }
            return new OkObjectResult(notes);
        }

        [FunctionName("CreateNote")]
        public static async Task<IActionResult> CreateNote([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "notes")] HttpRequest req, ILogger log) {
            // Check if token is valid
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid) {
                return new UnauthorizedResult();
            }

            // Reading from body
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            InputNoteDto inputNoteDto;

            try {
                inputNoteDto = JsonConvert.DeserializeObject<InputNoteDto>(requestBody);
            } catch (Exception) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "notes.error.invalidJsonData" });
            }

            if(!isValid(inputNoteDto)) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "notes.error.invalidInput" });
            }

            // try inserting note
            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = "INSERT INTO Notes(text, plantID) VALUES (@text, @plantID)";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@text", inputNoteDto.Text);
                    command.Parameters.AddWithValue("@plantID", inputNoteDto.PlantId);
                    await command.ExecuteNonQueryAsync();
                }
            } catch {
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(new Response { Status = "Success", Message = "notes.success.created" });

        }

        [FunctionName("UpdateNote")]
        public static async Task<IActionResult> UpdateNote([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "notes/{id}")] HttpRequest req, ILogger log, string id) {
            // Check if token is valid
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid) {
                return new UnauthorizedResult();
            }

            // Reading from body
            var requsetBody = await new StreamReader(req.Body).ReadToEndAsync();
            UpdateNoteDto updateNoteDto;
            bool noteExists = false;

            try {
                updateNoteDto = JsonConvert.DeserializeObject<UpdateNoteDto>(requsetBody);
            } catch (Exception) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "notes.error.invalidJsonData" });
            }

            if(!isValid(updateNoteDto)) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "notes.error.invalidInput" });
            }

            // try updating note
            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();

                    // check if note exists
                    var query = $"SELECT * FROM Notes WHERE ID = {id}";
                    SqlCommand command = new SqlCommand(query, connection);
                    SqlDataReader sdr = command.ExecuteReader();
                    if (sdr.Read())
                    {
                        noteExists = true;
                    } 
                    connection.Close();

                    // if note exists update it
                    if (noteExists) {
                        connection.Open();
                        string queryUpdate = "UPDATE Notes SET text = @text WHERE ID = @ID";
                        SqlCommand commandUpdate = new SqlCommand(queryUpdate, connection);
                        commandUpdate.Parameters.AddWithValue("@text", updateNoteDto.Text);
                        commandUpdate.Parameters.AddWithValue("@ID", id);
                        await commandUpdate.ExecuteNonQueryAsync();
                    } else {
                        return new OkObjectResult(new Response { Status = "Failure", Message = "notes.failure.notFound" });
                    }
                }
            } catch {
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(new Response { Status = "Success", Message = "notes.success.updated" });
        }

        [FunctionName("DeleteNote")]
        public static async Task<IActionResult> DeleteNote([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "notes/{id}")] HttpRequest req, ILogger log, string id) {
            // Check if token is valid
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid) {
                return new UnauthorizedResult();
            }                

            bool noteExists = false;

            // try deleting note
            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();

                    // check if note exists
                    var query = $"SELECT * FROM Notes WHERE id = {id}";
                    SqlCommand command = new SqlCommand(query, connection);
                    SqlDataReader sdr = command.ExecuteReader();
                    if (sdr.Read())
                    {
                        noteExists = true;
                    }
                    connection.Close();

                    // if note exists delete it
                    if(noteExists) {
                        connection.Open();
                        string queryDelete = $"DELETE FROM Notes WHERE ID = {id}";
                        SqlCommand commandDelete = new SqlCommand(queryDelete, connection);
                        await commandDelete.ExecuteNonQueryAsync();
                    } else {
                        return new OkObjectResult(new Response { Status = "Failure", Message = "notes.failure.notFound" });
                    }

                }
            } catch {
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(new Response { Status = "Success", Message = "notes.success.deleted" });
        }

        // check if input dto is valid
        private static bool isValid(InputNoteDto inputNoteDto) {
            if(string.IsNullOrEmpty(inputNoteDto.Text)) {
                return false;
            }

            if(!validPlant(inputNoteDto.PlantId)) {
                return false;
            }

            return true;
        }

        // check if update dto is valid
        private static bool isValid(UpdateNoteDto updateNoteDto) {
            if (string.IsNullOrEmpty(updateNoteDto.Text)) {
                return false;
            }
            return true;
        }

        // check if plant exists
        private static bool validPlant(int plantId) {
            int count = 0;
            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    string query = $"SELECT count(1) FROM Plants WHERE ID = {plantId}";
                    SqlCommand command = new SqlCommand(query, connection);
                    count = (int) command.ExecuteScalar();
                    connection.Close();
                }
            } catch {
                return false;
            }
            return count > 0;
        }
    }
}