import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function Report({ apiUrl }) {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState('')
  const [delivered, setDelivered] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0);
    async function load() {
      try {
        const res = await fetch(`${apiUrl}/reports/${id}`)
        if (!res.ok) throw new Error('Failed to load report')
        const data = await res.json()
        setReport(data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [apiUrl, id])

  const sendReport = async () => {
    if (!email) return
    setSending(true)
    try {
      const res = await fetch(`${apiUrl}/deliver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: id, email })
      })
      if (!res.ok) throw new Error('Failed to send report')
      setDelivered({ success: true, message: 'Report sent successfully' })
    } catch (err) { console.error(err) }
    finally { setSending(false) }
  }

  if (loading) return (
    <div className="page">
      <div className="container flex flex-col items-center gap-16" style={{ paddingTop: '80px' }}>
        <div className="spinner spinner-lg" />
        <span className="body">Loading report...</span>
      </div>
    </div>
  )

  if (!report) return (
    <div className="page">
      <div className="container text-center" style={{ paddingTop: '80px' }}>
        <h2 className="heading-lg">Report not found.</h2>
        <p className="body mt-16">This report may have expired or hasn't been created yet.</p>
        <Link to="/verify" className="btn btn-primary mt-32">New verification</Link>
      </div>
    </div>
  )

  const rColor = report.assessment.riskScore <= 20 ? 'var(--green)' :
    report.assessment.riskScore <= 50 ? 'var(--yellow)' : 'var(--red)'
  const rBadge = report.assessment.riskLevel === 'LOW' ? 'badge-safe' :
    report.assessment.riskLevel === 'MEDIUM' ? 'badge-caution' : 'badge-danger'
  const safe = (s) => ['CLEAR', 'VERIFIED', 'CLEAN', 'SAFE', 'LEGITIMATE'].includes(s)

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '860px' }}>
        <span className="mono mb-16" style={{ display: 'block' }}>TRUST REPORT</span>

        {/* Header */}
        <div className="flex justify-between items-center mb-32">
          <div>
            <h1 className="heading-lg">{report.target}</h1>
            <p className="body-sm mt-4">{new Date(report.createdAt).toLocaleString()}</p>
          </div>
          <div style={{
            textAlign: 'center', padding: '16px 24px',
            border: `2px solid ${rColor}`, borderRadius: 'var(--radius)',
          }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', color: rColor, lineHeight: 1 }}>
              {report.assessment.riskScore}
            </div>
            <div className="mono mt-4" style={{ color: 'var(--text-muted)' }}>RISK</div>
          </div>
        </div>

        {/* Payment Status */}
        {report.paymentStatus === 'PAID' && (
          <div className="card mb-24 fade-in" style={{ borderColor: 'var(--green)', padding: '14px 20px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-10">
                <span className="dot dot-safe" />
                <span className="body" style={{ fontWeight: '500', color: 'var(--text)' }}>Payment Confirmed</span>
              </div>
              {report.txHash && (
                <a href={report.basescanUrl} target="_blank" rel="noopener"
                  style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.75rem', color: 'var(--accent)' }}>
                  {report.txHash.slice(0, 10)}...{report.txHash.slice(-6)} ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* AI Assessment */}
        <div className="card mb-24" style={{ borderColor: rColor }}>
          <div className="flex items-center gap-10 mb-8">
            <span className="heading-md">AI Assessment</span>
            <span className={`badge ${rBadge}`}>{report.assessment.riskLevel} RISK</span>
            {report.mode === 'DEMO' && <span className="badge badge-info">DEMO</span>}
          </div>
          <p className="body" style={{ lineHeight: '1.7' }}>{report.assessment.summary}</p>
          <div style={{
            marginTop: '12px', padding: '12px 16px', background: 'var(--bg)',
            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          }}>
            <p className="mono">{report.assessment.recommendation}</p>
          </div>
        </div>

        {/* Scans */}
        <span className="mono mb-16" style={{ display: 'block' }}>SCAN RESULTS · {Object.keys(report.scans).length} SCANS</span>
        <div className="grid-2 mb-24">
          {Object.entries(report.scans).map(([key, scan]) => (
            <div key={key} className="card" style={{ padding: '16px 20px' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-10">
                  <span className={`dot ${safe(scan.status) ? 'dot-safe' : 'dot-danger'}`} />
                  <span style={{ fontWeight: '500' }}>{scan.provider}</span>
                </div>
                <span className={`badge ${safe(scan.status) ? 'badge-safe' : 'badge-danger'}`}>{scan.status}</span>
              </div>
              <p className="body-sm mt-4" style={{ marginLeft: '18px' }}>{scan.description}</p>
            </div>
          ))}
        </div>

        {/* Audit Trail */}
        {report.auditTrail?.entries?.length > 0 && (
          <AuditTrail entries={report.auditTrail.entries} />
        )}

        {/* Cost */}
        <div className="card mb-24">
          <span className="mono mb-16" style={{ display: 'block' }}>COST BREAKDOWN</span>
          <div className="flex justify-between mb-8">
            <span className="body">API Scans ({report.auditTrail?.totalEntries || 0} calls)</span>
            <span className="body" style={{ color: 'var(--text)' }}>${report.costBreakdown?.scans?.toFixed(4)}</span>
          </div>
          <div className="flex justify-between mb-8">
            <span className="body">Service fee</span>
            <span className="body" style={{ color: 'var(--text)' }}>${report.costBreakdown?.serviceFee?.toFixed(4)}</span>
          </div>
          <hr className="divider" />
          <div className="flex justify-between">
            <span className="heading-md">Total</span>
            <span className="heading-md" style={{ color: 'var(--accent)' }}>${report.costBreakdown?.total?.toFixed(4)} USDC</span>
          </div>
        </div>

        {/* Email Delivery */}
        <div className="card mb-24 no-print">
          <span className="mono mb-16" style={{ display: 'block' }}>SEND REPORT VIA EMAIL</span>
          {delivered ? (
            <div className="fade-in flex items-center gap-10">
              <span className="dot dot-safe" />
              <span className="body" style={{ color: 'var(--text)' }}>
                Sent to <strong>{delivered.email}</strong>
                {delivered.mode === 'DEMO' && ' (demo)'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input className="input" type="email" placeholder="recipient@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={sendReport}
                disabled={sending || !email}>
                {sending ? <><span className="spinner" /> Sending</> : 'Send →'}
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="no-print" style={{ display: 'flex', gap: '12px' }}>
          <Link to="/verify" className="btn btn-primary">New verification</Link>
          <button className="btn btn-secondary" onClick={() => window.print()}>Export PDF</button>
          <Link to="/invoice" className="btn btn-secondary">Create invoice</Link>
          <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
        </div>
      </div>
    </div>
  )
}

function AuditTrail({ entries }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card mb-24">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setOpen(!open)}>
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
              {/* Timeline dot */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '20px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: e.status === 'SUCCESS' ? 'var(--green)' : e.status === 'FAILED' ? 'var(--red)' : 'var(--accent)',
                  marginTop: '4px',
                }} />
                <div style={{ width: '1px', flex: 1, background: 'var(--border)', marginTop: '4px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex justify-between">
                  <span style={{ fontWeight: '500', color: 'var(--text)' }}>{e.action}</span>
                  <span style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.75rem', color: 'var(--accent)' }}>
                    ${e.costUsdc?.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between mt-4">
                  <span className="body-sm">{e.reasoning}</span>
                  <span className="body-sm" style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '10px' }}>
                    {e.durationMs ? `${e.durationMs}ms` : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
