import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [status, setStatus] = useState("");      
  const [startDate, setStartDate] = useState("");  
  const [endDate, setEndDate] = useState("");  

  useEffect(() => {
    fetch("http://localhost:8000/api/patients/")
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(err => console.error(err));
  }, []);

  const loadPrescriptions = () => {
    let url = "http://localhost:8000/api/prescriptions/?";

    if (selectedPatient) url += `patient_id=${selectedPatient}&`;
    if (status) url += `status=${status}&`;
    if (startDate && endDate) url += `start=${startDate}&end=${endDate}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const sortedData = data.sort((a: any, b: any) => {
          const aEnd = a.end_date ? new Date(a.end_date).getTime() : Infinity;
          const bEnd = b.end_date ? new Date(b.end_date).getTime() : Infinity;

          if (aEnd !== bEnd) return bEnd - aEnd;
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        });


        setPrescriptions(sortedData);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);


  return (
    <div className="App">
      <h1>Medication Timeline</h1>

      <div className="filters">
        <label>Patient: </label>
        <select
          value={selectedPatient}
          onChange={e => setSelectedPatient(e.target.value)}
        >
          <option value="">All patients</option>
          {(patients as any).map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label>Status: </label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="stopped">Stopped</option>
          <option value="unknown">Unknown</option>
        </select>

        <label>Start:</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />

        <label>End:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />

        <button onClick={loadPrescriptions}>Apply Filters</button>
      </div>

      <ul className="timeline">
        {prescriptions.map((p: any) => (
          <li key={p.id} className="timeline-event">
            <div className="card-header">
              <strong>{p.medication.name}</strong> ({p.dose})
              <span className={`status ${p.status}`}>{p.status}</span>
            </div>
            <div className="card-body">
              Patient: {p.patient.name} <br />
              Facility: {p.facility.name} <br />
              {p.start_date} → {p.end_date ?? "Ongoing"}
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default App;
