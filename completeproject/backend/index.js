// Import the Express module
require("dotenv").config(); //install dotenv package to do this
const express = require("express");
const cors = require("cors");

// Get the routes
const patientsRouter = require("./routes/patients");
const doctorsRouter = require("./routes/doctors");
const usersRouter = require("./routes/users");

const returnStatus = require("./helpers/returnStatus");

// Create an instance of Express
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors());

//apply route middlewares to these routes
app.use("/patients", patientsRouter);
app.use("/doctors", doctorsRouter);
app.use("/users", usersRouter);

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

// Error handling middleware for non-existing routes
app.use((req, res, next) => {
  return returnStatus(res, 404, true, "Not found");
});

// Start the server
const port = process.env.PORT || 5000; // Use the provided port or default to 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
