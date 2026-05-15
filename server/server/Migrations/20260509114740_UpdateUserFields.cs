using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdditionalDetails",
                table: "Sports");

            migrationBuilder.DropColumn(
                name: "MaxSubstitutes",
                table: "Sports");

            migrationBuilder.DropColumn(
                name: "Rank",
                table: "Scores");

            migrationBuilder.DropColumn(
                name: "Value",
                table: "Scores");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Results");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YearOfStudy",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SportId",
                table: "TeamMembers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Points",
                table: "Scores",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdateAt",
                table: "Scores",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AwardName",
                table: "Results",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAt",
                table: "Results",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rank",
                table: "Results",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_TeamMembers_SportId",
                table: "TeamMembers",
                column: "SportId");

            migrationBuilder.AddForeignKey(
                name: "FK_TeamMembers_Sports_SportId",
                table: "TeamMembers",
                column: "SportId",
                principalTable: "Sports",
                principalColumn: "SportId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TeamMembers_Sports_SportId",
                table: "TeamMembers");

            migrationBuilder.DropIndex(
                name: "IX_TeamMembers_SportId",
                table: "TeamMembers");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "YearOfStudy",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SportId",
                table: "TeamMembers");

            migrationBuilder.DropColumn(
                name: "Points",
                table: "Scores");

            migrationBuilder.DropColumn(
                name: "UpdateAt",
                table: "Scores");

            migrationBuilder.DropColumn(
                name: "AwardName",
                table: "Results");

            migrationBuilder.DropColumn(
                name: "PublishedAt",
                table: "Results");

            migrationBuilder.DropColumn(
                name: "Rank",
                table: "Results");

            migrationBuilder.AddColumn<string>(
                name: "AdditionalDetails",
                table: "Sports",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxSubstitutes",
                table: "Sports",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rank",
                table: "Scores",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Value",
                table: "Scores",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Position",
                table: "Results",
                type: "int",
                nullable: true);
        }
    }
}
