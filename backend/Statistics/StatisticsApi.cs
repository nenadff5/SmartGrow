using System;
using System.IO;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace SmartGrow.Function {
    public static class StatisticsApi {
        [FunctionName("GetStatistic")]
        public static async Task<IActionResult> GetStatistic([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "statistics")] HttpRequest req, ILogger log) {
            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    var query = @"SELECT * FROM Statistic";
                    SqlCommand command = new SqlCommand(query, connection);
                    var reader = await command.ExecuteReaderAsync();
                    reader.Read();
                    var statistics = new {
                        plantsCount = (Int32)reader["plantsCount"],
                        usersCount = (Int32)reader["usersCount"],
                        roomsCount = (Int32)reader["roomsCount"],
                        notificationsCount = (Int32)reader["notificationsCount"],
                    };
                    return new OkObjectResult(statistics);
                }
            } catch (Exception e) {
                log.LogError(e.Message);
                return new StatusCodeResult(500);
            }
        }

        [FunctionName("UpdateStatistic")]
        public static void UpdateStatistic([TimerTrigger("0 0 * * * *")] TimerInfo timer, ILogger log) {
            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    var query = @"UPDATE 
                                    Statistic 
                                SET
                                    plantsCount = (SELECT count(1) FROM Plants),
                                    usersCount = (SELECT count(1) FROM Users),
                                    roomsCount = (SELECT count(1) FROM Rooms)";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.ExecuteNonQuery();
                }
            } catch (Exception e) {
                log.LogError(e.Message);
            }
        }

        [FunctionName("IncrementNotifications")]
        public static void IncrementNotifications([HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "increment-notifications")] HttpRequest req, ILogger log) {
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid) return;
            try{
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    var query = @"UPDATE
                                    Statistic
                                  SET
                                    notificationsCount = notificationsCount + 1";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.ExecuteNonQuery();
                }
            } catch (Exception e) {
                log.LogError(e.Message);
            }
        }
    }
}
