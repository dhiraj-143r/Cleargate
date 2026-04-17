import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function Report({ apiUrl }) {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${apiUrl}/api/reports/${id}`)
        if (res.ok) setReport(await res.json())
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [apiUrl, id])

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
        <p className="body mt-16">This report may have expired.</p>
        <Link to="/verify" className="btn btn-primary mt-32">New verification</Link>
      </div>
    </div>
  )

  const rColor = report.assessment.riskScore <= 20 ? 'var(--green)' :
    report.assessment.riskScore <= 50 ? 'var(--yellow)' : 'var(--red)'
  const rBadge = report.assessment.riskLevel === 'LOW' ? 'badge-safe' :
    report.assessment.riskLevel === 'MEDIUM' ? 'badge-caution' : 'badge-danger'

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '860px' }}>
        <span className="mono mb-16" style={{ display: 'block' }}>TRUST REPORT</span>
        <div className="flex justify-between items-center mb-32">
          <div>
            <h1 className="heading-lg">{report.target}</h1>
            <p className="body-sm mt-4">{new Date(report.createdAt).toLocaleString()}</p>
          </div>
          <div style={{
            textAlign: 'center', padding: '16px 24px',
            border: `1px solid ${rColor}`, borderRadius: 'var(--radius)',
          }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', color: rColor, lineHeight: 1 }}>
              {report.assessment.riskScore}
            </div>
            <div className="mono mt-4" style={{ color: 'var(--text-muted)' }}>RISK</div>
          </div>
        </div>

        {/* Assessment */}
        <div className="card mb-24" style={{ borderColor: rColor }}>
          <div className="flex items-center gap-10 mb-8">
            <span className="heading-md">AI Assessment</span>
            <span className={`badge ${rBadge}`}>{report.assessment.riskLevel} RISK</span>
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
        <span className="mono mb-16" style={{ display: 'block' }}>SCAN RESULTS</span>
        <div className="flex flex-col gap-8 mb-24">
          {Object.entries(report.scans).map(([key, scan]) => {
            const safe = ['CLEAR', 'VERIFIED', 'CLEAN', 'SAFE', 'LEGITIMATE'].includes(scan.status)
            return (
              <div key={key} className="card" style={{ padding: '16px 20px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-10">
                    <span className={`dot ${safe ? 'dot-safe' : 'dot-danger'}`} />
                    <span style={{ fontWeight: '500' }}>{scan.provider}</span>
                  </div>
                  <span className={`badge ${safe ? 'badge-safe' : 'badge-danger'}`}>{scan.status}</span>
                </div>
                <p className="body-sm mt-4" style={{ marginLeft: '18px' }}>{scan.description}</p>
              </div>
            )
          })}
        </div>

        {/* Cost */}
        <div className="card mb-24">
          <span className="mono mb-16" style={{ display: 'block' }}>COST</span>
          <div className="flex justify-between mb-8">
            <span className="body">API scans</span>
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

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/verify" className="btn btn-primary">New verification</Link>
          <Link to="/invoice" className="btn btn-secondary">Create invoice</Link>
          <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
