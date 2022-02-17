using System;
using System.Collections.Generic;
using System.Diagnostics;
using JWT.Algorithms;
using JWT.Builder;
using Microsoft.AspNetCore.Http;

namespace SmartGrow.Function {

    internal class AuthenticationInfo {
        public bool IsValid { get; }
        public string Id { get; }
        public string Email { get; }
        public string Name { get; }

        //public double Exp { get; }

        public AuthenticationInfo(HttpRequest request) {
            // Check if we have a header.
            if (!request.Headers.ContainsKey(Constants.AUTHENTICATION_HEADER_NAME)) {
                IsValid = false;
                return;
            }

            string authorizationHeader = request.Headers[Constants.AUTHENTICATION_HEADER_NAME];

            // Check if the value is empty.
            if (string.IsNullOrEmpty(authorizationHeader)) {
                IsValid = false;
                return;
            }

            // Check if we can decode the header.
            IDictionary<string, object> claims = null;

            try {
                if (authorizationHeader.StartsWith(Constants.TOKEN_TYPE)) {
                    authorizationHeader = authorizationHeader.Substring(7);
                }

                // Validate the token and decode the claims
                claims = new JwtBuilder()
                    .WithAlgorithm(new HMACSHA256Algorithm())
                    .WithSecret(Environment.GetEnvironmentVariable("SecretKey"))
                    .MustVerifySignature()
                    //.ExpirationTime(DateTime.UtcNow.AddSeconds(20))
                    .Decode<IDictionary<string, object>>(authorizationHeader);
            } catch {
                IsValid = false;
                return;
            }

            // Check if we have id claim.
            if (!claims.ContainsKey("id")) {
                IsValid = false;
                return;
            }
            // Check if we have email claim.
            if (!claims.ContainsKey("email")) {
                IsValid = false;
                return;
            }
            // Check if we have name claim.
            if (!claims.ContainsKey("name")) {
                IsValid = false;
                return;
            }
            /*
            // Check if we have expiration claim.
            if (!claims.ContainsKey("exp")) {
                IsValid = false;
                return;
            }


            // Check if token is still valid.
            Exp = Convert.ToDouble(claims["exp"]);
            if (UnixTimeStampToDateTime(Exp) < DateTime.UtcNow) {
                IsValid = false;
                Debug.WriteLine("Expired");
                return;
            }
            */

            Id = Convert.ToString(claims["id"]);
            Email = Convert.ToString(claims["email"]);
            Name = Convert.ToString(claims["name"]);
            IsValid = true;
        }


        public DateTime UnixTimeStampToDateTime(double unixTimeStamp) {
            System.DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc);
            dtDateTime = dtDateTime.AddSeconds(unixTimeStamp).ToUniversalTime();
            return dtDateTime;
        }

    }

}