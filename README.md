# 🏆 TechSportia – College Sports Event Management System

## 📌 Project Overview

TechSportia is a **multi-college sports event management system** where multiple colleges can register, create events, manage sports, teams, and track results.

This system supports:

* Individual sports
* Team sports
* Role-based access
* Event lifecycle management
* Scoreboards and results

---

## 🧱 Tech Stack

| Layer    | Technology            |
| -------- | --------------------- |
| Frontend | React                 |
| Backend  | ASP.NET Core MVC      |
| Database | MySQL (phpMyAdmin)    |
| ORM      | Entity Framework Core |

---

## ⚙️ Project Setup

### ✅ .NET Version

* Use: **.NET 6 / .NET 8 (recommended latest)**

---

### 🚀 Create Project

1. Open **Visual Studio 2022**
2. Click **Create New Project**
3. Select:

   ```
   ASP.NET Core Web App (Model-View-Controller)
   ```
4. Configure:

   * Project Name: `TechSportia`
   * Authentication: None
   * Enable HTTPS: Yes

---

## 📦 Required NuGet Packages

Install:

```
Pomelo.EntityFrameworkCore.MySql
Microsoft.EntityFrameworkCore.Tools
Microsoft.EntityFrameworkCore.Design
```

---

## ⚙️ Database Configuration

### 🔗 Connection String (appsettings.json)

```json
"ConnectionStrings": {
  "DefaultConnection": "server=localhost;database=YOUR_DB;user=YOUR_USER;password=YOUR_PASSWORD;"
}
```

---

### 🗄️ DbContext Setup

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))
    ));
```

---

## 🧩 Code First Approach (Models)

### 📁 Create Folder

```
Models/
```

### 📌 Entities Created

* College
* User
* Event
* Sport
* Team
* TeamMember
* IndividualRegistration
* Score
* Result

---

## 🗄️ Database Creation (Migrations)

### 🟢 Create Migration

```
Add-Migration InitialCreate
```

### 🟢 Update Database

```
Update-Database
```

---

## 🔁 Development Workflow

* Create/Update Model
* Run:

  ```
  Add-Migration MigrationName
  Update-Database
  ```
* Verify in phpMyAdmin

---

## 🧠 System Rules & Constraints

### 🏫 College Rules

* Must be approved by Super Admin
* Email must be unique
* Max **7 active events** per college

---

### 👤 User Rules

* Roles: SuperAdmin, Organizer, Player
* Email must be unique
* SuperAdmin → No College
* Others → Must belong to College

---

### 🏆 Event Rules

* Lifecycle:

  ```
  Draft → RegistrationOpen → Ongoing → Completed
  ```
* Max **7 active events per college**
* Max **10 sports per event**

---

### 🏅 Sport Rules

* Type: Individual / Team
* Registration date control
* Team sports require:

  * MinPlayers
  * MaxPlayers
  * MaxSubstitutes

---

### 👥 Team Rules

* Only for Team sports
* Requires organizer approval
* Must follow player limits

---

### 👤 TeamMember Rules

* Roles:

  * Captain
  * ViceCaptain
  * Player
  * Substitute
* Only **1 Captain per team**
* One user cannot join multiple teams in same sport

---

### 🧍 Individual Registration Rules

* Only for Individual sports
* One user → one registration per sport
* Requires approval

---

### 📊 Score Rules

* Either UserId OR TeamId (not both)
* Used for leaderboard

---

### 🏆 Result Rules

* Final ranking (Position)
* Created after event completion
* Not editable after publish

---

## 🧠 Architecture Overview

```
College → Event → Sport
                     ↓
        Team → TeamMember
                     ↓
                  Score → Result

User → IndividualRegistration → Score
```

---

## 🔒 Important Notes

* Use ENUM for roles and types
* Store ENUM as string in DB
* Use Fluent API for:

  * Unique constraints
  * Relationships

---

## 🚀 GitHub Setup

### Add README

```
git add README.md
git commit -m "Added project documentation"
git push
```

---

## 🎯 Future Enhancements

* Authentication (JWT)
* Role-based authorization
* Report generation (PDF/Excel)
* Notifications
* Deployment (Azure / AWS)

---

## 🎓 Academic Value

This project demonstrates:

* Multi-tenant system design
* Relational database modeling
* Role-based architecture
* Real-world event management system

---

## 👨‍💻 Author

TechSportia Project – Built for Academic Purpose
