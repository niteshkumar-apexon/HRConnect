using HRConnect.Application.DTO.Leave;
using HRConnect.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Interfaces.Repositories
{
    public interface ILeaveRepository
    {

        Task<List<LeaveRequest>> GetAllAsync();        

        Task<LeaveRequest> CreateAsync(LeaveRequest leave);

        Task<List<LeaveRequest>> GetByEmployeeIdAsync(Guid employeeId);

        Task<List<LeaveRequest>> GetPendingAsync();

        Task<LeaveRequest?> GetByIdAsync(Guid id);

        Task UpdateAsync(LeaveRequest leave);
    }
}
