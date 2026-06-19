using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.DTO.Leave
{
    public class LeaveTypeDropdownDto
    {
        public string LeaveType { get; set; } = string.Empty;

        public decimal TotalDays { get; set; }

        public decimal UsedDays { get; set; }

        public decimal RemainingDays { get; set; }
    }
}
