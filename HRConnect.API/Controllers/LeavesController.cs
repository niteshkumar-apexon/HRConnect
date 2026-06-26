using HRConnect.API.CommonHelper;
using HRConnect.Application.DTO;
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

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllLeaves()
        {
            var leaves =
                await _leaveService.GetAllLeavesAsync();

            return Ok(leaves);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/pending")]
        public async Task<IActionResult> GetPendingLeaves()
        {
            var leaves =
                await _leaveService.GetPendingLeavesAsync();

            return Ok(leaves);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> ApplyLeave(CreateLeaveRequestDto dto)
        {
            var userId = User.GetUserId();

            var response= await _leaveService.ApplyLeaveAsync(userId, dto);

            return Ok(response);
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyLeaves()
        {
            //var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var userId = User.GetUserId();

            var leaves = await _leaveService.GetMyLeavesAsync(userId);

            return Ok(leaves);
        }

        //[HttpGet("mine")]
        //public async Task<IActionResult> GetMyLeaves([FromQuery] LeaveSearchRequestDto request)
        //{
        //    var userId = User.GetUserId();

        //    var result = await _leaveService.GetMyLeavesAsync(userId, request);

        //    return Ok(result);
        //}

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
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelLeave(Guid id)
        {
            //var userId = Guid.Parse(
            //    User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var userId = User.GetUserId();

            await _leaveService.CancelLeaveAsync(id, userId);

            return Ok(new
            {
                Message = "Leave cancelled successfully"
            });
        }


        [Authorize]
        [HttpGet("leave-balance")]
        public async Task<IActionResult> GetAvailableLeaveTypes()
        {
            //var userId = Guid.Parse(
            //    User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var userId = User.GetUserId();

            var leaveTypes =
                await _leaveService.GetAvailableLeaveTypesAsync(userId);

            return Ok(leaveTypes);
        }

        [Authorize]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            //var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var userId = User.GetUserId();

            var dashboard =
                await _leaveService.GetDashboardAsync(userId);

            return Ok(dashboard);
        }


    }
}
