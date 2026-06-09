using HRConnect.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Interfaces.Repositories
{
    public interface IEmployeeRepository
    {
        Task<List<Employee>> GetAllAsync();

        Task<Employee?> GetByIdAsync(Guid id);

        Task<Employee?> GetByUserIdAsync(Guid userId);

        Task AddAsync(Employee employee);

        Task UpdateAsync(Employee employee);

        Task DeleteAsync(Employee employee);

        Task<bool> ExistsAsync(Guid id);

        Task<List<Employee>> SearchAsync(string? search, string? department, string? designation);
    }
}
