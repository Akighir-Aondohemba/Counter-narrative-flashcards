import { useRef } from "react";

// What the picker button says about the current selection.
export function summary(items, selected) {
  const on = items.filter((i) => selected.has(i.label)).map((i) => i.label);
  if (on.length === items.length) return `All ${items.length}`;
  if (on.length === 0) return "None";
  if (on.length <= 2) return on.join(", ");
  return `${on.length} of ${items.length}`;
}

// A button showing what is selected, which opens a checkbox list as a sheet
// (bottom of the screen on phones, centred on wider screens). Items may carry a
// `learned` count, shown as "3/5" with a small progress bar.
export default function FilterPicker({ title, items, selected, onToggle, onSetAll }) {
  const dialog = useRef(null);
  const allOn = items.every((i) => selected.has(i.label));
  const close = () => dialog.current?.close();

  return (
    <>
      <button type="button" className="picker" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        <span className="picker-label">{title}</span>
        <span className="picker-value">{summary(items, selected)}</span>
        <span className="chev" aria-hidden="true">▾</span>
      </button>

      <dialog
        ref={dialog}
        className="sheet"
        aria-label={title}
        onClick={(e) => e.target === dialog.current && close()} // tap outside the sheet to close
      >
        <div className="sheet-head">
          <h3>{title}</h3>
          <button type="button" className="link" onClick={() => onSetAll(allOn ? [] : items.map((i) => i.label))}>
            {allOn ? "Clear all" : "Select all"}
          </button>
        </div>
        <ul className="options">
          {items.map(({ label, count, learned = 0 }) => (
            <li key={label}>
              <label>
                <input type="checkbox" checked={selected.has(label)} onChange={() => onToggle(label)} />
                <span className="box" aria-hidden="true" />
                <span className="opt-label">
                  {label}
                  {learned > 0 && (
                    <span className="opt-progress" aria-label={`${learned} of ${count} learned`}>
                      <span style={{ width: `${(learned / count) * 100}%` }} />
                    </span>
                  )}
                </span>
                <small className={learned === count && count > 0 ? "complete" : ""}>
                  {learned > 0 ? `${learned}/${count}` : count}
                </small>
              </label>
            </li>
          ))}
        </ul>
        <div className="sheet-foot">
          <button type="button" className="btn primary big" onClick={close}>
            Done
          </button>
        </div>
      </dialog>
    </>
  );
}
