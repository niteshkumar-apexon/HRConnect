using AutoMapper;
using HRConnect.Application.DTO.Leave;
using HRConnect.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Mappings
{
    public class LeaveProfile : Profile
    {
        public LeaveProfile()
        {
            CreateMap<CreateLeaveRequestDto, LeaveRequest>()
                .ForMember(x => x.Id, opt => opt.Ignore())
                .ForMember(x => x.EmployeeId, opt => opt.Ignore())
                .ForMember(x => x.Status, opt => opt.Ignore())
                .ForMember(x => x.NumberofDays, opt => opt.Ignore())
                .ForMember(x => x.Employee, opt => opt.Ignore());

            CreateMap<LeaveRequest, LeaveResponseDto>()
                .ForMember(
                    dest => dest.TotalDays,
                    opt => opt.MapFrom(src => src.NumberofDays))
                .ForMember(
                    dest => dest.EmployeeName,
                    opt => opt.MapFrom(src => src.Employee.User.FullName));
        }
    }
}
