require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

/* ---------------------------
CORS Configuration
--------------------------- */
const corsOptions = {
origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

/* ---------------------------
Middleware
--------------------------- */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* ---------------------------
Database Setup
--------------------------- */
const db = require("./app/models");
const Role = db.role;
const User = db.user;
const UserRole = db.user_roles;

const bcrypt = require("bcryptjs");

/* ---------------------------
Sync Database
--------------------------- */
db.sequelize.sync();

/*
Use this only when resetting database

db.sequelize.sync({ force: true }).then(() => {
console.log("Database reset completed.");
initial(db.sequelize);
});
*/

/* ---------------------------
Root Endpoint
--------------------------- */
app.get("/", (req, res) => {
res.json({
service: "Inventory Management System API",
status: "running",
version: "1.0.0",
timestamp: new Date(),
});
});

/* ---------------------------
Health Check Endpoint
--------------------------- */
app.get("/api/health", (req, res) => {
res.status(200).json({
status: "OK",
service: "Inventory Management System API",
timestamp: new Date(),
});
});

/* ---------------------------
API Routes
--------------------------- */
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

/* ---------------------------
Global Error Handler
--------------------------- */
const errorHandler = require("./app/middleware/errorHandler");
app.use(errorHandler);

/* ---------------------------
Server Configuration
--------------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Inventory Management System server running on port ${PORT}`);
});

/* ---------------------------
Initial Database Setup
--------------------------- */
function initial(sequelize) {
Role.create({ id: 1, name: "admin" });
Role.create({ id: 2, name: "non-academic" });
Role.create({ id: 3, name: "academic" });
Role.create({ id: 4, name: "student" });

User.create({
username: "system_admin",
password: bcrypt.hashSync("admin123", 8),
});

UserRole.create({
roleId: 1,
username: "system_admin",
});

/* Foreign Key Relationships */

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
