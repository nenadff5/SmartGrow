using System.Collections.Generic;

public class RoomDto {

    public int Id { get; set; }

    public int UserId { get; set; }

    public string Name { get; set; }

    public string Photo { get; set; }

    public int PlantsCount { get; set; }

    public int NotesCount { get; set; }

    public List<int> Plants { get; set; }
}

public class InputRoomDto {
    
    public string Name { get; set; }

    public string Photo { get; set; }
}