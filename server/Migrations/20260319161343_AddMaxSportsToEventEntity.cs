using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TechSportia.Migrations
{
    /// <inheritdoc />
    public partial class AddMaxSportsToEventEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaxSports",
                table: "Events",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxSports",
                table: "Events");
        }
    }
}
