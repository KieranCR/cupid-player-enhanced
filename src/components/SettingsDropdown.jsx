import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function SettingsDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const updateRect = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (r) setMenuRect({ top: r.bottom, left: r.left, width: r.width });
    };
    updateRect();

    const onMouseDown = (e) => {
      if (!triggerRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', updateRect);
    // Close on scroll anywhere — positions become stale fast
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div className={`settings-dropdown ${open ? 'open' : ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className="settings-dropdown-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{current?.label ?? value}</span>
        <span className="settings-dropdown-chevron" aria-hidden="true">▾</span>
      </button>
      {open && menuRect && createPortal(
        <div
          ref={menuRef}
          className="settings-dropdown-menu"
          role="listbox"
          style={{
            position: 'fixed',
            top: `${menuRect.top + 2}px`,
            left: `${menuRect.left}px`,
            width: `${menuRect.width}px`,
          }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={`settings-dropdown-item ${o.value === value ? 'active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>,
        // Portal to .player so CSS custom properties (--color-primary, etc.)
        // and the theme class still cascade. document.body would orphan them.
        document.querySelector('.player') ?? document.body,
      )}
    </div>
  );
}
