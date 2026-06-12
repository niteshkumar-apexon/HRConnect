using HRConnect.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Interfaces.Repositories
{
    public interface ILeaveBalanceRepository
    {
        Task<List<LeaveBalance>> GetByEmployeeIdAsync(Guid employeeId);

        Task<LeaveBalance?> GetByEmployeeAndTypeAsync(Guid employeeId, string leaveType);

        Task UpdateAsync(LeaveBalance balance);
    }
}
