using HRConnect.Application.Common;
using HRConnect.Application.DTO;
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

        //Task<PagedResponse<LeaveResponseDto>>GetMyLeavesAsync(Guid userId, LeaveSearchRequestDto request);

        Task UpdateLeaveStatusAsync(Guid leaveId, string status);

        Task CancelLeaveAsync(Guid leaveId, Guid userId);

        Task<List<LeaveTypeDropdownDto>> GetAvailableLeaveTypesAsync(Guid userId);

        Task<LeaveDashboardDto> GetDashboardAsync(Guid employeeId);
    }
}
