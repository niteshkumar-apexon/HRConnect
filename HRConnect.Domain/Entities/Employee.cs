using HRConnect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Domain.Entities
{
    public class Employee : BaseAuditableEntity
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string Department { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;

        public DateTime JoiningDate { get; set; }

        public User User { get; set; } = null!;

        public ICollection<LeaveRequest> LeaveRequests { get; set; }
            = new List<LeaveRequest>();

        public ICollection<LeaveBalance> LeaveBalances { get; set; }
            = new List<LeaveBalance>();
    }
}
