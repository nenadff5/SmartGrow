CREATE TABLE [Users](
    [ID] int IDENTITY NOT NULL,
    [name] NVARCHAR(60) NOT NULL,
    [email] NVARCHAR(60) NOT NULL UNIQUE,
    [password] NVARCHAR(100) NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED
    (
        [ID] ASC
    ) WITH (IGNORE_DUP_KEY = OFF)
);

GO
CREATE TABLE [Rooms](
    [ID] int IDENTITY NOT NULL,
    [name] NVARCHAR(60) NOT NULL,
    [photo] NVARCHAR(255) NOT NULL,
    [userID] int NOT NULL,
    CONSTRAINT [PK_ROOMS] PRIMARY KEY CLUSTERED
    (
        [ID] ASC
    ) WITH (IGNORE_DUP_KEY = OFF)
)

GO
CREATE TABLE [Plants](
    [ID] int IDENTITY NOT NULL,
    [name] NVARCHAR(60) NOT NULL,
    [photo] NVARCHAR(100) NOT NULL,
    [roomID] int NOT NULL,
    CONSTRAINT [PK_PLANTS] PRIMARY KEY CLUSTERED
    (
        [ID] ASC
    ) WITH (IGNORE_DUP_KEY = OFF)
)

GO

CREATE TABLE [Notes](
    [ID] int IDENTITY NOT NULL,
    [text] NVARCHAR(2000) NOT NULL,
    [plantID] int NOT NULL,
    CONSTRAINT [PK_Notes] PRIMARY KEY CLUSTERED
    (
        [ID] ASC
    ) WITH (IGNORE_DUP_KEY = OFF)
)
GO

CREATE TABLE [Statistic] (
    [plantsCount] int NOT NULL,
    [usersCounts] int NOT NULL,
    [roomsCount] int NOT NULL,
    [notificationsCount] int NOT NULL 
)
GO

CREATE TABLE [ResetCodes] (
    [ID] int IDENTITY NOT NULL,
    [resetCode] int NOT NULL,
    [expiry] int NOT NULL,
    [userID] int NOT NULL,
    CONSTRAINT [PK_ResetCodes] PRIMARY KEY CLUSTERED
    (
        [ID] ASC
    ) WITH (IGNORE_DUP_KEY = OFF)
)

GO
ALTER TABLE [Rooms] WITH CHECK ADD CONSTRAINT [Rooms_fk0] FOREIGN KEY ([userID]) REFERENCES [Users]([ID])
ON UPDATE CASCADE
GO
ALTER TABLE [Rooms] CHECK CONSTRAINT [Rooms_fk0]
GO

ALTER TABLE [Plants] WITH CHECK ADD CONSTRAINT [Plants_fk0] FOREIGN KEY ([roomID]) REFERENCES [Rooms]([ID])
ON UPDATE CASCADE
GO
ALTER TABLE [Plants] CHECK CONSTRAINT [Plants_fk0]
GO

ALTER TABLE [Notes] WITH CHECK ADD CONSTRAINT [Notes_fk0] FOREIGN KEY ([plantID]) REFERENCES [Plants]([ID])
ON UPDATE CASCADE
ON DELETE CASCADE
GO
ALTER TABLE [Notes] CHECK CONSTRAINT [Notes_fk0]
GO

ALTER TABLE [ResetCodes] WITH CHECK ADD CONSTRAINT [ResetCodes_fk0] FOREIGN KEY ([userID]) REFERENCES [Users]([ID])
ON UPDATE CASCADE
GO
ALTER TABLE [ResetCodes] CHECK CONSTRAINT [ResetCodes_fk0]
GO