namespace HRConnect.API.Models
{
    public class ErrorResponse
    {
        public DateTime Timestamp { get; set; }

        public string Path { get; set; } = string.Empty;

        public string Error { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;
    }
}
