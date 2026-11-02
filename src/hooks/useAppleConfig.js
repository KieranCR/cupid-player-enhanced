import { useCallback, useEffect, useState } from 'react';

/** Apple Music developer-key setup (team id, key id, .p8 private key). */
export default function useAppleConfig() {
  const [configReady, setConfigReady] = useState(false);
  const [configSource, setConfigSource] = useState(null);
  const [teamId, setTeamId] = useState('');
  const [keyId, setKeyId] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  useEffect(() => {
    if (!window.cupid?.getAppleMusicConfig) return;

    window.cupid.getAppleMusicConfig()
      .then((config) => {
        setConfigReady(!!config?.configured);
        setConfigSource(config?.source || null);
        setTeamId(config?.teamId || '');
        setKeyId(config?.keyId || '');
      })
      .catch((err) => {
        console.warn('Failed to load Apple Music config:', err);
      });
  }, []);

  const save = useCallback(async () => {
    if (!window.cupid?.saveAppleMusicConfig) {
      throw new Error('Apple Music setup is unavailable in this build.');
    }

    const config = await window.cupid.saveAppleMusicConfig({ teamId, keyId, privateKey });

    setConfigReady(!!config?.configured);
    setConfigSource(config?.source || null);
    setTeamId(config?.teamId || teamId);
    setKeyId(config?.keyId || keyId);
    setPrivateKey('');
    return config;
  }, [keyId, privateKey, teamId]);

  const ready = configReady || (
    teamId.trim().length > 0 &&
    keyId.trim().length > 0 &&
    privateKey.trim().length > 0
  );

  return {
    configReady,
    configSource,
    teamId,
    setTeamId,
    keyId,
    setKeyId,
    privateKey,
    setPrivateKey,
    ready,
    // Only re-save when there's nothing saved yet or a new key was pasted.
    needsSave: !configReady || privateKey.trim().length > 0,
    save,
  };
}
