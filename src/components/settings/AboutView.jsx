import { BackButton } from './common.jsx';

function AboutLink({ href, label, detail }) {
  return (
    <a className="settings-about-link" href={href} target="_blank" rel="noreferrer">
      <span>{label}</span>
      <strong>{detail}</strong>
    </a>
  );
}

export default function AboutView({ onBack }) {
  return (
    <>
      <BackButton onClick={onBack} />
      <div className="settings-about">
        <div className="settings-about-title">cupid player+</div>
        <div className="settings-about-copy">a tiny desktop music player</div>
        <div className="settings-about-list">
          <AboutLink
            href="https://github.com/cupidbity/cupid-music-player"
            label="original app"
            detail="cupidity"
          />
          <AboutLink
            href="https://github.com/KieranCR/cupid-music-player"
            label="fork repo"
            detail="KieranCR"
          />
          <AboutLink
            href="https://kierancr.com"
            label="site"
            detail="kierancr.com"
          />
        </div>
      </div>
    </>
  );
}
