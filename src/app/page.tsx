'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Hls from 'hls.js';

type Category = 'live' | 'movies' | 'series';

interface Credentials {
  serverUrl: string;
  username: string;
  password: string;
}

interface VideoPlayerProps {
  streamUrl: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer = ({ streamUrl, title, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;
  const retryDelay = 2000;
  const bufferCheckInterval = 500;

  const initHls = useCallback(() => {
    if (!videoRef.current) return;
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const video = videoRef.current;
    const isMovie = streamUrl.includes('/movie/');
    const isSeries = streamUrl.includes('/series/');
    const isLive = !isMovie && !isSeries;

    console.log('Tipo contenuto:', isMovie ? 'Film' : isSeries ? 'Serie TV' : 'Live');
    
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: isLive,
      backBufferLength: isLive ? 90 : 30,
      maxBufferLength: isLive ? 30 : 60,
      maxMaxBufferLength: isLive ? 600 : 1200,
      maxBufferSize: isLive ? 60 * 1000 * 1000 : 120 * 1000 * 1000,
      maxBufferHole: isLive ? 0.5 : 0.3,
      highBufferWatchdogPeriod: isLive ? 2 : 1,
      nudgeMaxRetry: 10,
      nudgeOffset: 0.1,
      startFragPrefetch: true,
      testBandwidth: false,
      progressive: true,
      manifestLoadingTimeOut: 30000,
      manifestLoadingMaxRetry: 5,
      manifestLoadingRetryDelay: 2000,
      levelLoadingTimeOut: 30000,
      levelLoadingMaxRetry: 5,
      levelLoadingRetryDelay: 2000,
      fragLoadingTimeOut: 30000,
      fragLoadingMaxRetry: 5,
      fragLoadingRetryDelay: 2000,
      startLevel: -1,
      abrEwmaDefaultEstimate: 0,
      abrBandWidthFactor: 0,
      abrBandWidthUpFactor: 0,
      abrMaxWithRealBitrate: false,
      maxStarvationDelay: 4,
      maxLoadingDelay: 4,
      minAutoBitrate: 0,
      xhrSetup: function(xhr, url) {
        xhr.withCredentials = false;
        if (isMovie || isSeries) {
          xhr.setRequestHeader('Range', 'bytes=0-');
          xhr.setRequestHeader('Accept', '*/*');
        }
      }
    });

    hlsRef.current = hls;

    const manifestUrl = streamUrl.replace('.ts', '.m3u8');
    console.log('URL manifesto:', manifestUrl);
    
    hls.loadSource(manifestUrl);
    hls.attachMedia(video);
    
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('Manifesto HLS analizzato con successo');
      retryCountRef.current = 0;
      const levels = hls.levels;
      if (levels && levels.length > 0) {
        const highestLevel = levels.length - 1;
        hls.currentLevel = highestLevel;
        console.log('Impostata qualità massima:', levels[highestLevel]);
      }
      video.play().catch(error => {
        console.error('Errore durante la riproduzione:', error);
        if (isMovie || isSeries) {
          console.log('Tentativo di riproduzione diretta con .ts');
          video.src = streamUrl;
          video.load();
          video.play().catch(console.error);
        }
      });
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.log('Errore HLS:', data.type, data.details);
      
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            if (retryCountRef.current < maxRetries) {
              retryCountRef.current++;
              console.log(`Tentativo di recupero ${retryCountRef.current}/${maxRetries}`);
              setTimeout(() => hls.startLoad(), retryDelay);
            } else if (isMovie || isSeries) {
              console.log('Passaggio alla riproduzione diretta .ts');
              hls.destroy();
              video.src = streamUrl;
              video.load();
              video.play().catch(console.error);
            } else {
              hls.destroy();
              setTimeout(initHls, retryDelay);
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('Errore media, tentativo di recupero');
            hls.recoverMediaError();
            break;
          default:
            console.log('Errore fatale, ricarico player');
            hls.destroy();
            if (isMovie || isSeries) {
              video.src = streamUrl;
              video.load();
              video.play().catch(console.error);
            } else {
              setTimeout(initHls, retryDelay);
            }
            break;
        }
      }
    });

    const bufferCheck = setInterval(() => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const currentTime = video.currentTime;
        const bufferAhead = bufferedEnd - currentTime;
        
        if (bufferAhead < (isLive ? 5 : 10)) {
          console.log('Buffer basso, ricarico');
          hls.startLoad();
        }
      }
    }, bufferCheckInterval);

    return () => clearInterval(bufferCheck);
  }, [streamUrl]);

  useEffect(() => {
    if (Hls.isSupported()) {
      const cleanup = initHls();
      return () => {
        cleanup?.();
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    }
  }, [initHls]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="relative pt-[56.25%]">
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full"
            controls
            autoPlay
            playsInline
            crossOrigin="anonymous"
            preload="auto"
          >
            Il tuo browser non supporta il tag video.
          </video>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [channels, setChannels] = useState<any>({});
  const [vpnWarning, setVpnWarning] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('live');
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const fetchContent = useCallback(async (creds: Credentials) => {
    setLoading(true);
    setError('');

    try {
      const axiosInstance = axios.create({
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const [categoriesResponse, liveStreamsResponse, moviesResponse, seriesResponse] = await Promise.all([
        axiosInstance.get(`${creds.serverUrl}/player_api.php`, {
          params: {
            username: creds.username,
            password: creds.password,
            action: 'get_live_categories'
          }
        }),
        axiosInstance.get(`${creds.serverUrl}/player_api.php`, {
          params: {
            username: creds.username,
            password: creds.password,
            action: 'get_live_streams'
          }
        }),
        axiosInstance.get(`${creds.serverUrl}/player_api.php`, {
          params: {
            username: creds.username,
            password: creds.password,
            action: 'get_vod_streams'
          }
        }),
        axiosInstance.get(`${creds.serverUrl}/player_api.php`, {
          params: {
            username: creds.username,
            password: creds.password,
            action: 'get_series'
          }
        })
      ]);

      const organizedContent = {
        live: liveStreamsResponse.data.map((stream: any) => ({
          id: stream.stream_id,
          name: stream.name,
          streamUrl: `${creds.serverUrl}/live/${creds.username}/${creds.password}/${stream.stream_id}.ts`,
          logoUrl: stream.stream_icon,
          category: 'live'
        })),
        movies: moviesResponse.data.map((movie: any) => ({
          id: movie.stream_id,
          name: movie.name,
          streamUrl: `${creds.serverUrl}/movie/${creds.username}/${creds.password}/${movie.stream_id}.ts`,
          logoUrl: movie.stream_icon,
          category: 'movies',
          container_extension: movie.container_extension || 'ts',
          info: {
            duration: movie.duration,
            rating: movie.rating,
            releaseDate: movie.release_date,
            plot: movie.plot
          }
        })),
        series: seriesResponse.data.map((series: any) => ({
          id: series.series_id,
          name: series.name,
          streamUrl: `${creds.serverUrl}/series/${creds.username}/${creds.password}/${series.series_id}.ts`,
          logoUrl: series.cover,
          category: 'series'
        }))
      };

      setChannels(organizedContent);
      setVpnWarning(false);
    } catch (err: any) {
      console.error('Errore completo:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Timeout: Il server non ha risposto in tempo. Verifica che la VPN sia attiva e connessa a un server in Spagna.');
      } else if (err.response) {
        setError(`Errore del server: ${err.response.status} - ${err.response.statusText}`);
      } else if (err.request) {
        setError('Nessuna risposta dal server. Verifica che la VPN sia attiva e connessa a un server in Spagna.');
      } else {
        setError(`Errore: ${err.message || 'Errore durante il recupero dei contenuti'}`);
      }
      setVpnWarning(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedCredentials = localStorage.getItem('iptv_credentials');
    if (savedCredentials) {
      const parsedCredentials = JSON.parse(savedCredentials);
      setCredentials(parsedCredentials);
      fetchContent(parsedCredentials);
    } else {
      setShowCredentialsForm(true);
    }
  }, [fetchContent]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCredentials = {
      serverUrl: formData.get('serverUrl') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string
    };

    localStorage.setItem('iptv_credentials', JSON.stringify(newCredentials));
    setCredentials(newCredentials);
    setShowCredentialsForm(false);
    await fetchContent(newCredentials);
  }, [fetchContent]);

  const handleChangeCredentials = useCallback(() => {
    setShowCredentialsForm(true);
    setChannels({});
  }, []);

  const filteredContent = useMemo(() => {
    if (!channels[selectedCategory]) return [];
    return channels[selectedCategory].filter((item: any) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, selectedCategory, searchQuery]);

  const handleImageError = useCallback((id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="bg-blue-200 text-blue-900 p-4 rounded mb-6 text-center font-bold text-xl">
        Preview attiva! (branch test/preview)
      </div>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">IPTV Platform</h1>
          {!showCredentialsForm && (
            <button
              onClick={handleChangeCredentials}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cambia Credenziali
            </button>
          )}
        </div>
        
        {vpnWarning && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">Attenzione!</p>
            <p>Per accedere ai contenuti è necessario avere una VPN attiva e connessa a un server in Spagna.</p>
          </div>
        )}

        {showCredentialsForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700">
                Server URL
              </label>
              <input
                type="text"
                id="serverUrl"
                name="serverUrl"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="http://example.com:8080"
                required
                defaultValue={credentials?.serverUrl}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                defaultValue={credentials?.username}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                defaultValue={credentials?.password}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Caricamento...' : 'Connetti'}
            </button>
          </form>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {Object.keys(channels).length > 0 && (
          <div className="mt-8">
            <div className="mb-6">
              <input
                type="text"
                placeholder="Cerca contenuti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setSelectedCategory('live')}
                className={`px-4 py-2 rounded-md ${
                  selectedCategory === 'live'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Canali Live
              </button>
              <button
                onClick={() => setSelectedCategory('movies')}
                className={`px-4 py-2 rounded-md ${
                  selectedCategory === 'movies'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Film
              </button>
              <button
                onClick={() => setSelectedCategory('series')}
                className={`px-4 py-2 rounded-md ${
                  selectedCategory === 'series'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Serie TV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((item: any) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mb-2 flex items-center justify-center bg-gray-100 rounded">
                    {item.logoUrl && !imageErrors[item.id] ? (
                      <img
                        src={item.logoUrl}
                        alt={item.name}
                        className="w-16 h-16 object-contain"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <div className="text-gray-400 text-xs text-center">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium">{item.name}</h4>
                  {item.category === 'movies' && item.info && (
                    <div className="text-sm text-gray-600 mt-1">
                      {item.info.duration && <div>Durata: {item.info.duration}</div>}
                      {item.info.rating && <div>Rating: {item.info.rating}</div>}
                      {item.info.releaseDate && <div>Anno: {item.info.releaseDate}</div>}
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedVideo({ url: item.streamUrl, title: item.name })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Guarda
                  </button>
                </div>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center text-gray-500 mt-4">
                Nessun contenuto trovato
              </div>
            )}
          </div>
        )}

        {selectedVideo && (
          <VideoPlayer
            streamUrl={selectedVideo.url}
            title={selectedVideo.title}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </div>
    </main>
  );
}
