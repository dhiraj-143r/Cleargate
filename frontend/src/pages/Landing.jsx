import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="page">
      <div className="container">

        {/* ── Hero ── */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          minHeight: '70vh',
          paddingTop: '40px',
        }}>
          {/* Left */}
          <div>
            <span className="mono" style={{ marginBottom: '24px', display: 'block' }}>
              AI-POWERED VERIFICATION · ON-CHAIN PAYMENTS
            </span>

            <h1 className="heading-xl">
              <em>Verify before</em>
              <br />
              you pay.
            </h1>

            <p className="body-lg" style={{ maxWidth: '440px', marginTop: '28px' }}>
              Enter an email, domain, or company name. ClearGate scans 7 security databases
              in parallel, generates a trust report, and settles payment in USDC on Base —
              traceable, verifiable, instant.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
              <Link to="/verify" className="btn btn-primary btn-lg" id="hero-cta">
                Start with $1.00
              </Link>
              <a href="#how" className="btn btn-secondary btn-lg">
                See how it works ↓
              </a>
            </div>
          </div>

          {/* Right — Live Demo Card */}
          <div className="card" style={{
            padding: 0,
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            {/* Header bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9375rem' }}>🔒</span>
                <span className="heading-sm" style={{ fontSize: '0.75rem' }}>VERIFICATION AGENT</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="dot dot-accent" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LIVE</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
              {/* Scan result */}
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--green)' }}>✓</span>
                  <span className="body">Verified vendor@globaltech.com — Risk Score: 8/100</span>
                </div>
                <span style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                }}>
                  BASE TX&nbsp;&nbsp;
                  <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>0X4F82...AE1C ↗</span>
                </span>
              </div>

              {/* Dots */}
              <div style={{ display: 'flex', gap: '4px', margin: '16px 0' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
              </div>

              {/* Search */}
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                marginBottom: '12px',
              }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  SCANNING · 7 DATABASES
                </div>
                <div className="body" style={{ marginTop: '4px' }}>
                  OFAC · VirusTotal · Hunter · Email Rep · IP Intel · Firecrawl · Gemini
                </div>
              </div>

              {/* Results */}
              {[
                { name: 'OFAC Sanctions', domain: 'GLOBALTECH.COM', tag: 'CLEAR · ENTITY' },
                { name: 'VirusTotal Scan', domain: 'GLOBALTECH.COM', tag: '0/72 ENGINES' },
                { name: 'Email Verified', domain: 'HUNTER.IO', tag: 'DELIVERABLE' },
              ].map((r, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div className="body" style={{ fontWeight: '500', color: 'var(--text)' }}>{r.name}</div>
                    <div style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: '0.6875rem',
                      color: 'var(--accent)',
                      letterSpacing: '0.04em',
                    }}>
                      {r.domain}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{r.tag}</span>
                </div>
              ))}

              {/* Input */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '16px',
                padding: '10px 16px',
                background: 'var(--bg)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}>
                <span style={{ flex: 1, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Try the real agent →
                </span>
                <Link to="/verify" style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--accent)',
                  letterSpacing: '0.04em',
                }}>
                  VERIFY
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how" style={{ padding: '100px 0 80px' }}>
          <span className="mono mb-24" style={{ display: 'block' }}>HOW IT WORKS</span>
          <h2 className="heading-lg mb-48">
            Three steps.<br /><em>Complete protection.</em>
          </h2>

          <div className="grid-3">
            <div>
              <span className="mono mb-16" style={{ display: 'block' }}>01</span>
              <h3 className="heading-md mb-8">Verify</h3>
              <p className="body">
                OFAC sanctions screening, VirusTotal domain scan, email verification,
                IP intelligence, website analysis. 7 scans in parallel — results in seconds.
              </p>
            </div>
            <div>
              <span className="mono mb-16" style={{ display: 'block' }}>02</span>
              <h3 className="heading-md mb-8">Invoice</h3>
              <p className="body">
                Describe the work in plain language. AI generates a professional invoice
                with line items, tax calculation, and payment terms — instantly.
              </p>
            </div>
            <div>
              <span className="mono mb-16" style={{ display: 'block' }}>03</span>
              <h3 className="heading-md mb-8">Pay</h3>
              <p className="body">
                One-click USDC payment via Locus Checkout. Zero wire fees. Instant
                settlement. On-chain receipt with BaseScan transaction hash.
              </p>
            </div>
          </div>
        </section>

        {/* ── Integrations ── */}
        <section style={{ padding: '60px 0 80px' }}>
          <span className="mono mb-24" style={{ display: 'block' }}>LOCUS INTEGRATIONS</span>
          <h2 className="heading-lg mb-16">
            12 endpoints.<br /><em>All load-bearing.</em>
          </h2>
          <p className="body-lg mb-48" style={{ maxWidth: '500px' }}>
            Every integration is critical. Remove any one and a feature breaks.
            None decorative.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            background: 'var(--border)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}>
            {[
              { name: 'OFAC Sanctions', type: 'WRAPPED API', cost: '$0.005' },
              { name: 'VirusTotal', type: 'WRAPPED API', cost: '$0.010' },
              { name: 'Hunter Email', type: 'WRAPPED API', cost: '$0.010' },
              { name: 'Email Reputation', type: 'WRAPPED API', cost: '$0.005' },
              { name: 'IP Intelligence', type: 'WRAPPED API', cost: '$0.005' },
              { name: 'Firecrawl', type: 'WRAPPED API', cost: '$0.003' },
              { name: 'Gemini AI', type: 'WRAPPED API', cost: '$0.005' },
              { name: 'Checkout', type: 'CORE', cost: '—' },
              { name: 'AgentMail', type: 'X402', cost: '$0.010' },
              { name: 'Email Escrow', type: 'CORE', cost: '—' },
              { name: 'Pay / Balance', type: 'CORE', cost: '—' },
              { name: 'Transactions', type: 'CORE', cost: '—' },
            ].map((api, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--bg)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="dot dot-accent" />
                  <span className="body" style={{ color: 'var(--text)', fontWeight: '400' }}>{api.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge-accent" style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '0.625rem',
                    fontWeight: '700',
                    letterSpacing: '0.06em',
                    background: api.type === 'CORE' ? 'transparent' : 'var(--accent)',
                    color: api.type === 'CORE' ? 'var(--text-muted)' : '#060608',
                    border: api.type === 'CORE' ? '1px solid var(--border)' : 'none',
                  }}>
                    {api.type}
                  </span>
                  <span style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    minWidth: '50px',
                    textAlign: 'right',
                  }}>
                    {api.cost}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Numbers ── */}
        <section style={{ padding: '60px 0 80px' }}>
          <div className="grid-3">
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--serif)',
                fontSize: '3.5rem',
                fontWeight: '400',
                color: 'var(--accent)',
                lineHeight: 1,
              }}>
                $0.04
              </div>
              <p className="body mt-8">per verification</p>
              <p className="body-sm">vs $500/mo in subscriptions</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--serif)',
                fontSize: '3.5rem',
                fontWeight: '400',
                color: 'var(--text)',
                lineHeight: 1,
              }}>
                7
              </div>
              <p className="body mt-8">parallel security scans</p>
              <p className="body-sm">OFAC, VirusTotal, Hunter + more</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--serif)',
                fontSize: '3.5rem',
                fontWeight: '400',
                color: 'var(--text)',
                lineHeight: 1,
              }}>
                0%
              </div>
              <p className="body mt-8">wire fees</p>
              <p className="body-sm">USDC on Base, instant settlement</p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{
          textAlign: 'center',
          padding: '80px 0 40px',
        }}>
          <h2 className="heading-lg mb-16">
            <em>Ready to verify?</em>
          </h2>
          <p className="body-lg mb-32" style={{ maxWidth: '400px', margin: '0 auto 32px' }}>
            The $500/month compliance stack, replaced by a single transaction.
          </p>
          <Link to="/verify" className="btn btn-primary btn-lg" id="cta-verify">
            Start verifying →
          </Link>
        </section>

        <Footer />
      </div>
    </div>
  )
}
