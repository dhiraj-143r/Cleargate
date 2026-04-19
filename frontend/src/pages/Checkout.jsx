import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'

export default function Checkout({ apiUrl }) {
  const { sessionId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)

  // Load session data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${apiUrl}/checkout/status/${sessionId}`)
        if (!res.ok) throw new Error('Session not found')
        setSession(await res.json())
      } catch (err) { setError(err.message) }
      finally { setLoading(false) }
    }
    if (sessionId) load()
  }, [apiUrl, sessionId])

  // Poll for payment completion
  useEffect(() => {
    if (!session || session.status === 'PAID') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/checkout/status/${sessionId}`)
        const data = await res.json()
        if (data.status === 'PAID') {
          setSession(data)
          clearInterval(interval)
        }
      } catch (_) { }
    }, 3000)

    return () => clearInterval(interval)
  }, [apiUrl, sessionId, session?.status])

  // Simulate payment (demo mode)
  const simulatePayment = async () => {
    setPaying(true)
    try {
      const res = await fetch(`${apiUrl}/checkout/simulate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      const data = await res.json()
      
      // Artificial delay to simulate blockchain confirmation for the demo
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setSession(data)
    } catch (err) { setError(err.message) }
    finally { setPaying(false) }
  }

  if (loading) return (
    <div className="page">
      <div className="container flex flex-col items-center gap-16" style={{ paddingTop: '80px' }}>
        <div className="spinner spinner-lg" />
        <span className="body">Loading checkout...</span>
      </div>
    </div>
  )

  if (error) return (
    <div className="page">
      <div className="container text-center" style={{ paddingTop: '80px' }}>
        <h2 className="heading-lg">Session not found</h2>
        <p className="body mt-16">{error}</p>
        <Link to="/verify" className="btn btn-primary mt-32">Start new verification</Link>
      </div>
    </div>
  )

  const isPaid = session?.status === 'PAID'

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <span className="mono mb-16" style={{ display: 'block' }}>CHECKOUT</span>

        {isPaid ? (
          /* ── Payment Success ── */
          <div className="fade-in">
            <div className="card" style={{ textAlign: 'center', borderColor: 'var(--accent-border)' }}>
              <style>{`
                @keyframes locus-pulse {
                  0% { box-shadow: 0 0 0 0 rgba(110, 86, 207, 0.4); }
                  70% { box-shadow: 0 0 0 20px rgba(110, 86, 207, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(110, 86, 207, 0); }
                }
                @keyframes locus-spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                .locus-success-icon {
                  width: 80px;
                  height: 80px;
                  background: linear-gradient(135deg, rgba(110, 86, 207, 0.2), rgba(110, 86, 207, 0.05));
                  border: 2px solid rgba(110, 86, 207, 0.5);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 20px;
                  position: relative;
                  animation: locus-pulse 2s infinite;
                }
                .locus-success-icon::before {
                  content: '';
                  position: absolute;
                  inset: -6px;
                  border: 2px dashed rgba(110, 86, 207, 0.3);
                  border-radius: 50%;
                  animation: locus-spin 10s linear infinite;
                }
                @keyframes drawCheck {
                  0% { stroke-dashoffset: 50; opacity: 0; transform: translateY(15px) scale(0.9); }
                  30% { opacity: 1; }
                  100% { stroke-dashoffset: 0; opacity: 1; transform: translateY(0) scale(1); }
                }
                .locus-check-svg {
                  stroke-dasharray: 50;
                  stroke-dashoffset: 50;
                  animation: drawCheck 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                  animation-delay: 0.1s;
                  width: 32px;
                  height: 32px;
                  color: var(--accent);
                  filter: drop-shadow(0 0 8px rgba(110, 86, 207, 0.6));
                }
              `}</style>

              <div className="locus-success-icon">
                <svg className="locus-check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <div className="mono mb-8" style={{ color: 'var(--accent)', letterSpacing: '0.05em' }}>SETTLED VIA LOCUS</div>
              <h2 className="heading-lg mb-8">Payment confirmed</h2>
              <p className="body mb-24">
                ${session.amount} USDC settled on Base — instant and verifiable.
              </p>

              {/* Transaction details */}
              <div style={{
                padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)', textAlign: 'left',
              }}>
                <div className="flex justify-between mb-8">
                  <span className="body-sm">Amount</span>
                  <span className="body" style={{ color: 'var(--text)', fontWeight: '500' }}>
                    ${session.amount} USDC
                  </span>
                </div>
                <div className="flex justify-between mb-8">
                  <span className="body-sm">Status</span>
                  <span className="badge badge-safe">PAID</span>
                </div>
                {session.txHash && (
                  <div className="flex justify-between mb-8">
                    <span className="body-sm">Transaction</span>
                    <a href={session.basescanUrl} target="_blank" rel="noopener"
                      style={{ fontFamily: "'SF Mono', monospace", fontSize: '0.75rem', color: 'var(--accent)' }}>
                      {session.txHash.slice(0, 10)}...{session.txHash.slice(-6)} ↗
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="body-sm">Paid at</span>
                  <span className="body-sm" style={{ color: 'var(--text)' }}>
                    {new Date(session.paidAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                {session.reportId && (
                  <Link to={`/report/${session.reportId}`} className="btn btn-primary">
                    View Report
                  </Link>
                )}
                <Link to="/dashboard" className="btn btn-secondary">Dashboard</Link>
              </div>
            </div>
          </div>
        ) : (
          /* ── Payment Pending ── */
          <div>
            <h1 className="heading-lg mb-8">
              Complete <em>payment.</em>
            </h1>
            <p className="body-lg mb-32">
              Settle with USDC on Base — zero wire fees, instant confirmation.
            </p>

            {/* Order Summary */}
            <div className="card mb-24">
              <span className="mono mb-16" style={{ display: 'block' }}>ORDER SUMMARY</span>

              <div className="flex justify-between mb-8">
                <span className="body">{session.title}</span>
                <span className="body" style={{ color: 'var(--text)', fontWeight: '500' }}>
                  ${session.amount}
                </span>
              </div>

              <hr className="divider" />

              <div className="flex justify-between">
                <span className="heading-md">Total</span>
                <span className="heading-md" style={{ color: 'var(--accent)' }}>
                  ${session.amount} USDC
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card mb-24">
              <span className="mono mb-16" style={{ display: 'block' }}>PAYMENT METHOD</span>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', background: 'var(--bg)', borderRadius: 'var(--radius)',
                border: '1px solid var(--accent-border)',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--accent-dim)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                }}>
                  💎
                </div>
                <div>
                  <div className="body" style={{ color: 'var(--text)', fontWeight: '500' }}>USDC on Base</div>
                  <div className="body-sm">Via Locus Checkout · Instant settlement</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="dot dot-accent" />
                </div>
              </div>
            </div>

            {/* Pay Button */}
            {session.mode === 'DEMO' ? (
              <div>
                <button id="pay-btn" className="btn btn-primary btn-lg"
                  onClick={simulatePayment} disabled={paying}
                  style={{ width: '100%' }}>
                  {paying ? <><span className="spinner" /> Processing...</> : `Pay $${session.amount} USDC →`}
                </button>
              </div>
            ) : session.checkoutUrl ? (
              <a href={session.checkoutUrl} className="btn btn-primary btn-lg"
                style={{ width: '100%', textDecoration: 'none' }}>
                Pay with Locus Checkout →
              </a>
            ) : (
              <button className="btn btn-primary btn-lg" disabled style={{ width: '100%' }}>
                Waiting for checkout URL...
              </button>
            )}

            <p className="body-sm text-center mt-16" style={{ color: 'var(--text-muted)' }}>
              Secured by Locus · USDC on Base · Verifiable on BaseScan
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
