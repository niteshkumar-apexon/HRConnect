using AutoMapper;
using HRConnect.Application.DTO.Employee;
using HRConnect.Application.Exceptions;
using HRConnect.Application.Interfaces.Repositories;
using HRConnect.Domain.Entities;

namespace HRConnect.Application.Interfaces.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repository;
        private readonly IMapper _mapper;

        public EmployeeService(
            IEmployeeRepository repository, IMapper mapper  )
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<EmployeeResponseDto>> GetEmployeesAsync()
        {
            var employees = await _repository.GetAllAsync();

            //return employees.Select(x =>
            //    new EmployeeResponseDto
            //    {
            //        Id = x.Id,
            //        UserId = x.UserId,
            //        FullName = x.User.FullName,
            //        Email = x.User.Email,
            //        Department = x.Department,
            //        Designation = x.Designation,
            //        JoiningDate = x.JoiningDate
            //    }).ToList();

            return _mapper.Map<List<EmployeeResponseDto>>(employees);
        }

        public async Task<EmployeeResponseDto?> GetEmployeeByIdAsync(Guid id)
        {
            var employee = await _repository.GetByIdAsync(id);

            if (employee == null)
                return null;

            //return new EmployeeResponseDto
            //{
            //    Id = employee.Id,
            //    UserId = employee.UserId,
            //    FullName = employee.User.FullName,
            //    Email = employee.User.Email,
            //    Department = employee.Department,
            //    Designation = employee.Designation,
            //    JoiningDate = employee.JoiningDate
            //};

            return _mapper.Map<EmployeeResponseDto>(employee);
        }

        public async Task CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            //var employee = new Employee
            //{
            //    Id = Guid.NewGuid(),
            //    UserId = dto.UserId,
            //    Department = dto.Department,
            //    Designation = dto.Designation,
            //    JoiningDate = dto.JoiningDate
            //};

            var employee = _mapper.Map<Employee>(dto);

            employee.Id = Guid.NewGuid();

            await _repository.AddAsync(employee);
        }

        public async Task UpdateEmployeeAsync(Guid id, UpdateEmployeeDto dto)
        {
            var employee =
                await _repository.GetByIdAsync(id);

            if (employee == null)
            {
                throw new NotFoundException(
                    $"Employee with id {id} not found");
            }

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
            {
                throw new NotFoundException(
                    $"Employee with id {id} not found");
            }

            await _repository.DeleteAsync(employee);
        }

        public async Task<List<EmployeeResponseDto>> SearchEmployeesAsync(string? search, string? department, string? designation)
        {
            var employees = await _repository.SearchAsync(
                search,
                department,
                designation);

            //return employees.Select(x => new EmployeeResponseDto
            //{
            //    Id = x.Id,
            //    UserId = x.UserId,
            //    FullName = x.User.FullName,
            //    Email = x.User.Email,
            //    Department = x.Department,
            //    Designation = x.Designation,
            //    JoiningDate = x.JoiningDate
            //}).ToList();

            return _mapper.Map<List<EmployeeResponseDto>>(employees);
        }
    }
}
