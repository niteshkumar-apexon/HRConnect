using FluentValidation;
using HRConnect.Application.DTO.Employee;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Validators
{
    public class CreateEmployeeValidator
         : AbstractValidator<CreateEmployeeDto>
    {
        public CreateEmployeeValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty()
                .WithMessage("UserId is required");

            RuleFor(x => x.Department)
                .NotEmpty()
                .MaximumLength(100).WithMessage("Department is required");

            RuleFor(x => x.Designation)
                .NotEmpty()
                .MaximumLength(100).WithMessage("Designation is required");

            RuleFor(x => x.JoiningDate)
                .NotEmpty()
                .LessThanOrEqualTo(DateTime.Today)
                .WithMessage(
                    "Joining date cannot be in future");
        }
    }
}
