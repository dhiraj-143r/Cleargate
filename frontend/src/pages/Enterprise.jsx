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
            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(57, 255, 20, 0.1)', borderRadius: 'var(--radius)', border: '1px solid var(--green)' }}>
              <p className="body-sm" style={{ color: 'var(--green)', fontWeight: 500, marginBottom: '8px' }}>✅ Infrastructure Provisioned Successfully!</p>
              <p className="body-sm">The new ClearGate instance is building on Locus. It will be live in 2-5 minutes.</p>
              <div style={{ marginTop: '12px', fontFamily: "'SF Mono', monospace", fontSize: '0.8125rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Project ID:</span> {result.project?.id || 'Unknown'}</div>
                <div style={{ marginTop: '4px' }}><span style={{ color: 'var(--text-muted)' }}>Web URL:</span> <a href={result.urls?.web} target="_blank" style={{ color: 'var(--accent)' }}>{result.urls?.web}</a></div>
                <div style={{ marginTop: '4px' }}><span style={{ color: 'var(--text-muted)' }}>API URL:</span> <span style={{ color: 'var(--text)' }}>{result.urls?.api}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
