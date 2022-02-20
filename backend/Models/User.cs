public class User {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string NearWalletID { get; set; }
    public string CrustWalletID { get; set; }
    public string MintbaseStoreID { get; set; }

    public User(int id, string name, string email, string password) {
        Id = id;
        Name = name;
        Email = email;
        Password = password;
        NearWalletID = NearWalletID;
        CrustWalletID = CrustWalletID;
        MintbaseStoreID = MintbaseStoreID;
    }
}
public class RegisterUserDto {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string RePassword { get; set; }
}

public class LoginUserDto {
    public string Email { get; set; }
    public string Password { get; set; }

}

public class UpdatePasswordUserDto {
    public int Id { get; set; }
    public string Password { get; set; }
    public string NewPassword { get; set; }
    public string ReNewPassword { get; set; }
}

public class ResetPasswordUserDto {
    public string Email { get; set; }
    public int ResetCode { get; set; }
    public string NewPassword { get; set; }
    public string ReNewPassword { get; set; }
}

public class ForgotPasswordUserDto {
    public string Email { get; set; }
}

public class UpdateUserDto {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
}

public class UpdateUserNWID {
    public int Id { get; set; }
    public string NearWalletID { get; set; }
}

public class UpdateUserCWID {
    public int Id { get; set; }
    public string NearWalletID { get; set; }
}

public class UpdateUserID {
    public int Id { get; set; }
    public string NearWalletID { get; set; }
}

public class AuthenticateUserDto {
    public int Id { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }

    public AuthenticateUserDto(int id, string email, string name) {
        Id = id;
        Email = email;
        Name = name;
    }
}