using HRConnect.Application.DTO.Leave;
using HRConnect.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRConnect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeavesController : ControllerBase
    {
        private readonly ILeaveService _leaveService;

        public LeavesController(ILeaveService leaveService )
        {
            _leaveService=leaveService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> ApplyLeave(CreateLeaveRequestDto dto)
        {
            var userId =
                Guid.Parse(
                    User.FindFirst(
                        ClaimTypes.NameIdentifier)!
                    .Value);

            var response= await _leaveService.ApplyLeaveAsync(userId, dto);

            return Ok(response);
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyLeaves()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var leaves = await _leaveService.GetMyLeavesAsync(userId);

            return Ok(leaves);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus( Guid id, [FromBody] UpdateLeaveStatusDto dto)
        {
            await _leaveService.UpdateLeaveStatusAsync(id, dto.Status);

            return Ok(new
            {
                Message = "Leave status updated successfully"
            });
        }
        [Authorize]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = Guid.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var dashboard =
                await _leaveService.GetDashboardAsync(userId);

            return Ok(dashboard);
        }
    }
}
