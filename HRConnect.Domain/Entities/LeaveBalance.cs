using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Domain.Entities
{
    public class LeaveBalance
    {
        public Guid Id { get; set; }

        public Guid EmployeeId { get; set; }

        public string LeaveType { get; set; } = string.Empty;

        public int TotalDays { get; set; }

        public int UsedDays { get; set; }

        public Employee Employee { get; set; } = null!;
    }
}
