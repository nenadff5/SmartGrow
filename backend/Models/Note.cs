public class NoteDto {
    public int Id { get; set;}
    public string Text { get; set; }
    public int PlantId { get; set; }
}

public class InputNoteDto {
    public string Text { get; set; }
    public int PlantId { get; set; }
}

public class UpdateNoteDto {
    public string Text { get; set; }
    public int PlantId { get; set; }
}
public class GetNoteDto {
    public int Id { get; set;}
    public string Text { get; set; }
    public int PlantId { get; set; }
    public int RoomId { get; set; }
}