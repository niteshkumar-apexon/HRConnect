using HRConnect.Application.DTO.Employee;
using HRConnect.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRConnect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _service;
        private readonly ILeaveService _leaveService;

        public EmployeesController(IEmployeeService service, ILeaveService leaveService)
        {
            _service = service;
            _leaveService = leaveService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("available-users")]
        public async Task<IActionResult> GetAvailableUsers()
        {
            var users = await _service.GetAvailableUsersAsync();

            return Ok(users);
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

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CreateEmployeeDto dto)
        {
            await _service.CreateEmployeeAsync(dto);

            return Ok("Employee Added Successfully");
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id,
                   UpdateEmployeeDto dto)
        {
            await _service.UpdateEmployeeAsync( id, dto);

            return Ok("Employee Updated");
        }


        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteEmployeeAsync(id);

            return Ok("Employee Deleted");
        }
    }
}
