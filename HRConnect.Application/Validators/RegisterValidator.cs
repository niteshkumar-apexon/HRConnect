using FluentValidation;
using HRConnect.Application.DTO.Auth;

namespace HRConnect.Application.Validators
{
    public class RegisterValidator
    : AbstractValidator<RegisterDto>
    {
        public RegisterValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("FullName is required");

            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress().WithMessage("Email is required");

            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(6).WithMessage("Password is required");
        }
    }
}
