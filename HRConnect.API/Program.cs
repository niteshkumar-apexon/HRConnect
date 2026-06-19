using AutoMapper;
using FluentValidation;
using FluentValidation.AspNetCore;
using HRConnect.API.JWTService;
using HRConnect.API.Middleware;
using HRConnect.API.Models;
using HRConnect.Application.Interfaces.Repositories;
using HRConnect.Application.Interfaces.Services;
using HRConnect.Application.Mappings;
using HRConnect.Application.Validators;
using HRConnect.Infrastructure.Data;
using HRConnect.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;





var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1",
        new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "HRConnect API",
            Version = "v1"
        });

    options.AddSecurityDefinition("Bearer",
        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Enter JWT Token"
        });

    options.AddSecurityRequirement(
        new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new Microsoft.OpenApi.Models.OpenApiReference
                    {
                        Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Values
            .SelectMany(v => v.Errors)
            .Select(x => x.ErrorMessage)
            .ToList(); 

        return new BadRequestObjectResult(
            new ErrorResponse
            {
                Timestamp = DateTime.UtcNow,
                Path = context.HttpContext.Request.Path,
                Error = "Validation Error",
                Message = string.Join(", ", errors)
            });
    };
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<ILeaveRepository, LeaveRepository>();
builder.Services.AddScoped<ILeaveService, LeaveService>();

builder.Services.AddScoped<ILeaveBalanceRepository, LeaveBalanceRepository>();
builder.Services.AddScoped<IUserRepository, EmployeeRepository>();


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:Key"]!))
        };
});

builder.Services.AddAutoMapper(typeof(EmployeeProfile));
builder.Services.AddFluentValidationAutoValidation();

builder.Services.AddValidatorsFromAssemblyContaining<LoginValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterValidator>();

builder.Services.AddValidatorsFromAssemblyContaining<CreateEmployeeValidator>();
builder.Services.AddValidatorsFromAssemblyContaining<UpdateEmployeeValidator>();

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Below 3 lines of code will provide the invalid mapping
var scope = app.Services.CreateScope();
var mapper = scope.ServiceProvider.GetRequiredService<IMapper>();
//mapper.ConfigurationProvider.AssertConfigurationIsValid();

try
{
    mapper.ConfigurationProvider.AssertConfigurationIsValid();
}
catch (AutoMapperConfigurationException ex)
{
    Console.WriteLine(ex.Message);

    foreach (var error in ex.Errors)
    {
        Console.WriteLine($"Source: {error.TypeMap.SourceType}");
        Console.WriteLine($"Destination: {error.TypeMap.DestinationType}");

        foreach (var member in error.UnmappedPropertyNames)
        {
            Console.WriteLine($"Unmapped: {member}");
        }
    }

    throw;
}

app.UseSwagger();

app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();