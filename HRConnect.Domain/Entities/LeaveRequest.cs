using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Domain.Entities
{
    public class LeaveRequest
    {
        public Guid Id { get; set; }

        public Guid EmployeeId { get; set; }

        public string LeaveType { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string Status { get; set; } = "Pending";

        public string Reason { get; set; } = string.Empty;

        //public DateTime CreatedOn { get; set; }

        public Employee Employee { get; set; } = null!;
    }
}
