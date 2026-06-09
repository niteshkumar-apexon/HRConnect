namespace HRConnect.Application.DTO.Employee
{
    public class EmployeeResponseDto
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string FullName { get; set; }

        public string Email { get; set; }

        public string Department { get; set; }

        public string Designation { get; set; }

        public DateTime JoiningDate { get; set; }
    }
}
