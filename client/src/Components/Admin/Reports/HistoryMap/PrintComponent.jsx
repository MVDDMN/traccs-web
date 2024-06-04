import React, { forwardRef } from 'react';
import './PrintComponent.css'; // Import the CSS file

const PrintComponent = forwardRef(({ data }, ref) => {
  return (
    <div ref={ref} className="print-component">
      <h1 className="print-heading">History Data</h1>
      <table className="print-table">
        <thead>
          <tr>
            <th className="print-table-header">Name</th>
            <th className="print-table-header">Date</th>
            <th className="print-table-header">Time</th>
            <th className="print-table-header">Address</th>
            <th className="print-table-header">Location</th>
            <th className="print-table-header">Type</th>
            <th className="print-table-header">Status</th>
            <th className="print-table-header">Description</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={index} className="print-table-row">
              <td className="print-table-cell">{entry.name}</td>
              <td className="print-table-cell">{entry.date}</td>
              <td className="print-table-cell">{entry.time}</td>
              <td className="print-table-cell">{entry.address}</td>
              <td className="print-table-cell">{entry.location}</td>
              <td className="print-table-cell">{entry.type}</td>
              <td className="print-table-cell">{entry.status}</td>
              <td className="print-table-cell">{entry.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default PrintComponent;
