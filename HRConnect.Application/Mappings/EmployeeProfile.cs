using AutoMapper;
using HRConnect.Application.DTO.Employee;
using HRConnect.Domain.Entities;


namespace HRConnect.Application.Mappings
{
    //public class EmployeeProfile : Profile
    //{
    //    public EmployeeProfile()
    //    {
    //        CreateMap<CreateEmployeeDto, Employee>();

    //        CreateMap<UpdateEmployeeDto, Employee>();

    //        CreateMap<Employee, EmployeeResponseDto>()
    //            .ForMember(
    //                dest => dest.FullName,
    //                opt => opt.MapFrom(src => src.User.FullName))
    //            .ForMember(
    //                dest => dest.Email,
    //                opt => opt.MapFrom(src => src.User.Email));
    //    }
    //}

    public class EmployeeProfile : Profile
    {
        public EmployeeProfile()
        {
            CreateMap<CreateEmployeeDto, Employee>()
                .ForMember(x => x.Id, opt => opt.Ignore())
                .ForMember(x => x.User, opt => opt.Ignore())
                .ForMember(x => x.LeaveRequests, opt => opt.Ignore())
                .ForMember(x => x.LeaveBalances, opt => opt.Ignore());

            CreateMap<UpdateEmployeeDto, Employee>()
                .ForMember(x => x.Id, opt => opt.Ignore())
                .ForMember(x => x.UserId, opt => opt.Ignore())
                .ForMember(x => x.User, opt => opt.Ignore())
                .ForMember(x => x.LeaveRequests, opt => opt.Ignore())
                .ForMember(x => x.LeaveBalances, opt => opt.Ignore());

            CreateMap<Employee, EmployeeResponseDto>()
                .ForMember(
                    dest => dest.FullName,
                    opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(
                    dest => dest.Email,
                    opt => opt.MapFrom(src => src.User.Email));
        }
    }
}

