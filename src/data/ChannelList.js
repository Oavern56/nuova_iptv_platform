import React, { useState, useEffect } from 'react';

const ChannelList = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('/api/channels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'LilloBMW',  // Inserisci il tuo username
            password: 'jXgrudd',  // Inserisci la tua password
            server: 'ttp://sgay.xyz:8080',      // Inserisci l'indirizzo del tuo server Xtream Codes
          }),
        });

        if (!response.ok) {
          throw new Error('Errore nel recuperare i canali');
        }

        const data = await response.json();
        setChannels(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (error) {
    return <div>Errore: {error}</div>;
  }

  return (
    <div>
      <h1>Lista dei Canali IPTV</h1>
      <ul>
        {channels.map(channel => (
          <li key={channel.id}>
            {channel.name} - {channel.genre}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChannelList;
