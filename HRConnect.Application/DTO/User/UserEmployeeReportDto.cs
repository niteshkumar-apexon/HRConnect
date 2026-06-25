using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.DTO.User
{
    public class UserEmployeeReportDto
    {
        public Guid UserId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public bool IsAdmin { get; set; }

        public bool IsEmployeeCreated { get; set; }

        public Guid? EmployeeId { get; set; }

        public string? Department { get; set; }

        public string? Designation { get; set; }

        public DateTime? JoiningDate { get; set; }
    }
}
