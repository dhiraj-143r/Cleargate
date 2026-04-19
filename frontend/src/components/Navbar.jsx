import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  return (
    <nav className="no-print" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 10, 10, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontFamily: 'var(--serif)',
            fontSize: '1.25rem',
            fontStyle: 'italic',
            color: 'var(--text)',
          }}>
            ClearGate
          </span>
        </Link>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {[
            { path: '/verify', label: 'Verify' },
            { path: '/batch', label: 'Batch' },
            { path: '/invoice', label: 'Invoice' },
            { path: '/dashboard', label: 'Dashboard' },
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                fontSize: '0.875rem',
                fontWeight: '400',
                color: isActive(path) ? 'var(--text)' : 'var(--text-muted)',
                transition: 'color 150ms ease',
              }}
              {label}
            </Link>
          ))}
          <Link
            to="/enterprise"
            style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#000000',
              backgroundColor: '#a39af5',
              padding: '6px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'opacity 150ms ease',
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.9'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Enterprise
          </Link>
        </div>

        {/* CTA */}
        <Link to="/verify" className="btn-primary" style={{
          padding: '8px 18px',
          borderRadius: 'var(--radius)',
          fontSize: '0.8125rem',
          fontWeight: '600',
          background: 'var(--accent)',
          color: '#060608',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
        }}>
          Start verifying
        </Link>
      </div>
    </nav>
  )
}
