using HRConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace HRConnect.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
        public DbSet<LeaveBalance> LeaveBalances => Set<LeaveBalance>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var adminUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var employeeId = Guid.Parse("22222222-2222-2222-2222-222222222222");

            modelBuilder.Entity<User>()
                .HasIndex(x => x.Email)
                .IsUnique();

            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = adminUserId,
                    Email = "admin@example.com",
                    FullName = "HR Admin",
                    IsAdmin = true,

                    // Generate once and hardcode
                    PasswordHash = "$2a$11$1jGvdnTcgjcbQ9SaaSf1zu.tOuISNOG0C4exK.74NS6ishWH49bNS"
                });

            modelBuilder.Entity<Employee>().HasData(
                new Employee
                {
                    Id = employeeId,
                    UserId = adminUserId,
                    Department = "Engineering",
                    Designation = "HR Manager",
                    JoiningDate = new DateTime(2025, 1, 1)
                });
        }
    }
}
