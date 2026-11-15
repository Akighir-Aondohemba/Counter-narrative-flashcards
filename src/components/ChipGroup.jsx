export default function ChipGroup({ items, selected, onToggle }) {
  return (
    <div className="chips">
      {items.map(({ label, count }) => (
        <button
          key={label}
          type="button"
          className="chip"
          aria-pressed={selected.has(label)}
          onClick={() => onToggle(label)}
        >
          <svg className="tick" viewBox="0 0 16 16" aria-hidden="true">
            <path d="m3.5 8.5 3 3 6-7" />
          </svg>
          {label}
          <small>{count}</small>
        </button>
      ))}
    </div>
  );
}
