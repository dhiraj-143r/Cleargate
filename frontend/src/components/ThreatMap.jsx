import { useState, useEffect } from 'react';

// Simplified low-res world map path
const WORLD_PATH = "M 32.5 12.8 C 32.5 12.8 33.2 13.5 33.8 13.6 C 34.4 13.8 35.1 13.6 35.3 13.3 C 35.5 13.0 35.5 12.6 35.4 12.1 C 35.3 11.6 34.6 11.4 34.0 11.4 C 33.4 11.4 32.5 11.7 32.5 12.8 Z M 48.0 20.2 C 48.0 20.2 48.4 20.5 49.3 20.4 C 50.1 20.2 50.8 19.5 50.9 18.9 C 51.0 18.2 50.6 17.5 49.9 17.3 C 49.1 17.1 48.2 17.8 47.9 18.7 C 47.6 19.6 48.0 20.2 48.0 20.2 Z M 57.0 28.5 C 57.0 28.5 58.0 29.0 59.5 28.8 C 61.0 28.5 62.0 27.5 62.1 26.5 C 62.2 25.5 61.5 24.5 60.5 24.2 C 59.5 23.9 58.0 24.5 57.5 25.5 C 57.0 26.5 57.0 28.5 57.0 28.5 Z M 72.0 35.5 C 72.0 35.5 73.0 36.0 74.5 35.8 C 76.0 35.5 77.0 34.5 77.1 33.5 C 77.2 32.5 76.5 31.5 75.5 31.2 C 74.5 30.9 73.0 31.5 72.5 32.5 C 72.0 33.5 72.0 35.5 72.0 35.5 Z M 21.0 42.5 C 21.0 42.5 22.0 43.0 23.5 42.8 C 25.0 42.5 26.0 41.5 26.1 40.5 C 26.2 39.5 25.5 38.5 24.5 38.2 C 23.5 37.9 22.0 38.5 21.5 39.5 C 21.0 40.5 21.0 42.5 21.0 42.5 Z M 35.0 55.5 C 35.0 55.5 36.0 56.0 37.5 55.8 C 39.0 55.5 40.0 54.5 40.1 53.5 C 40.2 52.5 39.5 51.5 38.5 51.2 C 37.5 50.9 36.0 51.5 35.5 52.5 C 35.0 53.5 35.0 55.5 35.0 55.5 Z M 15.0 25.5 C 15.0 25.5 16.0 26.0 17.5 25.8 C 19.0 25.5 20.0 24.5 20.1 23.5 C 20.2 22.5 19.5 21.5 18.5 21.2 C 17.5 20.9 16.0 21.5 15.5 22.5 C 15.0 23.5 15.0 25.5 15.0 25.5 Z M 85.0 15.5 C 85.0 15.5 86.0 16.0 87.5 15.8 C 89.0 15.5 90.0 14.5 90.1 13.5 C 90.2 12.5 89.5 11.5 88.5 11.2 C 87.5 10.9 86.0 11.5 85.5 12.5 C 85.0 13.5 85.0 15.5 85.0 15.5 Z";

const THREAT_LOCATIONS = [
  { name: 'Moscow', x: 60, y: 25, type: 'SANCTIONS' },
  { name: 'Beijing', x: 75, y: 35, type: 'MALWARE' },
  { name: 'Tehran', x: 63, y: 38, type: 'SANCTIONS' },
  { name: 'Pyongyang', x: 82, y: 34, type: 'SANCTIONS' },
  { name: 'Lagos', x: 50, y: 55, type: 'FRAUD' },
  { name: 'Caracas', x: 30, y: 52, type: 'SANCTIONS' },
  { name: 'St. Petersburg', x: 58, y: 22, type: 'MALWARE' },
  { name: 'London', x: 48, y: 28, type: 'FRAUD' }
];

export default function ThreatMap() {
  const [pings, setPings] = useState([]);

  useEffect(() => {
    // Spawns a new ping every 1.5 to 3 seconds
    const interval = setInterval(() => {
      const randomLocation = THREAT_LOCATIONS[Math.floor(Math.random() * THREAT_LOCATIONS.length)];
      const newPing = {
        id: Date.now(),
        ...randomLocation,
      };
      
      setPings((prev) => {
        // Keep only the last 6 pings to avoid DOM clutter
        const next = [...prev, newPing];
        if (next.length > 6) next.shift();
        return next;
      });
    }, Math.random() * 1500 + 1500);

    return () => clearInterval(interval);
  }, []);

  const getPingColor = (type) => {
    switch(type) {
      case 'SANCTIONS': return 'rgba(239, 68, 68, 0.8)'; // Red
      case 'MALWARE': return 'rgba(245, 158, 11, 0.8)'; // Amber
      case 'FRAUD': return 'rgba(16, 185, 129, 0.8)'; // Emerald
      default: return 'var(--accent)';
    }
  };

  return (
    <div className="card mb-32 no-print" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '24px 24px 0 24px', zIndex: 10, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="mono mb-8" style={{ display: 'block' }}>GLOBAL INTELLIGENCE NETWORK</span>
            <h2 className="heading-md">Live Threat Map</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width: 8, height: 8, borderRadius: '50%', background: getPingColor('SANCTIONS')}}/> <span className="mono" style={{fontSize: '10px'}}>OFAC</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width: 8, height: 8, borderRadius: '50%', background: getPingColor('MALWARE')}}/> <span className="mono" style={{fontSize: '10px'}}>MALWARE</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{width: 8, height: 8, borderRadius: '50%', background: getPingColor('FRAUD')}}/> <span className="mono" style={{fontSize: '10px'}}>FRAUD</span></div>
          </div>
        </div>
      </div>

      <div style={{ 
        width: '100%', 
        height: '300px', 
        position: 'relative', 
        background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        borderTop: '1px solid var(--border)',
        marginTop: '20px'
      }}>
        
        {/* World Map SVG Overlay */}
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, opacity: 0.15, transform: 'scale(1.2)' }}>
          {/* A simple dotted map representation */}
          <path d="M15,25 Q30,10 50,20 T85,15 M20,40 Q40,30 60,45 T90,30 M25,60 Q45,50 65,60 T85,75 M35,80 Q55,70 70,85 T95,65" 
            fill="none" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="1 2" />
          <path d={WORLD_PATH} fill="var(--accent)" opacity="0.3" />
        </svg>

        {/* Threat Pings */}
        {pings.map((ping) => (
          <div key={ping.id} style={{
            position: 'absolute',
            left: `${ping.x}%`,
            top: `${ping.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 20
          }}>
            {/* Pulsing ring */}
            <div style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              background: getPingColor(ping.type),
              borderRadius: '50%',
              top: '-20px',
              left: '-20px',
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) forwards'
            }} />
            
            {/* Center dot */}
            <div style={{
              width: '6px',
              height: '6px',
              background: getPingColor(ping.type),
              borderRadius: '50%',
              boxShadow: `0 0 10px ${getPingColor(ping.type)}`,
              animation: 'pulse 2s infinite'
            }} />
            
            {/* Label */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              color: 'var(--text)',
              fontFamily: 'var(--mono)',
              fontSize: '9px',
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              whiteSpace: 'nowrap',
              animation: 'fade-in 0.3s ease-out'
            }}>
              {ping.name} · BLOCK
            </div>
          </div>
        ))}
        
        {/* Scanning line overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'rgba(110, 86, 207, 0.5)',
          boxShadow: '0 0 20px rgba(110, 86, 207, 0.8)',
          animation: 'scanline 4s linear infinite'
        }} />
      </div>
    </div>
  );
}
