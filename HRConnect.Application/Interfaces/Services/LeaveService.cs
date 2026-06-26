using AutoMapper;
using HRConnect.Application.Common;
using HRConnect.Application.DTO;
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
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public LeaveService(
           ILeaveRepository leaveRepository,
           ILeaveBalanceRepository leaveBalanceRepository,
           IEmployeeRepository employeeRepository,
           IUserRepository userRepository,
           IMapper mapper)
        {
            _leaveRepository = leaveRepository;
            _leaveBalanceRepository = leaveBalanceRepository;
            _employeeRepository = employeeRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<List<LeaveResponseDto>> GetAllLeavesAsync()
        {
            var leaves = await _leaveRepository.GetAllAsync();

            return _mapper.Map<List<LeaveResponseDto>>(leaves);
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

            var leaveDays = CalculateLeaveDays(dto); //(dto.EndDate - dto.StartDate).Days + 1;

            var balance = await _leaveBalanceRepository.GetByEmployeeAndTypeAsync(employee.Id, dto.LeaveType);

            if (balance == null)
                throw new NotFoundException(
                    "Leave balance not found.");

            var remaining =
                balance.TotalDays - balance.UsedDays;

            if (leaveDays > remaining)
                throw new BadRequestException(
                    "Insufficient leave balance.");

            var leaveRequest = _mapper.Map<LeaveRequest>(dto);

            leaveRequest.Id = Guid.NewGuid();
            leaveRequest.EmployeeId = employee.Id;
            leaveRequest.Status = "Pending";
            leaveRequest.NumberofDays = leaveDays;

            var savedLeave =
                await _leaveRepository.CreateAsync(
                    leaveRequest);

            return _mapper.Map<LeaveResponseDto>(
                savedLeave);

            //var leaveRequest = new LeaveRequest
            //{
            //    Id = Guid.NewGuid(),
            //    EmployeeId = employee.Id,
            //    LeaveType = dto.LeaveType,
            //    StartDate = dto.StartDate,
            //    EndDate = dto.EndDate,
            //    Reason = dto.Reason,

            //    NumberofDays = leaveDays, //dto.NumberofDays
            //    FirstHalf = dto.FirstHalf,
            //    SecondHalf = dto.SecondHalf,
            //    FirstDaySecondHalf = dto.FirstDaySecondHalf,
            //    LastDayFirstHalf = dto.LastDayFirstHalf,
            //    Status = "Pending"
            //};

            //await _leaveRepository.CreateAsync(leaveRequest);

            //return _mapper.Map<LeaveResponseDto>(leaveRequest);
        }

        public async Task<List<LeaveResponseDto>> GetMyLeavesAsync(Guid userId)
        {
            var employee = await _employeeRepository.GetByUserIdAsync(userId);

            if (employee == null)
                throw new NotFoundException("Employee not found.");

            var leaves = await _leaveRepository.GetByEmployeeIdAsync(employee.Id);

            return _mapper.Map<List<LeaveResponseDto>>(leaves);
        }

        //public async Task<PagedResponse<LeaveResponseDto>> GetMyLeavesAsync(Guid userId, LeaveSearchRequestDto request)
        //{
        //    var employee =
        //        await _employeeRepository
        //            .GetByUserIdAsync(userId);

        //    if (employee == null)
        //        throw new NotFoundException(
        //            "Employee not found");

        //    return await _leaveRepository
        //        .GetPagedLeavesAsync(
        //            employee.Id,
        //            request);
        //}

        public async Task<List<LeaveResponseDto>> GetPendingLeavesAsync()
        {
            var pendingLeaves = await _leaveRepository.GetPendingAsync();

            return _mapper.Map<List<LeaveResponseDto>>(pendingLeaves);
        }

        public async Task<List<LeaveTypeDropdownDto>> GetAvailableLeaveTypesAsync(Guid userId)
        {
            var employee =await _employeeRepository.GetByUserIdAsync(userId);

            if (employee == null)
                throw new NotFoundException("Employee not found.");

            var balances =
                await _leaveBalanceRepository
                    .GetByEmployeeIdAsync(employee.Id);

            return balances
                .Where(x => (x.TotalDays - x.UsedDays) > 0)
                .Select(x => new LeaveTypeDropdownDto
                {
                    LeaveType = x.LeaveType,
                    TotalDays = x.TotalDays,
                    UsedDays = x.UsedDays,
                    RemainingDays = x.TotalDays - x.UsedDays
                })
                .ToList();
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

                balance.UsedDays += leave.NumberofDays;

                await _leaveBalanceRepository.UpdateAsync(balance);
            }
        }

        public async Task CancelLeaveAsync(Guid leaveId, Guid userId)
        {
            var employee =
                await _employeeRepository
                    .GetByUserIdAsync(userId);

            if (employee == null)
                throw new NotFoundException("Employee not found.");

            var leave =
                await _leaveRepository.GetByIdAsync(leaveId);

            if (leave == null)
                throw new NotFoundException("Leave request not found.");

            if (leave.EmployeeId != employee.Id)
                throw new BadRequestException(
                    "You can cancel only your own leave.");

            if (leave.Status == "Approved")
                throw new BadRequestException(
                    "Approved leave cannot be cancelled.");

            if (leave.Status == "Rejected")
                throw new BadRequestException(
                    "Rejected leave cannot be cancelled.");

            if (leave.Status == "Cancelled")
                throw new BadRequestException(
                    "Leave already cancelled.");

            leave.Status = "Cancelled";

            await _leaveRepository.UpdateAsync(leave);
        }


        public async Task<LeaveDashboardDto> GetDashboardAsync(Guid employeeId)
        {
            var employee = await _employeeRepository.GetByUserIdAsync(employeeId);

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

        private decimal CalculateLeaveDays(CreateLeaveRequestDto dto)
        {
            // Same day leave
            if (dto.StartDate.Date == dto.EndDate.Date)
            {
                // Cannot apply leave on weekends
                if (IsWeekend(dto.StartDate))
                    throw new BadRequestException("Cannot apply leave on Saturday or Sunday.");

                if (dto.FirstHalf || dto.SecondHalf)
                    return 0.5M;

                return 1M;
            }

            decimal totalDays = 0;

            DateTime current = dto.StartDate.Date;

            while (current <= dto.EndDate.Date)
            {
                if (!IsWeekend(current))
                {
                    totalDays++;
                }

                current = current.AddDays(1);
            }

            // First working day second half
            if (dto.FirstDaySecondHalf)
                totalDays -= 0.5M;

            // Last working day first half
            if (dto.LastDayFirstHalf)
                totalDays -= 0.5M;

            return totalDays;
        }

        private bool IsWeekend(DateTime date)
        {
            return date.DayOfWeek == DayOfWeek.Saturday ||
                   date.DayOfWeek == DayOfWeek.Sunday;
        }        
    }
}