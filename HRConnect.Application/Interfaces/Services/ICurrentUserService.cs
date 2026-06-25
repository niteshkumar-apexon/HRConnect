using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Interfaces.Services
{
    public class ICurrentUserService
    {
        public string? UserId { get; }

        public string? UserName { get; }
    }
}
