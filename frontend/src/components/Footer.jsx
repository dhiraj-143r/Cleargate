import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '48px 0 32px',
      marginTop: '60px',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '40px',
        }}>
          {/* Brand */}
          <div>
            <div style={{
              fontFamily: 'var(--serif)',
              fontSize: '1.25rem',
              fontWeight: '400',
              color: 'var(--text)',
              marginBottom: '12px',
            }}>
              ClearGate
            </div>
            <p className="body-sm" style={{ maxWidth: '260px', lineHeight: '1.7' }}>
              AI-powered verification, invoicing, and USDC payment — collapsed into one flow.
              Built for the Paygentic Hackathon.
            </p>
          </div>

          {/* Product */}
          <div>
            <span className="mono mb-12" style={{ display: 'block', fontSize: '0.625rem' }}>PRODUCT</span>
            <div className="flex flex-col gap-8">
              <Link to="/verify" className="body-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Verify</Link>
              <Link to="/invoice" className="body-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Invoice</Link>
              <Link to="/dashboard" className="body-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
            </div>
          </div>

          {/* Stack */}
          <div>
            <span className="mono mb-12" style={{ display: 'block', fontSize: '0.625rem' }}>BUILT WITH</span>
            <div className="flex flex-col gap-8">
              <span className="body-sm" style={{ color: 'var(--text-muted)' }}>Locus APIs</span>
              <span className="body-sm" style={{ color: 'var(--text-muted)' }}>USDC on Base</span>
              <span className="body-sm" style={{ color: 'var(--text-muted)' }}>Gemini AI</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <span className="mono mb-12" style={{ display: 'block', fontSize: '0.625rem' }}>LINKS</span>
            <div className="flex flex-col gap-8">
              <a href="https://github.com/dhiraj-143r/Cleargate" target="_blank" rel="noopener"
                className="body-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                GitHub ↗
              </a>
              <a href="https://buildwithlocus.com" target="_blank" rel="noopener"
                className="body-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                BuildWithLocus ↗
              </a>
              <a href="https://basescan.org" target="_blank" rel="noopener"
                className="body-sm" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                BaseScan ↗
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid var(--border)',
          marginTop: '40px',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span className="body-sm" style={{ color: 'var(--text-muted)' }}>
            © 2026 ClearGate · Paygentic Hackathon Week 2
          </span>
          <span className="body-sm" style={{ color: 'var(--text-muted)' }}>
            Secured by Locus · USDC on Base
          </span>
        </div>
      </div>
    </footer>
  )
}
