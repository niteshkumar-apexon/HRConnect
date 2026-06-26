using HRConnect.Application.DTO;
using HRConnect.Application.DTO.Employee;
using HRConnect.Application.DTO.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Interfaces.Services
{
    public interface IEmployeeService
    {
        Task<List<EmployeeResponseDto>> GetEmployeesAsync();

        Task<EmployeeResponseDto?> GetEmployeeByIdAsync(Guid id);

        Task CreateEmployeeAsync(CreateEmployeeDto dto);        

        Task UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto);

        Task DeleteEmployeeAsync(Guid id);

        Task<List<EmployeeResponseDto>> SearchEmployeesAsync(string? search, string? department, string? designation);

        Task<List<UserDropdownDto>> GetAvailableUsersAsync();

        //Task<List<UserEmployeeReportDto>> GetUserEmployeeReportAsync();

        Task<List<UserEmployeeReportDto>>GetUserEmployeeReportAsync(string? searchTerm);
    }

}
