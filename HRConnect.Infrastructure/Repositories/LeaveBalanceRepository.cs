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
    public class LeaveBalanceRepository : ILeaveBalanceRepository
    {
        private readonly ApplicationDbContext _context;
        public LeaveBalanceRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LeaveBalance?> GetByEmployeeAndTypeAsync( Guid employeeId, string leaveType)
        {
            return await _context.LeaveBalances.FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.LeaveType == leaveType);
        }

        public async Task<List<LeaveBalance>> GetByEmployeeIdAsync(Guid employeeId)
        {
            return await _context.LeaveBalances
                .Where(x => x.EmployeeId == employeeId)
                .ToListAsync();
        }

        public async Task UpdateAsync(LeaveBalance balance)
        {
            _context.LeaveBalances.Update(balance);

            await _context.SaveChangesAsync();
        }

        public async Task AddRangeAsync(List<LeaveBalance> balances)
        {
            await _context.LeaveBalances.AddRangeAsync(balances);

            await _context.SaveChangesAsync();
        }
    }
}
