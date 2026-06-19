using HRConnect.Application.DTO;
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
    public class EmployeeRepository : IEmployeeRepository, IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public EmployeeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Employee employee)
        {
            await _context.Employees.AddAsync(employee);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Employee employee)
        {
            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Employees
            .AnyAsync(x => x.Id == id);
        }

        public async Task<List<Employee>> GetAllAsync()
        {
            return await _context.Employees
            .Include(x => x.User)
            .ToListAsync();
        }

        public async Task<Employee?> GetByIdAsync(Guid id)
        {
            return await _context.Employees
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Employee?> GetByUserIdAsync(Guid userId)
        {
            return await _context.Employees
             .Include(x => x.User)
             .FirstOrDefaultAsync(x => x.UserId == userId);
        }

        public async Task UpdateAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Employee>> SearchAsync(
            string? search,
            string? department,
            string? designation)
        {
            IQueryable<Employee> query = _context.Employees
                .Include(x => x.User);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(x =>
                    x.User.FullName.Contains(search) ||
                    x.User.Email.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(department))
            {
                query = query.Where(x =>
                    x.Department == department);
            }

            if (!string.IsNullOrWhiteSpace(designation))
            {
                query = query.Where(x =>
                    x.Designation == designation);
            }

            return await query.ToListAsync();
        }

        public async Task<List<User>> GetUsersWithoutEmployeeAsync()
        {
            var employeeUserIds =
                await _context.Employees
                    .Select(x => x.UserId)
                    .ToListAsync();

            return await _context.Users
                .Where(x => !employeeUserIds.Contains(x.Id))
                .ToListAsync();
        }

    }
}
