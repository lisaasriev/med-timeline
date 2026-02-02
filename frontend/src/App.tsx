import React, { useEffect, useState } from "react";
import InfoIcon from "@mui/icons-material/Info";
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
    priorityLevel?: string;
  };

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patients/`);
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, [API_URL]);

  useEffect(() => {
    const loadPrescriptions = async () => {
      const SOURCE_PRIORITY: Record<string, number> = {
        ehr: 3,
        manual: 2,
        other: 1
      };

      const getPrescriptionPriority = (p: Prescription) => {
        const typePriority = SOURCE_PRIORITY[p.source.type.toLowerCase()] || 0;
        const confidence = p.source.confidence || 0;
        return typePriority * 10 + confidence;
      };

      const processEdgeCases = (data: Prescription[]) => {
        const groupMap: Record<string, Prescription[]> = {};
        data.forEach(p => {
          const key = `${p.patient.id}-${p.medication.name}`;
          if (!groupMap[key]) groupMap[key] = [];
          groupMap[key].push(p);
        });

        return data.map(p => {
          let edgeCases: string[] = [];
          const key = `${p.patient.id}-${p.medication.name}`;
          const group = groupMap[key];

          if (p.status === "active") {
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
              if (getPrescriptionPriority(p) !== topPriority)
                edgeCases.push("Lower priority/conflicting");
            }
          }

          const priorityValue = getPrescriptionPriority(p);
          let priorityLevel = "low";
          if (priorityValue >= 25) priorityLevel = "high";
          else if (priorityValue >= 15) priorityLevel = "medium";

          return { ...p, edgeCases, priorityLevel };
        });
      };

      try {
        let url = `${API_URL}/api/prescriptions/?`;
        if (selectedPatient) url += `patient_id=${selectedPatient}&`;
        if (status) url += `status=${status}&`;
        if (startDate && endDate) url += `start=${startDate}&end=${endDate}&`;

        const res = await fetch(url);
        const data: Prescription[] = await res.json();

        let filtered = data.filter(p => {
          let keep = true;
          if (startDate) keep = keep && new Date(p.start_date) >= new Date(startDate);
          if (endDate) {
            const end = p.end_date ? new Date(p.end_date) : null;
            keep = keep && end !== null && end <= new Date(endDate);
          }
          return keep;
        });

        const sortedData = filtered.sort((a, b) => {
          const aEnd = a.end_date ? new Date(a.end_date).getTime() : Infinity;
          const bEnd = b.end_date ? new Date(b.end_date).getTime() : Infinity;
          if (aEnd !== bEnd) return bEnd - aEnd;
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        });

        setPrescriptions(processEdgeCases(sortedData));
      } catch (err) {
        console.error(err);
      }
    };

    loadPrescriptions();
  }, [API_URL, selectedPatient, status, startDate, endDate]);

  const groupedPrescriptions = React.useMemo(() => {
    const groups: Record<string, Prescription[]> = {};
    prescriptions.forEach(p => {
      const key = p.medication.name;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [prescriptions]);

  return (
    <div className="App">
      <h1>💊 Medication Timeline</h1>

      <div className="filters">
        <span className="tooltip">
          <InfoIcon className="info-icon" />
          <span className="tooltiptext">
            <strong>Prescription Source Priorities:</strong><br />
            <span style={{ color: "red" }}>■ High</span> — High priority<br />
            <span style={{ color: "orange" }}>■ Medium</span> — Moderate priority<br />
            <span style={{ color: "#1976d2" }}>■ Low</span> — Normal priority
          </span>
        </span>

        <label>Patient: </label>
        <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
          <option value="">All patients</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
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
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <label>End:</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <button onClick={() => setPrescriptions([...prescriptions])}>
          Apply Filters
        </button>
      </div>

      <ul className="timeline">
        {Object.entries(groupedPrescriptions).map(([medName, group]) => (
          <li key={medName} className="medication-group">
            <div className="medication-group-title">{medName}</div>

            {group.map(p => (
              <div key={p.id} className="timeline-event"
                style={{
                  opacity: p.status !== "active" ? 0.5 : 1,
                  borderLeftColor: p.priorityLevel === "high" ? "red" : p.priorityLevel === "medium" ? "orange" : "#1976d2"
                }}
              >
                <div className="card-header">
                  <div className="header-left">
                    <div className="medication-title"><strong>{p.medication.name}</strong></div>
                    <div className="medication-dose">{p.dose}</div>
                  </div>
                  <span className={`status ${p.status}`}>{p.status}</span>
                </div>

                <div className="card-body">
                  <div><strong>Patient:</strong> {p.patient.name}</div>
                  <div><strong>Facility:</strong> {p.facility.name}</div>
                  <div>{p.start_date} → {p.end_date ?? "Ongoing"}</div>
                  <small>Source: {p.source.label}</small>

                  <div className="edge-cases">
                    {p.edgeCases.map((ec, i) => {
                      const ecClass =
                        ec === "Different facilities" ? "ec-facility"
                        : ec === "Dose changed" ? "ec-dose"
                        : ec === "Lower priority/conflicting" ? "ec-priority" : "";
                      return <span key={i} className={`edge-case-badge ${ecClass}`}>{ec}</span>;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
