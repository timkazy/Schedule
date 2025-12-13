// components/disciplines/SubjectLoadSelector.jsx
import React from 'react';

const SubjectLoadSelector = ({ subjectLoads, selectedSubjectLoad, onSelect, disabled, isEditing }) => {
  const formatSubjectLoad = (load) => {
    const semester = load.semester === 1 ? 'Весна' : 'Осень';
    return `${load.subject_name} (${load.department_name}, ${load.type} курс ${load.course}, ${semester})`;
  };

  return (
    <div className="flex-1">
      <select
        value={selectedSubjectLoad?.id || ""}
        onChange={(e) => {
          const load = subjectLoads.find(l => l.id == e.target.value);
          onSelect(load || null);
        }}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Выберите нагрузку...</option>
        {subjectLoads.map(load => (
          <option key={load.id} value={load.id}>
            {formatSubjectLoad(load)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubjectLoadSelector;