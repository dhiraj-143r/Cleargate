import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_MAP = {
  CLEAR: { badge: 'badge-safe', dot: 'dot-safe' },
  VERIFIED: { badge: 'badge-safe', dot: 'dot-safe' },
  CLEAN: { badge: 'badge-safe', dot: 'dot-safe' },
  SAFE: { badge: 'badge-safe', dot: 'dot-safe' },
  LEGITIMATE: { badge: 'badge-safe', dot: 'dot-safe' },
  CAUTION: { badge: 'badge-caution', dot: 'dot-caution' },
  SUSPICIOUS: { badge: 'badge-danger', dot: 'dot-danger' },
  UNVERIFIED: { badge: 'badge-danger', dot: 'dot-danger' },
}

function RiskMeter({ score, level }) {
  const r = 54, c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score <= 20 ? 'var(--green)' : score <= 50 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div className="risk-meter">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle className="risk-meter-track" cx="60" cy="60" r={r} />
        <circle className="risk-meter-fill" cx="60" cy="60" r={r}
          stroke={color} strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <div className="risk-meter-text">
        <div className="risk-meter-score" style={{ color }}>{score}</div>
        <div className="risk-meter-label">{level}</div>
      </div>
    </div>
  )
}

function ScanCard({ scan, index }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_MAP[scan.status] || STATUS_MAP.CAUTION

  return (
    <div className="card scan-enter" style={{ animationDelay: `${index * 80}ms`, cursor: 'pointer', padding: '18px 20px' }}
      onClick={() => setOpen(!open)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`dot ${cfg.dot}`} />
          <span style={{ fontSize: '0.9375rem', fontWeight: '500' }}>{scan.provider}</span>
        </div>
        <span className={`badge ${cfg.badge}`}>{scan.status}</span>
      </div>
      <p className="body-sm" style={{ marginTop: '6px', marginLeft: '18px' }}>{scan.description}</p>

      {open && scan.details && (
        <div className="fade-in" style={{
          marginTop: '12px', padding: '12px 14px',
          background: 'var(--bg)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          {Object.entries(scan.details).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ color: 'var(--text)' }}>{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Verify({ apiUrl }) {
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!target.trim()) return
    setLoading(true); setError(null); setReport(null)

    try {
      const res = await fetch(`${apiUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim() })
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Verification failed: ${errText.slice(0, 50)}... Please ensure the backend server is running.`)
      }
      
      const data = await res.json()
      setReport(data)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const riskBadge = (level) =>
    level === 'LOW' ? 'badge-safe' : level === 'MEDIUM' ? 'badge-caution' : 'badge-danger'

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '860px' }}>
        <span className="mono mb-16" style={{ display: 'block' }}>VERIFICATION ENGINE</span>
        <h1 className="heading-lg" style={{ marginBottom: '8px' }}>
          Verify a <em>counterparty.</em>
        </h1>
        <p className="body-lg mb-32" style={{ maxWidth: '500px' }}>
          Enter an email, domain, or company name. 7 parallel security scans in seconds.
        </p>

        {/* Search */}
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px' }}>
          <input id="verify-input" className="input input-large" type="text"
            placeholder="vendor@company.com or company.xyz"
            value={target} onChange={(e) => setTarget(e.target.value)} disabled={loading}
            style={{ flex: 1 }} />
          <button id="verify-submit" className="btn btn-primary" type="submit"
            disabled={loading || !target.trim()} style={{ padding: '16px 28px' }}>
            {loading ? <><span className="spinner" /> Scanning</> : 'Verify →'}
          </button>
        </form>

        {error && (
          <div className="card fade-in mt-24" style={{ borderColor: 'var(--red)' }}>
            <span style={{ color: 'var(--red)' }}>{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-16 mt-48 fade-in">
            <div className="spinner spinner-lg" />
            <span className="body">Running 7 parallel scans...</span>
            <div className="grid-2" style={{ width: '100%', marginTop: '12px' }}>
              {['Global Sanctions (OFAC)', 'Domain Reputation Check', 'Email Deliverability', 'IP & Geolocation Intel', 'Website Content Scraper', 'Gemini AI Assessment'].map((scanName, i) => (
                <div key={i} className="skeleton" style={{ 
                  height: '72px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0 24px', 
                  animationDelay: `${i * 0.15}s`,
                  border: '1px solid var(--accent-border)'
                }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                      <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                      <span style={{color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--mono)'}}>
                        {scanName}
                      </span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {report && !loading && (
          <div className="fade-in mt-32">
            {/* Assessment */}
            <div className="card mb-24" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <RiskMeter score={report.assessment.riskScore} level={report.assessment.riskLevel} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span className="heading-md">Risk Assessment</span>
                  <span className={`badge ${riskBadge(report.assessment.riskLevel)}`}>{report.assessment.riskLevel}</span>
                  {report.mode === 'DEMO' && <span className="badge badge-info">DEMO</span>}
                </div>
                <p className="body" style={{ lineHeight: '1.6' }}>{report.assessment.summary}</p>
                <p className="mono mt-8">{report.assessment.recommendation}</p>
              </div>
            </div>

            {/* Scans */}
            <span className="mono mb-16" style={{ display: 'block' }}>SCAN RESULTS</span>
            <div className="grid-2 mb-24">
              {Object.values(report.scans).map((scan, i) => (
                <ScanCard key={i} scan={scan} index={i} />
              ))}
            </div>

            {/* Cost */}
            <div className="card mb-24">
              <span className="mono mb-16" style={{ display: 'block' }}>COST BREAKDOWN</span>
              <div className="flex justify-between mb-8">
                <span className="body">API Scans ({report.auditTrail?.totalEntries || 0} calls)</span>
                <span className="body" style={{ color: 'var(--text)' }}>${report.costBreakdown?.scans?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between mb-8">
                <span className="body">Service Fee</span>
                <span className="body" style={{ color: 'var(--text)' }}>${report.costBreakdown?.serviceFee?.toFixed(4)}</span>
              </div>
              <hr className="divider" />
              <div className="flex justify-between">
                <span className="heading-md">Total</span>
                <span className="heading-md" style={{ color: 'var(--accent)' }}>${report.costBreakdown?.total?.toFixed(4)} USDC</span>
              </div>
            </div>

            {/* Audit Trail */}
            {report.auditTrail?.entries?.length > 0 && <AuditSection entries={report.auditTrail.entries} />}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button id="pay-report-btn" className="btn btn-primary" onClick={async () => {
                try {
                  await new Promise(r => setTimeout(r, 800))
                  navigate(`/checkout/demo_session_123`)
                } catch (err) { console.error(err) }
              }}>
                Pay ${(report.costBreakdown?.total || 1.00).toFixed(2)} USDC →
              </button>
              <button className="btn btn-secondary" onClick={() => navigate(`/report/${report.id}`)}>View Report</button>
              <button className="btn btn-secondary" onClick={() => navigate('/invoice')}>Create Invoice</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AuditSection({ entries }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card mb-24">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <span className="mono">AUDIT TRAIL · {entries.length} ENTRIES</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="fade-in" style={{ marginTop: '16px' }}>
          {entries.map((e) => (
            <div key={e.id} style={{
              display: 'flex', gap: '12px', padding: '10px 0',
              borderBottom: '1px solid var(--border)', fontSize: '0.8125rem',
            }}>
              <span style={{ color: 'var(--text-muted)', minWidth: '24px' }}>#{e.id}</span>
              <div style={{ flex: 1 }}>
                <div className="flex justify-between">
                  <span style={{ fontWeight: '500', color: 'var(--text)' }}>{e.action}</span>
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.75rem', color: 'var(--accent)' }}>
                    ${e.costUsdc?.toFixed(4)}
                  </span>
                </div>
                <p className="body-sm mt-4">{e.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
