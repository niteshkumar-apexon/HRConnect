using HRConnect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Domain.Entities
{
    public class LeaveBalance : BaseAuditableEntity
    {
        public Guid Id { get; set; }

        public Guid EmployeeId { get; set; }

        public string LeaveType { get; set; } = string.Empty;

        public decimal TotalDays { get; set; }

        public decimal UsedDays { get; set; }

        public Employee Employee { get; set; } = null!;
    }
}
