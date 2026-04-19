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

  // Editable spending controls state
  const [editingControls, setEditingControls] = useState(false)
  const [spendingLimits, setSpendingLimits] = useState({
    maxReportCost: 2.00,
    dailyBudget: 10.00,
    promoLimit: 5.00
  })

  useEffect(() => {
    async function load() {
      try {
        const [balRes, txRes, repRes, invRes, auditRes] = await Promise.all([
          fetch(`${apiUrl}/wallet/balance`),
          fetch(`${apiUrl}/transactions`),
          fetch(`${apiUrl}/reports`),
          fetch(`${apiUrl}/invoices`),
          fetch(`${apiUrl}/audit-log`)
        ])
        
        if (balRes.ok) setBalance(await balRes.json())
        if (txRes.ok) {
          const t = await txRes.json()
          setTransactions(t.transactions || [])
        }
        if (repRes.ok) {
          const r = await repRes.json()
          setReports(r.reports || [])
        }
        if (invRes.ok) {
          const i = await invRes.json()
          setInvoices(i.invoices || [])
        }
        if (auditRes.ok) {
          const a = await auditRes.json()
          setAuditLog(a.entries || [])
        }
      } catch (err) { console.error('Failed to load dashboard data:', err) }
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
    { id: 'enterprise', label: 'Enterprise', count: 0 },
  ]

  const totalSpent = Math.abs(transactions.filter(t => t.amount?.startsWith?.('-')).reduce((s, t) => s + parseFloat(t.amount), 0)) || 0;
  const latestVerTx = transactions.find(t => t.type === 'VERIFICATION' && t.amount?.startsWith?.('-'));
  const lastReportCost = latestVerTx ? Math.abs(parseFloat(latestVerTx.amount)) : 0;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>
        <span className="mono mb-16" style={{ display: 'block' }}>DASHBOARD</span>
        <h1 className="heading-lg mb-32">
          Your <em>dashboard.</em>
        </h1>



        {loading ? (
          <div className="grid-3">
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '100px' }} />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid-4 mb-32">
              <div className="card" style={{ textAlign: 'center', padding: '20px', borderColor: 'var(--accent-border)' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--accent)' }}>
                  ${balance?.promo_credit_balance || balance?.balance || '0.00'}
                </div>
                <div className="body-sm mt-4 flex items-center justify-center gap-8">
                  Available balance
                  {balance?.promo_credit_balance && <span className="badge badge-safe">Promo</span>}
                </div>
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
                  ${totalSpent.toFixed(2)}
                </div>
                <p className="body-sm mt-4">Total spent</p>
              </div>
            </div>



            {/* Spending Controls */}
            <div className="card mb-24 relative">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="mono" style={{ display: 'block' }}>SPENDING CONTROLS</span>
                <span 
                  className="body-sm" 
                  style={{ color: 'var(--accent)', cursor: 'pointer' }}
                  onClick={() => setEditingControls(!editingControls)}
                >
                  {editingControls ? 'Save limits' : 'Edit limits ↗'}
                </span>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
                background: 'var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginTop: '12px',
              }}>
                {[
                  { id: 'maxReportCost', label: 'Last report cost', prefix: 'Max $', used: lastReportCost, max: spendingLimits.maxReportCost },
                  { id: 'dailyBudget', label: 'Daily budget', prefix: '$', used: totalSpent, max: spendingLimits.dailyBudget },
                  { id: 'promoLimit', label: 'Promo limit', prefix: '$', used: totalSpent, max: spendingLimits.promoLimit },
                ].map((c, i) => (
                  <div key={i} style={{ background: 'var(--bg)', padding: '16px' }}>
                    <div className="body-sm" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
                    
                    {editingControls ? (
                      <div className="mt-4" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="heading-md">{c.prefix}</span>
                        <input 
                          type="number" 
                          className="input" 
                          style={{ padding: '4px 8px', fontSize: '1rem', width: '80px', marginTop: '0' }}
                          value={c.max}
                          onChange={(e) => setSpendingLimits({...spendingLimits, [c.id]: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    ) : (
                      <div className="heading-md mt-4">{c.prefix}{c.max.toFixed(2)}</div>
                    )}
                    
                    <div style={{
                      height: '3px', borderRadius: '2px', background: 'var(--border)',
                      marginTop: '10px', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${Math.min((c.used / Math.max(c.max, 0.01)) * 100, 100)}%`,
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
                            ${inv.total || inv.totalUsdc || 0} USDC
                          </span>
                          <span className="body-sm" style={{ color: 'var(--accent)', cursor: 'pointer', marginLeft: '8px' }} 
                                onClick={() => window.location.href = `/invoice?company=${encodeURIComponent(inv.to?.name)}&amount=${inv.total || inv.totalUsdc || 0}`}>
                            View ↗
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

              {activeTab === 'enterprise' && (
                <div style={{ padding: '20px 0' }}>
                  <span className="mono mb-16" style={{ display: 'block' }}>ENTERPRISE DEPLOYMENT</span>
                  <div className="card" style={{ border: '1px solid var(--accent-border)', background: 'rgba(57, 255, 20, 0.03)' }}>
                    <h3 className="heading-md mb-8">Deploy White-Label Portal</h3>
                    <p className="body-sm mb-24" style={{ color: 'var(--text-muted)' }}>
                      Automatically provision a dedicated, isolated instance of the ClearGate platform for a new enterprise client using the BuildWithLocus API.
                    </p>
                    
                    <form id="enterprise-deploy-form" onSubmit={async (e) => {
                      e.preventDefault();
                      const btn = document.getElementById('deploy-btn');
                      const input = document.getElementById('client-name');
                      const resultDiv = document.getElementById('deploy-result');
                      
                      const clientName = input.value.trim();
                      if (!clientName) return;
                      
                      btn.disabled = true;
                      btn.textContent = 'Provisioning infrastructure...';
                      resultDiv.innerHTML = '';
                      
                      try {
                        const res = await fetch(`${apiUrl}/deploy-enterprise`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ clientName })
                        });
                        const data = await res.json();
                        
                        if (data.success) {
                          resultDiv.innerHTML = `
                            <div style="margin-top: 16px; padding: 16px; background: rgba(57, 255, 20, 0.1); border-radius: var(--radius); border: 1px solid var(--green);">
                              <p class="body-sm" style="color: var(--green); font-weight: 500; margin-bottom: 8px;">✅ Infrastructure Provisioned Successfully!</p>
                              <p class="body-sm">The new ClearGate instance is building on Locus. It will be live in 2-5 minutes.</p>
                              <div style="margin-top: 12px; font-family: 'SF Mono', monospace; font-size: 0.8125rem;">
                                <div><span style="color: var(--text-muted)">Project ID:</span> ${data.project?.id || 'Unknown'}</div>
                                <div style="margin-top: 4px;"><span style="color: var(--text-muted)">Web URL:</span> <a href="${data.urls?.web}" target="_blank" style="color: var(--accent)">${data.urls?.web}</a></div>
                                <div style="margin-top: 4px;"><span style="color: var(--text-muted)">API URL:</span> <span style="color: var(--text)">${data.urls?.api}</span></div>
                              </div>
                            </div>
                          `;
                          input.value = '';
                        } else {
                          throw new Error(data.error || 'Failed to deploy');
                        }
                      } catch (err) {
                        resultDiv.innerHTML = `<p class="body-sm mt-16" style="color: var(--red);">${err.message}</p>`;
                      } finally {
                        btn.disabled = false;
                        btn.textContent = 'Deploy Enterprise Portal';
                      }
                    }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input 
                          type="text" 
                          id="client-name"
                          className="input" 
                          placeholder="e.g., Acme Corp Agency"
                          style={{ flex: 1 }}
                        />
                        <button type="submit" id="deploy-btn" className="btn btn-primary">
                          Deploy Enterprise Portal
                        </button>
                      </div>
                    </form>
                    <div id="deploy-result"></div>
                  </div>
                </div>
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
