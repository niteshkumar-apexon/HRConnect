using HRConnect.Domain.Common;

namespace HRConnect.Domain.Entities;

public class User : BaseAuditableEntity
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public bool IsAdmin { get; set; }

    public string FullName { get; set; } = string.Empty;

    public Employee? Employee { get; set; }
}
