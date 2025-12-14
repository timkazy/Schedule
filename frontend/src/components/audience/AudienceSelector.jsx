// components/audience/AudienceSelector.jsx
import React from 'react';

const AudienceSelector = ({ audiences, selectedAudience, onSelect, disabled, isEditing }) => {
  return (
    <div className="flex-1">
      <select
        value={selectedAudience?.number || ""}
        onChange={(e) => {
          const audience = audiences.find(a => a.number == e.target.value);
          onSelect(audience || null);
        }}
        disabled={disabled}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Выберите аудиторию...</option>
        {audiences.map(audience => (
          <option key={audience.number} value={audience.number}>
            Аудитория №{audience.number}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AudienceSelector;