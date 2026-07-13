using HRConnect.Application.Common;
using HRConnect.Application.DTO;
using HRConnect.Application.DTO.Leave;
using HRConnect.Application.Interfaces.Repositories;
using HRConnect.Domain.Entities;
using HRConnect.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Infrastructure.Repositories
{
    public class LeaveRepository : ILeaveRepository
    {
        private readonly ApplicationDbContext _context;

        public LeaveRepository(
        ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LeaveRequest> CreateAsync(LeaveRequest leaveRequest)
        {
            await _context.LeaveRequests.AddAsync(leaveRequest);

            await _context.SaveChangesAsync();

            return leaveRequest;
        }

        public async Task<List<LeaveRequest>> GetByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .ThenInclude(x => x.User)
                .Where(x => x.EmployeeId == employeeId)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        //public async Task<PagedResponse<LeaveResponseDto>> GetPagedLeavesAsync(Guid employeeId, LeaveSearchRequestDto request)
        //{
        //    var query =
        //        _context.LeaveRequests
        //            .Include(x => x.Employee)
        //            .ThenInclude(x => x.User)
        //            .Where(x => x.EmployeeId == employeeId)
        //            .AsQueryable();

        //    // Search
        //    if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        //    {
        //        query = query.Where(x =>
        //            x.LeaveType.Contains(request.SearchTerm) ||
        //            x.Reason.Contains(request.SearchTerm));
        //    }

        //    var totalRecords =
        //        await query.CountAsync();

        //    var leaves =
        //        await query
        //            .OrderByDescending(x => x.CreatedDate)
        //            .Skip((request.PageNumber - 1) * request.PageSize)
        //            .Take(request.PageSize)
        //            .Select(x => new LeaveResponseDto
        //            {
        //                Id = x.Id,
        //                EmployeeId = x.EmployeeId,
        //                EmployeeName =
        //                    x.Employee.User.FullName,

        //                LeaveType = x.LeaveType,
        //                StartDate = x.StartDate,
        //                EndDate = x.EndDate,
        //                TotalDays = x.NumberofDays,
        //                Reason = x.Reason,
        //                Status = x.Status,
        //                //CreatedDate = x.CreatedDate
        //            })
        //            .ToListAsync();

        //        return new PagedResponse<LeaveResponseDto>
        //        {
        //            Data = leaves,
        //            TotalRecords = totalRecords,
        //            PageNumber = request.PageNumber,
        //            PageSize = request.PageSize
        //        };
        //}

        public async Task<List<LeaveRequest>> GetPendingAsync()
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .ThenInclude(x => x.User)
                .Where(x => x.Status == "Pending")
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task<List<LeaveRequest>> GetAllAsync()
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .ThenInclude(x => x.User)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task<LeaveRequest?> GetByIdAsync(Guid id)
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .ThenInclude(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task UpdateAsync(LeaveRequest leaveRequest)
        {
            _context.LeaveRequests.Update(leaveRequest);

            await _context.SaveChangesAsync();
        }

        public async Task<int> CountByStatusAsync(string status)
        {
            return await _context.LeaveRequests.CountAsync(x => x.Status == status);
        }

        public async Task<bool> HasOverlappingLeaveAsync(Guid employeeId, DateTime startDate, DateTime endDate)
        {
            return await _context.LeaveRequests
                .AnyAsync(x =>
                    x.EmployeeId == employeeId &&
                    (x.Status == "Pending" ||
                     x.Status == "Approved") &&

                    startDate <= x.EndDate &&
                    endDate >= x.StartDate);
        }

        public async Task<List<LeaveRequest>> GetApprovedAndPendingLeavesAsync(Guid employeeId)
        {
            return await _context.LeaveRequests
                .Where(x =>
                    x.EmployeeId == employeeId &&
                    (x.Status == "Pending" ||
                     x.Status == "Approved"))
                .ToListAsync();
        }

        public async Task<List<LeaveRequest>> GetEmployeeLeavesForCalendarAsync(Guid employeeId)
        {
            return await _context.LeaveRequests
                .Where(x =>
                    x.EmployeeId == employeeId &&
                    (x.Status == "Pending" ||
                     x.Status == "Approved"))
                .OrderBy(x => x.StartDate)
                .ToListAsync();
        }
    }
}
