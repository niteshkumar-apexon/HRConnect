using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.DTO.Leave
{
    public class LeaveDashboardDto
    {
        public int CasualLeaveTotal { get; set; }
        public int CasualLeaveUsed { get; set; }
        public int CasualLeaveRemaining { get; set; }

        public int SickLeaveTotal { get; set; }
        public int SickLeaveUsed { get; set; }
        public int SickLeaveRemaining { get; set; }

        public int EarnedLeaveTotal { get; set; }
        public int EarnedLeaveUsed { get; set; }
        public int EarnedLeaveRemaining { get; set; }

        public int PendingRequests { get; set; }
        public int ApprovedRequests { get; set; }
        public int RejectedRequests { get; set; }
    }
}
