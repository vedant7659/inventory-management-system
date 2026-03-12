const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

// Middleware for parsing requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Database setup
const db = require("./app/models");
const Role = db.role;
const User = db.user;
const UserRole = db.user_roles;

const bcrypt = require("bcryptjs");

// Sync database
db.sequelize.sync();

/* Reset database if needed */
/*
db.sequelize.sync({ force: true }).then(() => {
  console.log("Database reset completed.");
  initial(db.sequelize);
});
*/

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Inventory Management System API running successfully.",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Inventory Management System API",
  });
});

// Routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/item.routes")(app);
require("./app/routes/service.routes")(app);
require("./app/routes/user-role.routes")(app);
require("./app/routes/student-item-req.routes")(app);
require("./app/routes/student-service-req.routes")(app);
require("./app/routes/academic-item-req.routes")(app);
require("./app/routes/academic-service-req.routes")(app);
require("./app/routes/profile.routes")(app);
require("./app/routes/reviewed-item-req.routes")(app);
require("./app/routes/reviewed-service-req.routes")(app);
require("./app/routes/issued-aca-item.routes")(app);
require("./app/routes/issued-stud-item.routes")(app);
require("./app/routes/proceeded-aca-service.routes")(app);
require("./app/routes/proceeded-stud-service.routes")(app);

// Server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Inventory Management System server running on port ${PORT}`);
});

// Initialize roles and default admin
function initial(sequelize) {
  Role.create({
    id: 1,
    name: "admin",
  });

  Role.create({
    id: 2,
    name: "non-academic",
  });

  Role.create({
    id: 3,
    name: "academic",
  });

  Role.create({
    id: 4,
    name: "student",
  });

  User.create({
    username: "system_admin",
    password: bcrypt.hashSync("admin123", 8),
  });

  UserRole.create({
    roleId: 1,
    username: "system_admin",
  });

  // Foreign key relationships
  sequelize.query(
    "ALTER TABLE issued_aca_item_requests ADD FOREIGN KEY (requestId) REFERENCES academic_item_requests (requestId);"
  );

  sequelize.query(
    "ALTER TABLE proceeded_aca_service_requests ADD FOREIGN KEY (requestId) REFERENCES academic_service_requests (requestId);"
  );

  sequelize.query(
    "ALTER TABLE issued_stud_item_requests ADD FOREIGN KEY (requestId) REFERENCES reviewed_item_requests (requestId);"
  );

  sequelize.query(
    "ALTER TABLE proceeded_stud_service_requests ADD FOREIGN KEY (requestId) REFERENCES reviewed_service_requests (requestId);"
  );
}