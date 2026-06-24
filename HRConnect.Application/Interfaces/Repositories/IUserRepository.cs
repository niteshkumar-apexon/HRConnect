using HRConnect.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRConnect.Application.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<List<User>> GetUsersWithoutEmployeeAsync();
    }
}
