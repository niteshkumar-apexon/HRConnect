using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.DTO.Leave
{
    public class DisabledLeaveDateDto
    {
        public DateTime Date { get; set; }

        public bool FirstHalf { get; set; }

        public bool SecondHalf { get; set; }

        public bool FullDay { get; set; }
    }
}
