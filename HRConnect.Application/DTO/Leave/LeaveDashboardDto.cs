using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.DTO.Leave
{
    public class LeaveDashboardDto
    {
        public decimal CasualLeaveTotal { get; set; }
        public decimal CasualLeaveUsed { get; set; }
        public decimal CasualLeaveRemaining { get; set; }

        public decimal SickLeaveTotal { get; set; }
        public decimal SickLeaveUsed { get; set; }
        public decimal SickLeaveRemaining { get; set; }

        public decimal EarnedLeaveTotal { get; set; }
        public decimal EarnedLeaveUsed { get; set; }
        public decimal EarnedLeaveRemaining { get; set; }

        public decimal PendingRequests { get; set; }
        public decimal ApprovedRequests { get; set; }
        public decimal RejectedRequests { get; set; }
    }
}
