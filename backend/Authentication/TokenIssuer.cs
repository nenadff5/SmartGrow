using System;
using System.Collections.Generic;
using JWT;
using JWT.Algorithms;
using JWT.Serializers;

namespace SmartGrow.Function {

    internal static class TokenIssuer {

        private static readonly IJwtAlgorithm _algorithm = new HMACSHA256Algorithm();
        private static readonly IJsonSerializer _serializer = new JsonNetSerializer();
        private static readonly IBase64UrlEncoder _base64Encoder = new JwtBase64UrlEncoder();
        private static readonly IJwtEncoder _jwtEncoder = new JwtEncoder(_algorithm, _serializer, _base64Encoder);

        public static string IssueTokenForUser(AuthenticateUserDto user) {
            Dictionary<string, object> payload = new Dictionary<string, object>
            {
                { "id", user.Id},

                { "email", user.Email },

                { "name", user.Name }

                //{ "exp", DateTimeOffset.UtcNow.AddDays(7).ToUnixTimeSeconds() }
            };

            string token = _jwtEncoder.Encode(payload, Environment.GetEnvironmentVariable("SecretKey"));

            return token;
        }

    }

}