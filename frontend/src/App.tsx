import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  type Prescription = {
    id: number;
    patient: { id: number; name: string };
    medication: { id: number; name: string };
    facility: { id: number; name: string };
    dose: string;
    start_date: string;
    end_date: string | null;
    status: string;
    source: { type: string; label: string; confidence: number };
    edgeCases: string[];
  };

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
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
      
        const processed = processEdgeCases(sortedData);
        setPrescriptions(processed);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const SOURCE_PRIORITY: Record<string, number> = {
    ehr: 3,
    manual: 2,
    other: 1,
  };

  function getPrescriptionPriority(prescription: any) {
      const typePriority = SOURCE_PRIORITY[prescription.source.type.toLowerCase()] || 0;
      const confidence = prescription.source.confidence || 0;
      return typePriority * 10 + confidence; 
  }

  function processEdgeCases(prescriptions: any[]) {
    const medsMap: Record<string, any[]> = {};

    prescriptions.forEach(p => {
      const key = p.medication.name;
      if (!medsMap[key]) medsMap[key] = [];
      if (p.status === "active") medsMap[key].push(p);
    });

    return prescriptions.map(p => {
      if (p.status !== "active") return { ...p, edgeCases: [] };

      const edgeCases: string[] = [];
      const group = medsMap[p.medication.name];

      if (group.length > 1) {
        const facilities = new Set(group.map(x => x.facility.id));
        if (facilities.size > 1) edgeCases.push("Different facilities");

        const doses = new Set(group.map(x => x.dose));
        if (doses.size > 1) edgeCases.push("Dose changed");

        const sortedByPriority = [...group].sort(
          (a, b) => getPrescriptionPriority(b) - getPrescriptionPriority(a)
        );
        const topPriority = getPrescriptionPriority(sortedByPriority[0]);
        if (getPrescriptionPriority(p) !== topPriority) {
          edgeCases.push("Lower priority/conflicting");
        }
      }

      return { ...p, edgeCases };
    });
  }

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
          <li
            key={p.id}
            className={`timeline-event ${p.edgeCases.includes("Lower priority/conflicting") ? "low-priority" : ""}`}
            style={{ opacity: p.status !== "active" ? 0.5 : 1 }}
          >
            <div className="card-header">
              <strong>{p.medication.name}</strong> ({p.dose})
              <span className={`status ${p.status}`}>{p.status}</span>
            </div>
            <div className="card-body">
              Patient: {p.patient.name} <br />
              Facility: {p.facility.name} <br />
              {p.start_date} → {p.end_date ?? "Ongoing"} <br />
              <small style={{ fontStyle: "italic", color: "#555" }}>
                Source: {p.source.label}
              </small>
              <div className="edge-cases">
                {p.edgeCases.map((ec: string, i: number) => (
                  <span key={i} className="edge-case-badge">{ec}</span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default App;