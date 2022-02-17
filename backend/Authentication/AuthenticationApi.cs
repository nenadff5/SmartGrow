using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using System.Diagnostics;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace SmartGrow.Function
{

    public static class AuthenticationApi
    {

        // Function to register new user
        [FunctionName("Register")]
        public static async Task<IActionResult> Register([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "register")] HttpRequest req, ILogger log)
        {
            // Reading from body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var input = JsonConvert.DeserializeObject<RegisterUserDto>(requestBody);


            // Check if email is valid
            if (!IsValidEmail(input.Email))
            {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "auth.email.invalidFormat" });
            }

            // Check if passwords match
            if (input.Password != input.RePassword)
            {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "auth.password.mismatch" });
            }

            // Check if password is valid
            if (!IsValidPassword(input.Password))
            {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "auth.password.invalidFormat" });
            }

            try
            {
                // Connecting to database and creating a new user
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString")))
                {
                    connection.Open();
                    var query = @"INSERT INTO Users(name,email,password) VALUES (@name,@email,@password)";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@name", input.Name);
                    command.Parameters.AddWithValue("@email", input.Email);
                    command.Parameters.AddWithValue("@password", Encrypt(input.Password));
                    command.ExecuteNonQuery();
                }
            }
            catch
            {
                return new StatusCodeResult(500);
            }
            return new OkObjectResult(new Response { Status = "Success", Message = "auth.user.created" });

        }

        // Function to authenticate user and return access token
        [FunctionName("Login")]
        public static async Task<IActionResult> Login([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "login")] HttpRequest req, ILogger log)
        {
            // Reading from body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var input = JsonConvert.DeserializeObject<LoginUserDto>(requestBody);

            string password = "";
            bool userExists = false;
            AuthenticateUserDto user = null;

            try
            {
                // Connecting to database and searching for user
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString")))
                {
                    connection.Open();

                    var query = @"SELECT * FROM Users WHERE email = @email";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@email", input.Email);
                    SqlDataReader sdr = command.ExecuteReader();
                    // If user was found, prepare for token issuing
                    if (sdr.Read())
                    {
                        user = new AuthenticateUserDto(
                            (int)sdr["id"],
                            (string)sdr["email"],
                            (string)sdr["name"]);
                            
                        password = (string)sdr["password"];
                        userExists = true;
                    }
                    connection.Close();
                    // If user exists check password and issue a new access token
                    if (userExists)
                    {
                        if (password.Equals(Encrypt(input.Password)))
                        {
                            return new OkObjectResult(TokenIssuer.IssueTokenForUser(user));
                        }
                        else
                        {
                            return new BadRequestObjectResult(new Response { Status = "Failure", Message = "auth.password.incorrect" });
                        }
                    }
                    else
                    {
                        return new NotFoundObjectResult(new Response { Status = "Failure", Message = "auth.user.notFound" });
                    }
                }
            }
            catch {
                return new StatusCodeResult(500);
            }
        }

        // Function to update users password
        [FunctionName("UpdatePassword")]
        public static async Task<IActionResult> UpdatePassword([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "update-password")] HttpRequest req, ILogger log)
        {
            // Reading from body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var input = JsonConvert.DeserializeObject<UpdatePasswordUserDto>(requestBody);

            // Check if token is valid
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid)
            {
                return new UnauthorizedResult();
            }

            // Check if new passwords match
            if (input.NewPassword != input.ReNewPassword)
            {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "auth.password.mismatch" });
            }

            // Check if password is valid
            if (!IsValidPassword(input.NewPassword))
            {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "auth.password.invalidFormat" });
            }

            try
            {
                // Connecting to database and searching for user
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString")))
                {
                    connection.Open();

                    string password = "";
                    bool userExists = false;

                    var query = @"SELECT * FROM Users WHERE id = @id";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@id", auth.Id);
                    SqlDataReader sdr = command.ExecuteReader();
                    if (sdr.Read())
                    {
                        password = (string)sdr["password"];
                        userExists = true;
                    }
                    connection.Close();
                    // If user exists check password and prepare for updating his password
                    if (userExists)
                    {
                        if (password.Equals(Encrypt(input.Password)))
                        {
                            connection.Open();

                            var queryUpdate = @"UPDATE Users SET password = @password WHERE id = @Id";
                            SqlCommand commandUpdate = new SqlCommand(queryUpdate, connection);
                            commandUpdate.Parameters.AddWithValue("@id", auth.Id);
                            commandUpdate.Parameters.AddWithValue("@password", Encrypt(input.NewPassword));
                            commandUpdate.ExecuteNonQuery();

                            connection.Close();
                        }
                        else
                        {
                            return new BadRequestObjectResult(new Response { Status = "Failure", Message = "auth.password.incorrect" });

                        }
                    }
                    else
                    {
                        return new NotFoundObjectResult(new Response { Status = "Failure", Message = "auth.user.notFound" });
                    }
                }
            }
            catch
            {
                return new StatusCodeResult(500);
            }
            return new OkObjectResult(new Response { Status = "Success", Message = "auth.password.updated" });
        }

        // Function to update users profile
        [FunctionName("UpdateProfile")]
        public static async Task<IActionResult> UpdateProfile([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "update-profile")] HttpRequest req, ILogger log)
        {
            // Reading from body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var input = JsonConvert.DeserializeObject<UpdateUserDto>(requestBody);

            // Check if token is valid
            AuthenticationInfo auth = new AuthenticationInfo(req);
            if (!auth.IsValid)
            {
                return new UnauthorizedResult();
            }

            // Check if email is valid
            if (!IsValidEmail(input.Email))
            {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "auth.email.invalidFormat" });
            }

            try
            {
                // Connecting to database and searching for user
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString")))
                {
                    connection.Open();

                    bool userExists = false;

                    var query = @"SELECT * FROM Users WHERE id = @id";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@id", auth.Id);
                    SqlDataReader sdr = command.ExecuteReader();
                    if (sdr.Read())
                    {
                        userExists = true;
                    }
                    connection.Close();
                    // If user exists update his profile
                    if (userExists)
                    {
                        connection.Open();

                        var queryUpdate = @"UPDATE Users SET name = @name, email = @email WHERE id = @Id";
                        SqlCommand commandUpdate = new SqlCommand(queryUpdate, connection);
                        commandUpdate.Parameters.AddWithValue("@id", auth.Id);
                        commandUpdate.Parameters.AddWithValue("@name", input.Name);
                        commandUpdate.Parameters.AddWithValue("@email", input.Email);
                        commandUpdate.ExecuteNonQuery();

                        connection.Close();
                    }
                    else
                    {
                        return new NotFoundObjectResult(new Response { Status = "Failure", Message = "auth.user.notFound" });
                    }
                }
            }
            catch
            {
                return new StatusCodeResult(500);
            }
            return new OkObjectResult(new Response { Status = "Success", Message = "auth.user.updated" });
        }

        // Function to send email to reset password
        [FunctionName("ForgotPassword")]
        public static async Task<IActionResult> ForgotPassword([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "forgot-password")] HttpRequest req, ILogger log) {
            // Reading from body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var input = JsonConvert.DeserializeObject<ForgotPasswordUserDto>(requestBody);

            int userId;
            // Generate random reset code
            System.Random random = new System.Random();
            int resetCode = random.Next(1000, 9999);
            // Generate expiry time
            long expiry = DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds();
            
            var apiKey = Environment.GetEnvironmentVariable("SendGridKey");
            var client = new SendGridClient(apiKey);
            var from_email = new EmailAddress("smart.grow.mail@protonmail.com", "Smart Grow");
            var subject = "Reset code";
            var to_email = new EmailAddress(input.Email);
            var plainTextContent = "Your reset code is " + resetCode;
            var htmlContent = Constants.HTML1 + resetCode + Constants.HTML2;
            var msg = MailHelper.CreateSingleEmail(from_email, to_email, subject, plainTextContent, htmlContent);
            try {
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    var query = @"SELECT * FROM Users WHERE email = @email";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@email", input.Email);
                    SqlDataReader sdr = command.ExecuteReader();
                    if (sdr.Read()) {
                        userId = (int)sdr["id"]; ;
                    } else {
                        return new NotFoundObjectResult(new Response { Status = "Failure", Message = "auth.user.notFound" });
                    }
                    connection.Close(); 
                    connection.Open();
                    var queryResetCodes = @"SELECT * FROM ResetCodes WHERE userID = @id";
                    SqlCommand commandResetCodes = new SqlCommand(queryResetCodes, connection);
                    commandResetCodes.Parameters.AddWithValue("@id", userId);
                    SqlDataReader sdrResetCodes = commandResetCodes.ExecuteReader();
                    if (sdrResetCodes.Read()) {
                        connection.Close();
                        connection.Open();
                        var queryUpdate = @"UPDATE ResetCodes SET resetCode = @resetCode, expiry = @expiry WHERE userID = @id";
                        SqlCommand commandUpdate = new SqlCommand(queryUpdate, connection);
                        commandUpdate.Parameters.AddWithValue("@resetCode", resetCode);
                        commandUpdate.Parameters.AddWithValue("@expiry", expiry);
                        commandUpdate.Parameters.AddWithValue("@id", userId);
                        commandUpdate.ExecuteNonQuery();
                    } else {
                        connection.Close();
                        connection.Open();
                        string queryInsert = @"INSERT INTO ResetCodes(resetCode, expiry, userID) values (@resetCode, @expiry, @userID)";
                        SqlCommand commandInsert = new SqlCommand(queryInsert, connection);
                        commandInsert.Parameters.AddWithValue("@resetCode", resetCode);
                        commandInsert.Parameters.AddWithValue("@expiry", expiry);
                        commandInsert.Parameters.AddWithValue("@userID", userId);
                        await commandInsert.ExecuteNonQueryAsync();
                    }
                }
            } catch {
                return new StatusCodeResult(500);
            }

            try {
                var response = await client.SendEmailAsync(msg).ConfigureAwait(false);
            } catch {
                return new StatusCodeResult(500);
            }

            return new OkObjectResult(new Response { Status = "Success", Message = "auth.email.sent" });
        }

        // Function to reset users password
        [FunctionName("ResetPassword")]
        public static async Task<IActionResult> ResetPassword([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "reset-password")] HttpRequest req, ILogger log) {
            // Reading from body
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var input = JsonConvert.DeserializeObject<ResetPasswordUserDto>(requestBody);
            int userId;

            // Check if new passwords match
            if (input.NewPassword != input.ReNewPassword) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "auth.password.mismatch" });
            }

            // Check if password is valid
            if (!IsValidPassword(input.NewPassword)) {
                return new BadRequestObjectResult(new Response { Status = "Failure", Message = "auth.password.invalidFormat" });
            }

            try {
                // Connecting to database and searching for user
                using (SqlConnection connection = new SqlConnection(Environment.GetEnvironmentVariable("SqlConnectionString"))) {
                    connection.Open();
                    var queryFindUser = @"SELECT * FROM Users WHERE email = @email";
                    SqlCommand commandFindUser = new SqlCommand(queryFindUser, connection);
                    commandFindUser.Parameters.AddWithValue("@email", input.Email);
                    SqlDataReader sdrFindUser = commandFindUser.ExecuteReader();
                    if (sdrFindUser.Read()) {
                        userId = (int)sdrFindUser["id"]; ;
                    } else {
                        return new NotFoundObjectResult(new Response { Status = "Failure", Message = "auth.user.notFound" });
                    }
                    connection.Close();

                    int resetCode = 0;
                    int unixExpiry = 0;
                    bool codeExists = false;
                    bool userExists = false;

                    connection.Open();
                    var queryResetCodes = @"SELECT * FROM ResetCodes WHERE userID = @id";
                    SqlCommand commandResetCodes = new SqlCommand(queryResetCodes, connection);
                    commandResetCodes.Parameters.AddWithValue("@id", userId);
                    SqlDataReader sdrResetCodes = commandResetCodes.ExecuteReader();
                    if (sdrResetCodes.Read()) {
                        resetCode = (int)sdrResetCodes["resetCode"];
                        unixExpiry = (int)sdrResetCodes["expiry"];
                        codeExists = true;
                    }
                    if (codeExists) {
                        if (input.ResetCode != resetCode) {
                            connection.Close();
                            return new OkObjectResult(new Response { Status = "Failure", Message = "auth.resetCode.mismatch" });
                        }
                        if (UnixTimeStampToDateTime(Convert.ToDouble(unixExpiry)) < DateTime.UtcNow) {
                            connection.Open();
                            string queryExpired = @"DELETE FROM ResetCodes WHERE userID = @id";
                            SqlCommand commandExpired = new SqlCommand(queryExpired, connection);
                            commandExpired.Parameters.AddWithValue("@ID", userId);
                            await commandExpired.ExecuteNonQueryAsync();
                            connection.Close();
                            return new OkObjectResult(new Response { Status = "Failure", Message = "auth.resetCode.expired" });
                        }
                        connection.Close();
                        connection.Open();
                        var queryUser = @"SELECT * FROM Users WHERE id = @id";
                        SqlCommand commandUser = new SqlCommand(queryUser, connection);
                        commandUser.Parameters.AddWithValue("@id", userId);
                        SqlDataReader sdrUser = commandUser.ExecuteReader();
                        if (sdrUser.Read()) {
                            userExists = true;
                        }
                        // If user exists prepare for updating his password
                        if (userExists) {
                            connection.Close();
                            connection.Open();
                            var queryUpdate = @"UPDATE Users SET password = @password WHERE id = @id";
                            SqlCommand commandUpdate = new SqlCommand(queryUpdate, connection);
                            commandUpdate.Parameters.AddWithValue("@id", userId);
                            commandUpdate.Parameters.AddWithValue("@password", Encrypt(input.NewPassword));
                            commandUpdate.ExecuteNonQuery();
                            connection.Close();
                        } else {
                            connection.Close();
                            return new NotFoundObjectResult(new Response { Status = "Failure", Message = "auth.user.notFound" });
                        }
                        connection.Open();
                        string query = @"DELETE FROM ResetCodes WHERE userID = @id";
                        SqlCommand command = new SqlCommand(query, connection);
                        command.Parameters.AddWithValue("@ID", userId);
                        await command.ExecuteNonQueryAsync();
                    } else {
                        connection.Close();
                        return new NotFoundObjectResult(new Response { Status = "Failure", Message = "auth.resetCode.notFound" });
                    }
                }
            } catch {
                return new StatusCodeResult(500);
            }
            return new OkObjectResult(new Response { Status = "Success", Message = "auth.password.updated" });
        }

        public static string Encrypt(string encryptString)
        {
            string EncryptionKey = Environment.GetEnvironmentVariable("EncryptionKey");
            byte[] clearBytes = Encoding.Unicode.GetBytes(encryptString);

            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] {
                    0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76
                 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);
                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(clearBytes, 0, clearBytes.Length);
                        cs.Close();
                    }
                    encryptString = Convert.ToBase64String(ms.ToArray());
                }
            }
            return encryptString;
        }

        // check if email is valid
        public static bool IsValidEmail(string email)
        {
            return new EmailAddressAttribute().IsValid(email);
        }

        // check if password is valid
        private static bool IsValidPassword(string password)
        {
            var input = password;

            if (string.IsNullOrWhiteSpace(input))
            {
                throw new Exception("Password should not be empty");
            }
            
            var hasNumber = new Regex(@"[0-9]+");
            var hasUpperChar = new Regex(@"[A-Z]+");
            var hasLowerChar = new Regex(@"[a-z]+");
            var hasMiniMaxChars = new Regex(@".{8,15}");

            if (!hasLowerChar.IsMatch(input))
            {
                return false;
            }
            else if (!hasUpperChar.IsMatch(input))
            {
                return false;
            }
            else if (!hasNumber.IsMatch(input))
            {
                return false;
            }
            else if (!hasMiniMaxChars.IsMatch(input))
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        // convert unix to date
        public static DateTime UnixTimeStampToDateTime(double unixTimeStamp) {
            System.DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc);
            dtDateTime = dtDateTime.AddSeconds(unixTimeStamp).ToUniversalTime();
            return dtDateTime;
        }
    }
}
