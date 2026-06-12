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
                .OrderByDescending(x => x.CreatedOn)
                .ToListAsync();
        }

        public async Task<List<LeaveRequest>> GetPendingAsync()
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .ThenInclude(x => x.User)
                .Where(x => x.Status == "Pending")
                .OrderByDescending(x => x.CreatedOn)
                .ToListAsync();
        }

        public async Task<List<LeaveRequest>> GetAllAsync()
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .ThenInclude(x => x.User)
                .OrderByDescending(x => x.CreatedOn)
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
    }
}
