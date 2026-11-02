export function BackButton({ onClick }) {
  return (
    <button className="settings-theme-btn" onClick={onClick}>
      back
    </button>
  );
}

export function PanelHeading({ title, count }) {
  return (
    <div className="settings-panel-heading">
      <span>{title}</span>
      {count !== undefined && <small>{count}</small>}
    </div>
  );
}

/** Standard panel button; `disabled` also applies the pixel-art disabled style. */
export function PanelButton({ active = false, disabled = false, className = '', children, ...props }) {
  const classes = ['settings-theme-btn', active && 'active', disabled && 'disabled', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={classes} disabled={disabled || undefined} {...props}>
      {children}
    </button>
  );
}

export function ErrorMessage({ error }) {
  return error ? <div className="settings-error">{error}</div> : null;
}
