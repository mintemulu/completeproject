const express = require("express");
const router = express.Router();
const patientsController = require("../controllers/patientsController");
const verifyToken = require("../middlewares/verifyToken");

const {
  checkIDNumber,
  checkPhoneNumber,
  checkMedicalRecord,
  checkAddress,
  checkEmail,
  checkUserName,
} = require("../middlewares/checkInputs");

// Define routes related to users
router.post(
  "/registerpatient",
  verifyToken,
  checkIDNumber,
  checkUserName,
  checkEmail,
  checkAddress,
  checkPhoneNumber,
  checkMedicalRecord,
  patientsController.registerPatient
);

router.get("/search", patientsController.searchPatient);

// Only doctors can add a new medical record, admins can't do that because you must be a doctor to diagnose a patient
router.post(
  "/addnewmedicalrecord",
  verifyToken,
  checkIDNumber,
  checkMedicalRecord,
  patientsController.addNewMedicalRecord
);

router.post(
  "/updatecontact",
  verifyToken,
  checkIDNumber,
  checkEmail,
  checkPhoneNumber,
  patientsController.updateContact
);

router.use((err, req, res, next) => {
  // if there is error thrown from any middlewares such as checkEmail,checkPassword,checkPhoneNumber... this middleware runs and we see the error from the backend, if you just display err, we get the stack trace(where the error is coming from) and if you do err.message,we get the exact error
  console.log("FROM patients route middleware", err.message);
});

module.exports = router;
