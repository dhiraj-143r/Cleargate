import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard({ apiUrl }) {
  const [balance, setBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [reports, setReports] = useState([])
  const [invoices, setInvoices] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('transactions')

  useEffect(() => {
    async function load() {
      try {
        const [bRes, tRes, rRes, iRes, aRes] = await Promise.all([
          fetch(`${apiUrl}/api/wallet/balance`),
          fetch(`${apiUrl}/api/transactions`),
          fetch(`${apiUrl}/api/reports`).catch(() => ({ ok: false })),
          fetch(`${apiUrl}/api/invoices`).catch(() => ({ ok: false })),
          fetch(`${apiUrl}/api/audit-log`).catch(() => ({ ok: false })),
        ])
        setBalance(await bRes.json())
        const tData = await tRes.json()
        setTransactions(tData.transactions || [])
        if (rRes.ok) { const rData = await rRes.json(); setReports(rData.reports || []) }
        if (iRes.ok) { const iData = await iRes.json(); setInvoices(iData.invoices || []) }
        if (aRes.ok) { const aData = await aRes.json(); setAuditLog(aData.entries || []) }
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [apiUrl])

  const riskBadge = (s) => {
    if (s == null) return null
    if (s <= 20) return <span className="badge badge-safe">LOW</span>
    if (s <= 50) return <span className="badge badge-caution">MED</span>
    return <span className="badge badge-danger">HIGH</span>
  }

  const tabs = [
    { id: 'transactions', label: 'Transactions', count: transactions.length },
    { id: 'reports', label: 'Reports', count: reports.length },
    { id: 'invoices', label: 'Invoices', count: invoices.length },
    { id: 'audit', label: 'Audit Log', count: auditLog.length },
  ]

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>
        <span className="mono mb-16" style={{ display: 'block' }}>DASHBOARD</span>
        <h1 className="heading-lg mb-32">
          Your <em>wallet.</em>
        </h1>

        {loading ? (
          <div className="grid-3">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '100px' }} />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid-4 mb-32">
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--accent)' }}>
                  ${balance?.balance || '0.00'}
                </div>
                <p className="body-sm mt-4">USDC balance</p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--text)' }}>
                  {reports.length || transactions.filter(t => t.type === 'VERIFICATION').length}
                </div>
                <p className="body-sm mt-4">Verifications</p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--text)' }}>
                  {invoices.length}
                </div>
                <p className="body-sm mt-4">Invoices</p>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--text)' }}>
                  ${Math.abs(transactions.filter(t => t.amount?.startsWith?.('-')).reduce((s, t) => s + parseFloat(t.amount), 0)).toFixed(2)}
                </div>
                <p className="body-sm mt-4">Total spent</p>
              </div>
            </div>

            {/* Spending Controls */}
            <div className="card mb-24">
              <span className="mono mb-16" style={{ display: 'block' }}>SPENDING CONTROLS</span>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
                background: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginTop: '12px',
              }}>
                {[
                  { label: 'Per report', value: '$2.00', used: 1.00, max: 2.00 },
                  { label: 'Daily budget', value: '$10.00', used: 3.00, max: 10.00 },
                  { label: 'Session cap', value: '$50.00', used: 3.00, max: 50.00 },
                ].map((c, i) => (
                  <div key={i} style={{ background: 'var(--bg)', padding: '16px' }}>
                    <div className="body-sm" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
                    <div className="heading-md mt-4">{c.value}</div>
                    <div style={{
                      height: '3px', borderRadius: '2px', background: 'var(--border)',
                      marginTop: '10px', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${(c.used / c.max) * 100}%`,
                        background: 'var(--accent)', borderRadius: '2px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <div className="body-sm mt-4">${c.used.toFixed(2)} used</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: '4px', background: 'var(--card)',
              padding: '4px', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              marginBottom: '16px',
            }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: '6px',
                    border: 'none', cursor: 'pointer', fontSize: '0.8125rem',
                    fontFamily: 'var(--sans)', fontWeight: '500',
                    background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                    color: activeTab === tab.id ? '#060608' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                  }}>
                  {tab.label} {tab.count > 0 && <span style={{ opacity: 0.7 }}>({tab.count})</span>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="card">
              {activeTab === 'transactions' && (
                <>
                  <span className="mono mb-16" style={{ display: 'block' }}>RECENT TRANSACTIONS</span>
                  {transactions.length === 0 ? (
                    <p className="body" style={{ color: 'var(--text-muted)' }}>No transactions yet.</p>
                  ) : (
                    transactions.map((tx) => (
                      <div key={tx.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 0', borderBottom: '1px solid var(--border)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.125rem' }}>
                            {tx.type === 'VERIFICATION' ? '🔍' : tx.type === 'REFUND' ? '↩️' : '💰'}
                          </span>
                          <div>
                            <div className="body" style={{ color: 'var(--text)', fontWeight: '500' }}>{tx.target}</div>
                            <div className="body-sm">{new Date(tx.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {riskBadge(tx.riskScore)}
                          <span style={{
                            fontFamily: "'SF Mono', monospace", fontSize: '0.8125rem',
                            color: tx.amount?.startsWith?.('-') ? 'var(--text)' : 'var(--green)',
                          }}>
                            {tx.amount} USDC
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'reports' && (
                <>
                  <span className="mono mb-16" style={{ display: 'block' }}>VERIFICATION REPORTS</span>
                  {reports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <p className="body" style={{ color: 'var(--text-muted)' }}>No reports yet.</p>
                      <Link to="/verify" className="btn btn-primary mt-16">Run first verification</Link>
                    </div>
                  ) : (
                    reports.map((r) => {
                      const rc = r.assessment?.riskScore <= 20 ? 'var(--green)' :
                        r.assessment?.riskScore <= 50 ? 'var(--yellow)' : 'var(--red)'
                      return (
                        <Link to={`/report/${r.id}`} key={r.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 0', borderBottom: '1px solid var(--border)',
                          textDecoration: 'none', color: 'inherit',
                        }}>
                          <div>
                            <div className="body" style={{ color: 'var(--text)', fontWeight: '500' }}>{r.target}</div>
                            <div className="body-sm">{new Date(r.createdAt).toLocaleString()}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                              fontFamily: 'var(--serif)', fontSize: '1.25rem',
                              color: rc, fontWeight: '400',
                            }}>
                              {r.assessment?.riskScore}
                            </span>
                            <span className="body-sm" style={{ color: 'var(--accent)' }}>View →</span>
                          </div>
                        </Link>
                      )
                    })
                  )}
                </>
              )}

              {activeTab === 'invoices' && (
                <>
                  <span className="mono mb-16" style={{ display: 'block' }}>INVOICES</span>
                  {invoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <p className="body" style={{ color: 'var(--text-muted)' }}>No invoices yet.</p>
                      <Link to="/invoice" className="btn btn-primary mt-16">Create first invoice</Link>
                    </div>
                  ) : (
                    invoices.map((inv) => (
                      <div key={inv.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 0', borderBottom: '1px solid var(--border)',
                      }}>
                        <div>
                          <div className="body" style={{ color: 'var(--text)', fontWeight: '500' }}>
                            {inv.invoiceNumber} — {inv.to?.name}
                          </div>
                          <div className="body-sm">{new Date(inv.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className={`badge ${inv.status === 'PAID' ? 'badge-safe' : inv.status === 'SENT' ? 'badge-caution' : 'badge-info'}`}>
                            {inv.status}
                          </span>
                          <span style={{
                            fontFamily: "'SF Mono', monospace", fontSize: '0.8125rem', color: 'var(--text)',
                          }}>
                            ${inv.totalUsdc} USDC
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'audit' && (
                <>
                  <span className="mono mb-16" style={{ display: 'block' }}>SYSTEM AUDIT LOG</span>
                  {auditLog.length === 0 ? (
                    <p className="body" style={{ color: 'var(--text-muted)' }}>No audit entries yet.</p>
                  ) : (
                    auditLog.map((entry, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '12px', padding: '10px 0',
                        borderBottom: '1px solid var(--border)', fontSize: '0.8125rem',
                      }}>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: 'var(--accent)', marginTop: '5px', flexShrink: 0,
                        }} />
                        <div style={{ flex: 1 }}>
                          <div className="flex justify-between">
                            <span style={{ fontWeight: '500', color: 'var(--text)' }}>{entry.action}</span>
                            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.75rem', color: 'var(--accent)' }}>
                              ${entry.costUsdc?.toFixed(4) || '0.0000'}
                            </span>
                          </div>
                          <div className="flex justify-between mt-4">
                            <span className="body-sm">{entry.reasoning}</span>
                            <span className="body-sm" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>

            {/* Wallet Info */}
            {balance && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '16px', padding: '12px 16px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              }}>
                <div className="body-sm" style={{ color: 'var(--text-muted)' }}>
                  Wallet: <span style={{ fontFamily: "'SF Mono', monospace", color: 'var(--text)' }}>
                    {balance.walletAddress}
                  </span>
                </div>
                <div className="flex items-center gap-8">
                  <span className={`dot ${balance.mode === 'DEMO' ? 'dot-accent' : 'dot-safe'}`} />
                  <span className="body-sm" style={{ color: balance.mode === 'DEMO' ? 'var(--accent)' : 'var(--green)' }}>
                    {balance.mode === 'DEMO' ? 'Demo mode' : 'Live'} · {balance.network}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
