const { getDatabase, client } = require("../helpers/connectDB");
const returnStatus = require("../helpers/returnStatus");

const patientsController = {
  // This is a protected route, only doctors and admin can create a patient so we need to verify token but only a doctor can diagnose a patient,can add medical record
  registerPatient: async (req, res, next) => {
    try {
      const db = await getDatabase(); // getDatabase is an async function so use await

      // When registering a patient, we also need to check the idnumber and email of doctors to make sure that patient idnumber and email don't exist for a doctor
      const doctorid = await db.collection("doctors").findOne({
        $or: [{ email: req.body.email }, { idnumber: req.body.idnumber }],
      });

      if (doctorid) {
        return returnStatus(
          res,
          400,
          true,
          "You can't register a patient using this id number or email"
        );
      }

      const doctor = await db.collection("doctors").findOne({
        email: req.decodedtoken.email,
      });

      const admin = await db.collection("admin").findOne({
        email: req.decodedtoken.email,
      });

      // If the email that is used to register a patient exists in the admin collection,reject the request
      const emailExistsForAdmin = await db.collection("admin").findOne({
        email: req.body.email,
      });

      if (emailExistsForAdmin) {
        return returnStatus(
          res,
          400,
          true,
          "You can't register a patient using this email"
        );
      }

      // using ternary operator,we check if doctor is registering a patient,doctor can add a medical record.If admin is registering a patient,admin can't add a medical record
      const medicalrecord = doctor
        ? [
            {
              date: new Date().toLocaleDateString("en-GB"),
              record: req.body.medicalrecord,
            },
          ]
        : [];

      // If doctor or admin made this request,then we can register the patient
      if (doctor || admin) {
        const patients_collection = db.collection("patients");
        // If id or email already exists for the patient in the patients collection then don't register this patient
        const patient = await patients_collection.findOne({
          $or: [{ email: req.body.email }, { idnumber: req.body.idnumber }],
        });

        if (patient) {
          // console.log("Patient already exists in the collection.");
          // Make sure to return from the line below to not to continue the rest of the code
          return returnStatus(res, 400, true, "Patient already exists");
        }

        // Insert the patient document
        const result = await patients_collection.insertOne({
          idnumber: req.body.idnumber,
          username: req.body.username,
          email: req.body.email,
          address: req.body.address,
          phone: req.body.phone,
          medicalrecord: medicalrecord,
        });

        // ALWAYS make sure to return this json format where we send status code and have a message property because we will use this in the frontend
        return returnStatus(res, 200, false, "Patient added");
      }

      return returnStatus(
        res,
        401,
        true,
        "You aren't allowed to register a patient"
      );
    } catch (error) {
      console.error(error);
      return returnStatus(res, 500, true, "Internal server error");
    } finally {
      //The finally block in JavaScript runs after the try block and any catch blocks regardless of whether an error occurs or not. So it is a good place to close the open database connection to prevent memory leaks.
      if (client) {
        await client.close();
      }
    }
  },

  // anybody can search a patient, a receptionist,doctor,admin
  searchPatient: async (req, res) => {
    try {
      const db = await getDatabase();

      //projection helps us to omit fields, in this case _id and password
      const patient = await db
        .collection("patients")
        .findOne(
          { idnumber: req.query.idnumber },
          { projection: { _id: 0, password: 0 } }
        );

      if (patient) {
        const patientJson = JSON.stringify(patient);
        return returnStatus(res, 200, false, "Patient found", {
          patient: patientJson,
        });
      } else {
        return returnStatus(res, 404, true, "Patient not found");
      }
    } catch (error) {
      console.error(error);
      return returnStatus(res, 500, true, "Internal server error");
    } finally {
      if (client) {
        await client.close();
      }
    }
  },
  addNewMedicalRecord: async (req, res) => {
    try {
      const db = await getDatabase();

      // Notice,we get the 'decodedtoken' property attached to the req object from the verifyToken middleware
      const doctor = await db.collection("doctors").findOne({
        email: req.decodedtoken.email,
      });

      if (doctor) {
        // Append newObject to medicalrecord field which is an array
        const patient = await db.collection("patients").findOneAndUpdate(
          { idnumber: req.body.idnumber },
          {
            $push: {
              medicalrecord: {
                date: new Date().toLocaleDateString("en-GB"),
                record: req.body.medicalrecord,
              },
            },
          },
          { returnDocument: "after", projection: { _id: 0, password: 0 } } // Return the modified document without _id
        );

        if (!patient) {
          return returnStatus(res, 404, true, "Patient was not found");
        }

        const patientJson = JSON.stringify(patient);
        console.log(patient);

        return returnStatus(res, 201, false, "New Record for patient added", {
          patient: patientJson,
        });
      }
      // If we reach to this line, it means doctor wasn't found
      return returnStatus(res, 404, true, "Doctor was not found");
    } catch (error) {
      console.log(error);
      return returnStatus(res, 500, true, "Internal server error");
    } finally {
      if (client) {
        await client.close();
      }
    }
  },
  updateContact: async (req, res) => {
    try {
      const { phone, email, idnumber } = req.body;

      const db = await getDatabase();
      const admin = await db.collection("admin").findOne({
        email: req.decodedtoken.email,
      });

      // Only admin can update user/patient contact info
      if (admin) {
        // check if this new email doesn't exist as admin email or doctors email
        const adminEmailExists = await db.collection("admin").findOne({
          email: email,
        });

        const doctorEmailExists = await db.collection("doctors").findOne({
          email: email,
        });

        if (adminEmailExists || doctorEmailExists) {
          return returnStatus(res, 404, true, "You can't use this email");
        }

        const patient = await db.collection("patients").findOneAndUpdate(
          { idnumber: req.body.idnumber },
          {
            $set: {
              phone: phone,
              email: email,
            },
          },
          { returnDocument: "after", projection: { _id: 0, password: 0 } } // Return the modified document without _id and password
        );

        if (!patient) {
          return returnStatus(res, 404, true, "Patient was not found");
        }

        const patientJson = JSON.stringify(patient);
        console.log(patient);

        return returnStatus(res, 201, false, "patient updated", {
          patient: patientJson,
        });
      }
      // If we reach to this line, it means you aren't admin
      return returnStatus(res, 401, true, "Unauthorized");
    } catch (error) {
      console.log(error);
      return returnStatus(res, 500, true, "Internal server error");
    } finally {
      if (client) {
        await client.close();
      }
    }
  },
};

module.exports = patientsController;
