using HRConnect.Application.Interfaces.Services;
using HRConnect.Domain.Common;
using HRConnect.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRConnect.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        private readonly ICurrentUserService _currentUserService;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, 
            ICurrentUserService currentUserService) : base(options)
        {
            _currentUserService = currentUserService;
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

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries<BaseAuditableEntity>();

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedDate = DateTime.UtcNow;

                    entry.Entity.CreatedBy =
                        _currentUserService.UserName ?? "System";
                }

                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.ModifiedDate = DateTime.UtcNow;

                    entry.Entity.ModifiedBy =
                        _currentUserService.UserName ?? "System";
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
