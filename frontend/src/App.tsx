import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/prescriptions/?patient_id=4")
      .then(res => res.json())
      .then(data => {
        setPrescriptions(data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="App">
      <h1>Medication Timeline</h1>

      <ul>
        {prescriptions.map((p: any) => (
          <li key={p.id} style={{ marginBottom: "10px" }}>
            <strong>{p.medication.name}</strong> ({p.dose})
            <br />
            Facility: {p.facility.name}
            <br />
            {p.start_date} → {p.end_date ?? "Ongoing"}
            <br />
            Status: {p.status}
          </li>
        ))}
      </ul>

    </div>
  );
}

export default App;
