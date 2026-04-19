import { useState } from 'react'

export default function Enterprise({ apiUrl }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [clientName, setClientName] = useState('');

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/deploy-enterprise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: clientName.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setResult(data);
        setClientName('');
      } else {
        throw new Error(data.error || 'Failed to deploy');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>
        <span className="mono mb-16" style={{ display: 'block' }}>ENTERPRISE</span>
        <h1 className="heading-lg mb-32">
          Deploy <em>White-Label Portal.</em>
        </h1>

        <div className="card" style={{ border: '1px solid var(--accent-border)', background: 'rgba(57, 255, 20, 0.03)' }}>
          <h3 className="heading-md mb-8">Deploy White-Label Portal</h3>
          <p className="body-sm mb-24" style={{ color: 'var(--text-muted)' }}>
            Automatically provision a dedicated, isolated instance of the ClearGate platform for a new enterprise client using the BuildWithLocus API.
          </p>
          
          <form onSubmit={handleDeploy}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="input" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Acme Corp Agency"
                style={{ flex: 1 }}
                disabled={loading}
              />
              <button type="submit" className="btn btn-primary" disabled={loading || !clientName.trim()}>
                {loading ? 'Provisioning infrastructure...' : 'Deploy Enterprise Portal'}
              </button>
            </div>
          </form>

          {error && (
            <p className="body-sm mt-16" style={{ color: 'var(--red)' }}>{error}</p>
          )}

          {result && (
            <div style={{ 
              marginTop: '16px', 
              padding: '20px', 
              background: '#181A1B', 
              borderRadius: '12px', 
              border: '1px solid #2B2D31',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#34A853', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <p style={{ color: '#E8EAED', fontWeight: 500, fontSize: '0.95rem', margin: 0 }}>Provisioning Successful</p>
              </div>
              
              <p style={{ color: '#9AA0A6', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>
                The new ClearGate instance is building on Locus. It will be live in 2-5 minutes.
              </p>

              <div style={{ 
                marginTop: '4px', 
                background: '#0D0E0F', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid #202225',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#9AA0A6', fontSize: '0.8rem', fontWeight: 500 }}>Project ID</span>
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.8rem', color: '#E8EAED' }}>{result.project?.id || 'Unknown'}</span>
                </div>
                <div style={{ height: '1px', background: '#202225', width: '100%' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#9AA0A6', fontSize: '0.8rem', fontWeight: 500 }}>Web URL</span>
                  <a href={result.urls?.web} target="_blank" style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.8rem', color: '#8AB4F8', textDecoration: 'none' }}>{result.urls?.web}</a>
                </div>
                <div style={{ height: '1px', background: '#202225', width: '100%' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#9AA0A6', fontSize: '0.8rem', fontWeight: 500 }}>API URL</span>
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.8rem', color: '#E8EAED' }}>{result.urls?.api}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
