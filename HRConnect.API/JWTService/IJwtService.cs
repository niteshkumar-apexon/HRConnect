using HRConnect.Domain.Entities;

namespace HRConnect.API.JWTService
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
