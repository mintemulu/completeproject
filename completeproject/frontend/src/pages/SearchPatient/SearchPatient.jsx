import { useState } from "react";
import "./SearchPatient.css";
import Button from "../../components/Button/Button";
import { makeGETrequest, makePOSTrequest } from "../../utils/api";
import CustomForm from "../../components/CustomForm/CustomForm";
import { useSelector } from "react-redux";
import "./SearchPatient.css";

const SearchPatient = () => {
  const [idnumber, setIdNumber] = useState("");
  const [message, setMessage] = useState("");
  const [patient, setPatient] = useState({});
  const [newMedicalRecord, setNewMedicalrecord] = useState("");
  const [
    showNewMedicalRecordFieldAndButton,
    setshowNewMedicalRecordFieldAndButton,
  ] = useState(false);

  const [updatedEmail, setUpdatedEmail] = useState("");
  const [updatedPhone, setUpdatedPhone] = useState("");

  const [showUpdateContactFields, setShowUpdateContactFields] = useState(false);

  const userSelector = useSelector((state) => state.user);

  async function submitSearch(e) {
    e.preventDefault();
    const res = await makeGETrequest(
      `http://localhost:5000/patients/search?idnumber=${idnumber}`
    );

    setMessage(res.message);

    // Don't try to access a property of an external object(e.g: coming from DB) directly, always perform if check
    if (res.patient) {
      setPatient(JSON.parse(res.patient));
    } else {
      setPatient({});
    }
  }

  async function submitNewMedicalRecord(e) {
    e.preventDefault();
    // res will have the patient with the new updated medical record
    const res = await makePOSTrequest(
      "http://localhost:5000/patients/addnewmedicalrecord",
      {
        medicalrecord: newMedicalRecord,
        idnumber: patient.idnumber,
      },
      localStorage.getItem("token")
    );

    if (res.status === 201) {
      setNewMedicalrecord("");
      setshowNewMedicalRecordFieldAndButton(
        !showNewMedicalRecordFieldAndButton
      );
      // Patient medical record is updated with a new record so reassign patient with new values
      setPatient(JSON.parse(res.patient));
    }
    setMessage(res.message);
  }

  async function updateContact(e) {
    e.preventDefault();
    const res = await makePOSTrequest(
      "http://localhost:5000/patients/updatecontact",
      {
        idnumber: patient.idnumber,
        email: updatedEmail,
        phone: updatedPhone,
      },
      localStorage.getItem("token")
    );
    if (res.status === 201) {
      setShowUpdateContactFields(!showUpdateContactFields);
      setPatient(JSON.parse(res.patient));
    }

    setMessage(res.message);
  }

  return (
    <div className="searchpatient-container">
      <h2>Search</h2>
      <CustomForm>
        <CustomForm.IDNumber
          value={idnumber}
          onChange={(e) => setIdNumber(e.target.value)}
        />
        <Button value="Search" onClick={submitSearch} /> <br />
      </CustomForm>

      {patient.username && (
        <div style={{ marginTop: "30px" }}>
          <p>
            <span style={{ fontWeight: "bold" }}>id: </span>
            {patient.idnumber}
          </p>
          <p>
            <span style={{ fontWeight: "bold" }}>Patient: </span>
            {patient.username}
          </p>
          <p>
            <span style={{ fontWeight: "bold" }}>Email: </span>
            {patient.email}
          </p>
          <p>
            <span style={{ fontWeight: "bold" }}>Address: </span>
            {patient.address}
          </p>
          <p>
            <span style={{ fontWeight: "bold" }}>Phone: </span>
            {patient.phone}
          </p>
          <ul>
            <span style={{ fontWeight: "bold" }}>Medical Record: </span>
            {patient.medicalrecord.map((item, index) => (
              <li key={index}>
                {item.date}: {item.record}
              </li>
            ))}
          </ul>
          {/* Only a doctor can diagnose a patient so add new medical record */}
          {userSelector.doctor && (
            <Button
              value="Add New record"
              onClick={() =>
                setshowNewMedicalRecordFieldAndButton(
                  !showNewMedicalRecordFieldAndButton
                )
              }
            />
          )}

          {/* Only admin can update patient contact info */}
          {userSelector.admin && (
            <Button
              value="Update patient contact information"
              onClick={() =>
                setShowUpdateContactFields(!showUpdateContactFields)
              }
            />
          )}
          <br />

          {showUpdateContactFields && (
            <CustomForm>
              <CustomForm.Email
                value={updatedEmail}
                onChange={(e) => setUpdatedEmail(e.target.value)}
              />

              <CustomForm.Phone
                value={updatedPhone}
                onChange={(e) => setUpdatedPhone(e.target.value)}
              />
              <Button value="Update" onClick={updateContact} />
            </CustomForm>
          )}

          {showNewMedicalRecordFieldAndButton && (
            <CustomForm>
              <CustomForm.MedicalRecord
                value={newMedicalRecord}
                onChange={(e) => setNewMedicalrecord(e.target.value)}
              />

              <Button value="Save" onClick={submitNewMedicalRecord} />
            </CustomForm>
          )}
        </div>
      )}
      {message}
    </div>
  );
};

export default SearchPatient;
