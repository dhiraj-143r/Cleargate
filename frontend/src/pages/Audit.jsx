import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const INITIAL_LOGS = [
  { time: new Date(Date.now() - 10000).toISOString(), level: 'INFO', module: 'SYSTEM', message: 'ClearGate Agent initialized v2.1.0' },
  { time: new Date(Date.now() - 9500).toISOString(), level: 'INFO', module: 'LOCUS', message: 'Connected to Base mainnet RPC' },
  { time: new Date(Date.now() - 9000).toISOString(), level: 'INFO', module: 'GEMINI', message: 'AI Synthesis Engine ready' }
];

const SIMULATED_ACTIVITY = [
  { delay: 1500, level: 'WARN', module: 'NET', message: 'Inbound verification request detected (IP: 142.250.190.46)' },
  { delay: 800, level: 'INFO', module: 'AGENT', message: 'Target acquired: "globaltech.com" (Type: DOMAIN)' },
  { delay: 1200, level: 'INFO', module: 'AGENT', message: 'Spawning 7 parallel verification threads...' },
  { delay: 400, level: 'DEBUG', module: 'THREAD_1', message: '[OFAC] Querying sanctions list database...' },
  { delay: 300, level: 'DEBUG', module: 'THREAD_2', message: '[VirusTotal] Requesting aggregate scan from 72 engines...' },
  { delay: 500, level: 'DEBUG', module: 'THREAD_3', message: '[Hunter] Verifying domain MX records and email deliverability...' },
  { delay: 900, level: 'INFO', module: 'THREAD_1', message: '[OFAC] Result: CLEAN (No entity matches found)' },
  { delay: 800, level: 'INFO', module: 'THREAD_2', message: '[VirusTotal] Result: 0/72 MALICIOUS (Safe)' },
  { delay: 600, level: 'WARN', module: 'THREAD_3', message: '[Hunter] Note: Catch-all email configuration detected' },
  { delay: 1500, level: 'INFO', module: 'GEMINI', message: 'Synthesizing thread results into Risk Matrix...' },
  { delay: 1000, level: 'INFO', module: 'GEMINI', message: 'Final Risk Score Calculated: LOW_RISK (12/100)' },
  { delay: 800, level: 'INFO', module: 'AGENT', message: 'Verification passed. Proceeding to Invoice Generation.' },
  { delay: 2000, level: 'INFO', module: 'GEMINI', message: 'Invoice #INV-2026-089 generated via LLM extraction.' },
  { delay: 1500, level: 'INFO', module: 'LOCUS', message: 'Preparing USDC transaction on Base...' },
  { delay: 1000, level: 'INFO', module: 'LOCUS', message: 'Awaiting signature...' },
  { delay: 3000, level: 'INFO', module: 'LOCUS', message: 'Transaction submitted. Hash: 0x8f2a...39b1' },
  { delay: 2000, level: 'SUCCESS', module: 'SYSTEM', message: 'Flow complete. Agent returning to standby.' }
];

export default function Audit() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [isActive, setIsActive] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const startSimulation = () => {
    setIsActive(true);
    setLogs([{ time: new Date().toISOString(), level: 'INFO', module: 'SYSTEM', message: 'Manual simulation triggered...' }]);
    
    let totalDelay = 0;
    SIMULATED_ACTIVITY.forEach((log) => {
      totalDelay += log.delay;
      setTimeout(() => {
        setLogs(prev => [...prev, {
          time: new Date().toISOString(),
          level: log.level,
          module: log.module,
          message: log.message
        }]);
      }, totalDelay);
    });

    setTimeout(() => {
      setIsActive(false);
    }, totalDelay + 1000);
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'INFO': return 'var(--text-muted)';
      case 'WARN': return '#fbbf24'; // amber
      case 'SUCCESS': return 'var(--accent)';
      case 'DEBUG': return '#6b7280'; // gray
      default: return 'var(--text)';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: 'var(--text)', paddingTop: '80px', paddingBottom: '40px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <div className="flex justify-between items-end mb-24">
          <div>
            <span className="mono mb-16" style={{ display: 'block' }}>AGENT TELEMETRY</span>
            <h1 className="heading-lg">
              Live <em>Audit Trail.</em>
            </h1>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={startSimulation}
            disabled={isActive}
            style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.75rem', padding: '10px 16px' }}
          >
            {isActive ? 'AGENT RUNNING...' : 'TRIGGER SIMULATION'}
          </button>
        </div>

        <p className="body-lg mb-32" style={{ color: 'var(--text-muted)' }}>
          Real-time logs of the autonomous agent's decision-making process, background database queries, and blockchain interactions.
        </p>

        {/* Terminal Window */}
        <div style={{
          background: '#060608',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          {/* Mac window controls header */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            padding: '12px 16px', 
            background: 'rgba(255,255,255,0.02)', 
            borderBottom: '1px solid var(--border)',
            alignItems: 'center'
          }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ed6a5e' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f4bf4f' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#61c554' }} />
            <span style={{ marginLeft: '12px', fontFamily: "'SF Mono', monospace", fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              cleargate@locus-agent:~
            </span>
          </div>

          {/* Log content */}
          <div style={{
            padding: '24px',
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: '0.8125rem',
            lineHeight: '1.6',
            height: '500px',
            overflowY: 'auto',
          }}>
            {logs.map((log, index) => {
              const timeString = new Date(log.time).toISOString().substring(11, 23); // HH:MM:SS.mmm
              return (
                <div key={index} style={{ marginBottom: '8px', display: 'flex', gap: '16px' }}>
                  <span style={{ color: '#4b5563', whiteSpace: 'nowrap' }}>[{timeString}]</span>
                  <span style={{ color: getLevelColor(log.level), width: '60px', flexShrink: 0 }}>{log.level}</span>
                  <span style={{ color: '#9ca3af', width: '80px', flexShrink: 0 }}>[{log.module}]</span>
                  <span style={{ color: log.level === 'SUCCESS' ? 'var(--accent)' : '#e5e7eb' }}>{log.message}</span>
                </div>
              );
            })}
            {isActive && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', animation: 'pulse 1.5s infinite' }}>
                <span style={{ color: '#4b5563' }}>[--:--:--.---]</span>
                <span style={{ color: 'var(--text-muted)' }}>...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to Home</Link>
        </div>

      </div>
    </div>
  );
}
