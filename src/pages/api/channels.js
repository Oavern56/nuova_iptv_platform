// src/pages/api/channels.js

export default async function handler(req, res) {
  const { username, password, server } = req.query;

  // Verifica che tutti i parametri siano presenti
  if (!username || !password || !server) {
    return res.status(400).json({ error: 'Parametri mancanti: username, password o server.' });
  }

  // Costruzione dell'URL API di Xtream Codes
  const apiUrl = `http://${server}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return res.status(502).json({ error: 'Errore nel recupero dei canali dal server Xtream Codes.' });
    }

    const channels = await response.json();

    return res.status(200).json(channels);
  } catch (error) {
    return res.status(500).json({ error: 'Errore interno del server: ' + error.message });
  }
}
