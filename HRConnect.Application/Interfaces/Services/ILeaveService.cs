using HRConnect.Application.DTO.Leave;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Interfaces.Services
{
    public interface ILeaveService
    {

        Task<List<LeaveResponseDto>> GetAllLeavesAsync();

        Task<List<LeaveResponseDto>> GetPendingLeavesAsync();

        Task<LeaveResponseDto> ApplyLeaveAsync(Guid userId, CreateLeaveRequestDto dto);

        Task<List<LeaveResponseDto>> GetMyLeavesAsync(Guid userId);

        Task UpdateLeaveStatusAsync(Guid leaveId, string status);

        //Task CancelLeaveAsync(Guid leaveId);

        //Task ApproveLeaveAsync(Guid leaveId);

        //Task RejectLeaveAsync(Guid leaveId);
        Task<LeaveDashboardDto> GetDashboardAsync(Guid employeeId);
    }
}
