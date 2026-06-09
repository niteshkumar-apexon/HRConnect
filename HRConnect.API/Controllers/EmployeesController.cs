using HRConnect.Application.DTO.Employee;
using HRConnect.Application.Interfaces.Services;
using HRConnect.Domain.Entities;
using HRConnect.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRConnect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _service;

        public EmployeesController(
            IEmployeeService service)
        {
            _service = service;
        }

        //[HttpGet]
        //public async Task<IActionResult> Get()
        //{
        //    var result = await _service.GetEmployeesAsync();

        //    return Ok(result);
        //}

        // If no filters supplied return all employees

        [HttpGet]
        public async Task<IActionResult> GetEmployees([FromQuery] string? search, [FromQuery] string? department, [FromQuery] string? designation)
        {
            var result = await _service.SearchEmployeesAsync(
                search,
                department,
                designation);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var result = await _service.GetEmployeeByIdAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateEmployeeDto dto)
        {
            await _service.CreateEmployeeAsync(dto);

            return Ok("Employee Created");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id,
                   UpdateEmployeeDto dto)
        {
            await _service.UpdateEmployeeAsync( id, dto);

            return Ok("Employee Updated");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteEmployeeAsync(id);

            return Ok("Employee Deleted");
        }
    }
}
