import { BackButton, ErrorMessage, PanelButton, PanelHeading } from './common.jsx';

/** Override which YouTube video plays for the current streaming track. */
export default function SourceView({ track, canChange, override, avoidText, onAvoidTextChange, error, onBack }) {
  const { input, setInput, busy, message, save, clear } = override;

  return (
    <>
      <BackButton onClick={onBack} />
      <PanelHeading title="source" />
      <div className="settings-source-card">
        <span>current</span>
        <strong>{canChange ? track.title : 'no track loaded'}</strong>
        {canChange && track.artist && <small>{track.artist}</small>}
      </div>
      <input
        className="settings-input"
        type="text"
        placeholder="youtube url or id"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={!canChange || busy}
      />
      <div className="settings-theme-row">
        <PanelButton disabled={busy || !canChange || !input.trim()} onClick={save}>
          save
        </PanelButton>
        <PanelButton disabled={busy || !canChange} onClick={clear}>
          clear
        </PanelButton>
      </div>
      <div className="settings-label">avoid words</div>
      <textarea
        className="settings-input settings-textarea"
        value={avoidText}
        onChange={(e) => onAvoidTextChange(e.target.value)}
      />
      {message && <div className="settings-source-note">{message}</div>}
      <ErrorMessage error={error} />
    </>
  );
}
