import { useState, useEffect } from 'react'

export default function Dashboard({ apiUrl }) {
  const [balance, setBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [bRes, tRes] = await Promise.all([
          fetch(`${apiUrl}/api/wallet/balance`),
          fetch(`${apiUrl}/api/transactions`),
        ])
        setBalance(await bRes.json())
        const tData = await tRes.json()
        setTransactions(tData.transactions || [])
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

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '860px' }}>
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
            <div className="grid-3 mb-32">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', color: 'var(--accent)' }}>
                  ${balance?.balance || '0.00'}
                </div>
                <p className="body-sm mt-4">USDC balance</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', color: 'var(--text)' }}>
                  {transactions.filter(t => t.type === 'VERIFICATION').length}
                </div>
                <p className="body-sm mt-4">Verifications</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', color: 'var(--text)' }}>
                  ${Math.abs(transactions.filter(t => t.amount.startsWith('-')).reduce((s, t) => s + parseFloat(t.amount), 0)).toFixed(2)}
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
                      }} />
                    </div>
                    <div className="body-sm mt-4">${c.used.toFixed(2)} used</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div className="card">
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
                      <span style={{ fontSize: '1.125rem' }}>{tx.type === 'VERIFICATION' ? '🔍' : '💰'}</span>
                      <div>
                        <div className="body" style={{ color: 'var(--text)', fontWeight: '500' }}>{tx.target}</div>
                        <div className="body-sm">{new Date(tx.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {riskBadge(tx.riskScore)}
                      <span style={{
                        fontFamily: "'SF Mono', monospace", fontSize: '0.8125rem',
                        color: tx.amount.startsWith('-') ? 'var(--text)' : 'var(--green)',
                      }}>
                        {tx.amount} USDC
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {balance?.mode === 'DEMO' && (
              <div className="flex items-center justify-center gap-8 mt-24" style={{
                padding: '12px', border: '1px solid var(--accent-border)',
                borderRadius: 'var(--radius)', background: 'var(--accent-dim)',
              }}>
                <span className="dot dot-accent" />
                <span className="body-sm" style={{ color: 'var(--accent)' }}>
                  Demo mode — connect Locus credits for live data
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
