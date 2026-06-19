using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.DTO.Leave
{
    public class CreateLeaveRequestDto
    {
        public string LeaveType { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string Reason { get; set; } = string.Empty;

        public bool FirstHalf { get; set; }

        public bool SecondHalf { get; set; }

        public bool FirstDaySecondHalf { get; set; }

        public bool LastDayFirstHalf { get; set; }

    }
}
