import { useState } from "react";

function DropdownList({ options = [], onSelect }) {
  const [search, setSearch] = useState("");

  // Фильтруем опции по label
  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-md p-2">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск..."
        className="w-full mb-2 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
      />
      <div className="max-h-40 overflow-y-auto">
        {filtered.map((opt) => (
          <div
            key={opt.id}
            onClick={() => onSelect(opt.value)}
            className={`px-2 py-1 text-sm hover:bg-green-50 cursor-pointer rounded ${opt.id === "not-selected" ? "opacity-50" : ""}`}
          >
            {opt.label}
            {opt.id === "not-selected" && " ✕"}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DropdownList;