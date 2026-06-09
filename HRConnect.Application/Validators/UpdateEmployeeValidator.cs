using FluentValidation;
using HRConnect.Application.DTO.Employee;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Validators
{
    public class UpdateEmployeeValidator
        : AbstractValidator<UpdateEmployeeDto>
    {
        public UpdateEmployeeValidator()
        {
            RuleFor(x => x.Department)
                .NotEmpty();

            RuleFor(x => x.Designation)
                .NotEmpty();
        }
    }
}
