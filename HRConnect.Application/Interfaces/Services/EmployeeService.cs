using HRConnect.Application.DTO.Employee;
using HRConnect.Application.Interfaces.Repositories;
using HRConnect.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Interfaces.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repository;

        public EmployeeService(
            IEmployeeRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<EmployeeResponseDto>> GetEmployeesAsync()
        {
            var employees = await _repository.GetAllAsync();

            return employees.Select(x =>
                new EmployeeResponseDto
                {
                    Id = x.Id,
                    UserId = x.UserId,
                    FullName = x.User.FullName,
                    Email = x.User.Email,
                    Department = x.Department,
                    Designation = x.Designation,
                    JoiningDate = x.JoiningDate
                }).ToList();
        }

        public async Task<EmployeeResponseDto?> GetEmployeeByIdAsync(Guid id)
        {
            var employee = await _repository.GetByIdAsync(id);

            if (employee == null)
                return null;

            return new EmployeeResponseDto
            {
                Id = employee.Id,
                UserId = employee.UserId,
                FullName = employee.User.FullName,
                Email = employee.User.Email,
                Department = employee.Department,
                Designation = employee.Designation,
                JoiningDate = employee.JoiningDate
            };
        }

        public async Task CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            var employee = new Employee
            {
                Id = Guid.NewGuid(),
                UserId = dto.UserId,
                Department = dto.Department,
                Designation = dto.Designation,
                JoiningDate = dto.JoiningDate
            };

            await _repository.AddAsync(employee);
        }

        public async Task UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto)
        {
            var employee =
                await _repository.GetByIdAsync(id);

            if (employee == null)
                throw new Exception("Employee not found");

            employee.Department = dto.Department;
            employee.Designation = dto.Designation;
            employee.JoiningDate = dto.JoiningDate;

            await _repository.UpdateAsync(employee);
        }

        public async Task DeleteEmployeeAsync(Guid id)
        {
            var employee =
                await _repository.GetByIdAsync(id);

            if (employee == null)
                throw new Exception("Employee not found");

            await _repository.DeleteAsync(employee);
        }

        public async Task<List<EmployeeResponseDto>> SearchEmployeesAsync(string? search, string? department, string? designation)
        {
            var employees = await _repository.SearchAsync(
                search,
                department,
                designation);

            return employees.Select(x => new EmployeeResponseDto
            {
                Id = x.Id,
                UserId = x.UserId,
                FullName = x.User.FullName,
                Email = x.User.Email,
                Department = x.Department,
                Designation = x.Designation,
                JoiningDate = x.JoiningDate
            }).ToList();
        }
    }
}
