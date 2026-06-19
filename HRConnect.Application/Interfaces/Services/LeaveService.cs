using AutoMapper;
using HRConnect.Application.DTO.Leave;
using HRConnect.Application.Exceptions;
using HRConnect.Application.Interfaces.Repositories;
using HRConnect.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Interfaces.Services
{
    public class LeaveService : ILeaveService
    {
        private readonly ILeaveRepository _leaveRepository;
        private readonly ILeaveBalanceRepository _leaveBalanceRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IMapper _mapper;

        public LeaveService(
           ILeaveRepository leaveRepository,
           ILeaveBalanceRepository leaveBalanceRepository,
           IEmployeeRepository employeeRepository,
           IMapper mapper)
        {
            _leaveRepository = leaveRepository;
            _leaveBalanceRepository = leaveBalanceRepository;
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }


        public async Task<LeaveResponseDto> ApplyLeaveAsync(Guid userId, CreateLeaveRequestDto dto)
        {
            var employee =
                await _employeeRepository
                    .GetByUserIdAsync(userId);

            if (employee == null)
                throw new Exception("Employee not found.");

            if (dto.StartDate > dto.EndDate)
                throw new Exception(
                    "Start date cannot be greater than end date.");

            //var overlap =
            //    await _leaveRepository
            //        .HasOverlappingLeaveAsync(
            //            employee.Id,
            //            dto.StartDate,
            //            dto.EndDate);

            //if (overlap)
            //    throw new Exception(
            //        "Leave already exists for selected dates.");

            var leaveDays = (dto.EndDate - dto.StartDate).Days + 1;

            var balance = await _leaveBalanceRepository.GetByEmployeeAndTypeAsync(employee.Id, dto.LeaveType);

            if (balance == null)
                throw new NotFoundException(
                    "Leave balance not found.");

            var remaining =
                balance.TotalDays - balance.UsedDays;

            if (leaveDays > remaining)
                throw new BadRequestException(
                    "Insufficient leave balance.");

            var leaveRequest = new LeaveRequest
            {
                Id = Guid.NewGuid(),
                EmployeeId = employee.Id,
                LeaveType = dto.LeaveType,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                Status = "Pending",
                //CreatedOn = DateTime.UtcNow
            };

            await _leaveRepository.CreateAsync(leaveRequest);

            return _mapper.Map<LeaveResponseDto>(leaveRequest);
        }

        public async Task<List<LeaveResponseDto>> GetMyLeavesAsync(Guid userId)
        {
            var employee = await _employeeRepository.GetByUserIdAsync(userId);

            if (employee == null)
                throw new NotFoundException("Employee not found.");

            var leaves = await _leaveRepository.GetByEmployeeIdAsync(employee.Id);

            return _mapper.Map<List<LeaveResponseDto>>(leaves);
        }

        public async Task<List<LeaveApprovalDto>> GetPendingLeavesAsync()
        {
            var pendingLeaves = await _leaveRepository.GetPendingAsync();

            return _mapper.Map<List<LeaveApprovalDto>>(pendingLeaves);
        }

        public async Task UpdateLeaveStatusAsync(Guid leaveId, string status)
        {
            var leave = await _leaveRepository.GetByIdAsync(leaveId);

            if (leave == null)
                throw new Exception("Leave request not found.");

            if (leave.Status != "Pending")
                throw new Exception("Leave already processed.");

            status = status.Trim();

            if (status != "Approved" && status != "Rejected")
            {
                throw new Exception("Status must be Approved or Rejected.");
            }

            leave.Status = status;

            await _leaveRepository.UpdateAsync(leave);

            // Update leave balance only when approved
            if (status == "Approved")
            {
                var balance = await _leaveBalanceRepository.GetByEmployeeAndTypeAsync(leave.EmployeeId, leave.LeaveType);

                if (balance == null)
                    throw new Exception("Leave balance not found.");

                var days = (leave.EndDate - leave.StartDate).Days + 1;

                balance.UsedDays += days;

                await _leaveBalanceRepository.UpdateAsync(balance);
            }
        }

        public async Task<LeaveDashboardDto> GetDashboardAsync(Guid employeeId)
        {
            var employee = await _employeeRepository
        .GetByUserIdAsync(employeeId);

            if (employee == null)
            {
                throw new Exception("Employee not found");
            }

            var balances = await _leaveBalanceRepository
                .GetByEmployeeIdAsync(employee.Id);

             var casual = balances.FirstOrDefault(x =>
                x.LeaveType == "Casual Leave");

            var sick = balances.FirstOrDefault(x =>
                x.LeaveType == "Sick Leave");

            var earned = balances.FirstOrDefault(x =>
                x.LeaveType == "Earned Leave");

            return new LeaveDashboardDto
            {
                CasualLeaveTotal = casual?.TotalDays ?? 0,
                CasualLeaveUsed = casual?.UsedDays ?? 0,
                CasualLeaveRemaining =
                    (casual?.TotalDays ?? 0) -
                    (casual?.UsedDays ?? 0),

                SickLeaveTotal = sick?.TotalDays ?? 0,
                SickLeaveUsed = sick?.UsedDays ?? 0,
                SickLeaveRemaining =
                    (sick?.TotalDays ?? 0) -
                    (sick?.UsedDays ?? 0),

                EarnedLeaveTotal = earned?.TotalDays ?? 0,
                EarnedLeaveUsed = earned?.UsedDays ?? 0,
                EarnedLeaveRemaining =
                    (earned?.TotalDays ?? 0) -
                    (earned?.UsedDays ?? 0)
            };
        }

        //public async Task ApproveLeaveAsync(Guid leaveId)
        //{
        //    var leave =
        //        await _leaveRepository
        //            .GetByIdAsync(leaveId);

        //    if (leave == null)
        //        throw new NotFoundException(
        //            "Leave request not found.");

        //    if (leave.Status != "Pending")
        //        throw new BadRequestException(
        //            "Leave already processed.");

        //    leave.Status = "Approved";

        //    await _leaveRepository
        //        .UpdateAsync(leave);

        //    var balance = await _leaveBalanceRepository.GetByEmployeeAndTypeAsync(leave.EmployeeId, leave.LeaveType);

        //    if (balance == null)
        //        throw new NotFoundException("Leave balance not found.");

        //    var days = (leave.EndDate - leave.StartDate).Days + 1;

        //    balance.UsedDays += days;

        //    await _leaveBalanceRepository.UpdateAsync(balance);
        //}

        //public async Task RejectLeaveAsync(
        //    Guid leaveId)
        //{
        //    var leave = await _leaveRepository.GetByIdAsync(leaveId);

        //    if (leave == null)
        //        throw new NotFoundException("Leave request not found.");

        //    if (leave.Status != "Pending")
        //        throw new BadRequestException(
        //            "Leave already processed.");

        //    leave.Status = "Rejected";

        //    await _leaveRepository.UpdateAsync(leave);
        //}

        //public async Task CancelLeaveAsync(Guid leaveId)
        //{
        //    var leave = await _leaveRepository.GetByIdAsync(leaveId);

        //    if (leave == null)
        //        throw new NotFoundException("Leave request not found.");

        //    if (leave.Status == "Cancelled")
        //        throw new BadRequestException("Leave already cancelled.");

        //    if (leave.Status == "Approved")
        //    {
        //        var balance = await _leaveBalanceRepository.GetByEmployeeAndTypeAsync(leave.EmployeeId, leave.LeaveType);

        //        if (balance != null)
        //        {
        //            var days = (leave.EndDate - leave.StartDate).Days + 1;

        //            balance.UsedDays -= days;

        //            await _leaveBalanceRepository.UpdateAsync(balance);
        //        }
        //    }
        //    leave.Status = "Cancelled";

        //    await _leaveRepository.UpdateAsync(leave);
        //}
    }
}