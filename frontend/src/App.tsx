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
      medsMap[key].push(p);
    });

    return prescriptions.map(p => {
      let edgeCases: string[] = [];
      if (p.status === "active") {
        const group = medsMap[p.medication.name];
        const activeGroup = group.filter(x => x.status === "active");

        if (activeGroup.length > 1) {
          const facilities = new Set(activeGroup.map(x => x.facility.id));
          if (facilities.size > 1) edgeCases.push("Different facilities");

          const doses = new Set(activeGroup.map(x => x.dose));
          if (doses.size > 1) edgeCases.push("Dose changed");

          const sortedByPriority = [...activeGroup].sort(
            (a, b) => getPrescriptionPriority(b) - getPrescriptionPriority(a)
          );
          const topPriority = getPrescriptionPriority(sortedByPriority[0]);
          if (getPrescriptionPriority(p) !== topPriority) edgeCases.push("Lower priority/conflicting");
        }
      }

      const priorityValue = getPrescriptionPriority(p);
      let priorityLevel = "low";
      if (priorityValue >= 25) priorityLevel = "high";
      else if (priorityValue >= 15) priorityLevel = "medium";

      return { ...p, edgeCases, priorityLevel };
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
          className="timeline-event"
          style={{
            opacity: p.status !== "active" ? 0.5 : 1,
            borderLeftColor:
              p.priorityLevel === "high"
                ? "red"
                : p.priorityLevel === "medium"
                ? "orange"
                : "#1976d2" 
          }}
        >
          <div className="card-header">
            <div className="header-left">
              <div className="medication-title">
                <strong>{p.medication.name}</strong>
              </div>
              <div className="medication-dose">
                {p.dose}
              </div>
            </div>
            <span className={`status ${p.status}`}>{p.status}</span>
          </div>
            <div className="card-body">
              <div>
                <strong>Patient:</strong> {p.patient.name}
              </div>
              <div>
                <strong>Facility:</strong> {p.facility.name}
              </div>
              <div>
                {p.start_date} → {p.end_date ?? "Ongoing"}
              </div>

              <small>
                Source: {p.source.label}
              </small>

              <div className="edge-cases">
                {p.edgeCases.map((ec: string, i: number) => {
                  const ecClass =
                    ec === "Different facilities"
                      ? "ec-facility"
                      : ec === "Dose changed"
                      ? "ec-dose"
                      : ec === "Lower priority/conflicting"
                      ? "ec-priority"
                      : "";

                  return (
                    <span key={i} className={`edge-case-badge ${ecClass}`}>
                      {ec}
                    </span>
                  );
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default App;