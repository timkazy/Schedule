// components/platoons/DepartmentSelector.jsx
import React from 'react';

const DepartmentSelector = ({ departments, selectedDepartment, onSelect, disabled }) => {
  return (
    <div className="flex-1">
      <select
        value={selectedDepartment?.id || ""}
        onChange={(e) => {
          const dept = departments.find(d => d.id == e.target.value);
          onSelect(dept || null);
        }}
        disabled={disabled}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Выберите кафедру...</option>
        {departments.map(dept => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DepartmentSelector;