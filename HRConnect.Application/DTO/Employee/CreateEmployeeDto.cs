namespace HRConnect.Application.DTO.Employee
{
    public class CreateEmployeeDto
    {
        public Guid UserId { get; set; }

        public string Department { get; set; }

        public string Designation { get; set; }

        public DateTime JoiningDate { get; set; }
    }
}
