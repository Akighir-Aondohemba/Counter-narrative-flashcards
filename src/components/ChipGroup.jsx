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
          {label}
          <small>{count}</small>
        </button>
      ))}
    </div>
  );
}
