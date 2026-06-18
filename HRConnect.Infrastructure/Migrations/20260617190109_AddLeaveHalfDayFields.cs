using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLeaveHalfDayFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "FirstDaySecondHalf",
                table: "LeaveRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "FirstHalf",
                table: "LeaveRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "LastDayFirstHalf",
                table: "LeaveRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "NumberofDays",
                table: "LeaveRequests",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "SecondHalf",
                table: "LeaveRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FirstDaySecondHalf",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "FirstHalf",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "LastDayFirstHalf",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "NumberofDays",
                table: "LeaveRequests");

            migrationBuilder.DropColumn(
                name: "SecondHalf",
                table: "LeaveRequests");
        }
    }
}
