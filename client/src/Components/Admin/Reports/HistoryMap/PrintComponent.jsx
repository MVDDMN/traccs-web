import React, { forwardRef } from 'react';
import './PrintComponent.css'; // Import the CSS file

const PrintComponent = forwardRef(({ data }, ref) => {
  return (
    <div ref={ref} className="print-component">
      <h1 className="print-heading">Reports History Data</h1>
      <table className="print-table">
        <thead>
          <tr>
            <th className="print-table-header">Name</th>
            <th className="print-table-header">Responder</th>
            <th className="print-table-header">Type</th>
            <th className="print-table-header">Location</th>
            <th className="print-table-header">Date & Time</th>
            <th className="print-table-header print-table-header-description">Description</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={index} className="print-table-row">
              <td className="print-table-cell">{entry.name}</td>
              <td className="print-table-cell">{entry.responder}</td>
              <td className="print-table-cell">{entry.type}</td>
              <td className="print-table-cell">{entry.location}</td>
              <td className="print-table-cell">{entry.report_date_time}</td>
              <td className="print-table-cell">
                <div className="description-content">
                  {entry.description.fire_type && <p><b>Fire Type:</b> {entry.description.fire_type}</p>}
                  {entry.description.severity && <p><b>Severity:</b> {entry.description.severity}</p>}
                  {entry.description.visible_flames && <p><b>Visible Flames:</b> {entry.description.visible_flames}</p>}
                  {entry.description.smoke && <p><b>Smoke:</b> {entry.description.smoke}</p>}
                  {entry.description.crime_type && <p><b>Crime Type:</b> {entry.description.crime_type}</p>}
                  {entry.description.in_progress && <p><b>In Progress:</b> {entry.description.in_progress}</p>}
                  {entry.description.collision_type && <p><b>Collision Type:</b> {entry.description.collision_type}</p>}
                  {entry.description.severity_of_accident && <p><b>Severity of Accident:</b> {entry.description.severity_of_accident}</p>}
                  {entry.description.blocked_road && <p><b>Blocked Road:</b> {entry.description.blocked_road}</p>}
                  {entry.description.number_of_people_involved && <p><b>Number of People Involved:</b> {entry.description.number_of_people_involved}</p>}
                  {entry.description.medical_emergency_type && <p><b>Medical Emergency Type:</b> {entry.description.medical_emergency_type}</p>}
                  {entry.description.consciousness && <p><b>Consciousness:</b> {entry.description.consciousness}</p>}
                  {entry.description.hazard_type && <p><b>Hazard Type:</b> {entry.description.hazard_type}</p>}
                  {entry.description.additional_description && <p><b>Additional Description:</b> {entry.description.additional_description}</p>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default PrintComponent;
