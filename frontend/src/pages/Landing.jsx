import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

const DUMMY_FEEDS = [
  {
    target: "vendor@globaltech.com",
    score: "8/100",
    tx: "0X4F82...AE1C",
    domain: "GLOBALTECH.COM",
    tag1: "CLEAR · ENTITY",
    tag2: "0/72 ENGINES",
    tag3: "DELIVERABLE",
    color: "var(--green)",
    status: "Verified"
  },
  {
    target: "contact@acmecorp.io",
    score: "12/100",
    tx: "0X9A12...B39F",
    domain: "ACMECORP.IO",
    tag1: "CLEAR · ENTITY",
    tag2: "0/72 ENGINES",
    tag3: "DELIVERABLE",
    color: "var(--green)",
    status: "Verified"
  },
  {
    target: "admin@cryptoscam.net",
    score: "94/100",
    tx: "0X7C44...D90A",
    domain: "CRYPTOSCAM.NET",
    tag1: "FLAGGED · OFAC",
    tag2: "14/72 ENGINES",
    tag3: "UNDELIVERABLE",
    color: "var(--red, #ff4444)",
    status: "Blocked"
  }
];

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 0',
          background: 'none',
          border: 'none',
          color: 'var(--text)',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '1.25rem',
          fontFamily: 'var(--serif)'
        }}
      >
        <span>{question}</span>
        <span style={{ 
          color: 'var(--text-muted)',
          transform: isOpen ? 'rotate(45deg)' : 'none',
          transition: 'transform 0.2s ease',
          fontSize: '1.25rem',
          fontWeight: '300'
        }}>+</span>
      </button>
      <div style={{
        height: isOpen ? 'auto' : 0,
        overflow: 'hidden',
        opacity: isOpen ? 1 : 0,
        transition: 'all 0.3s ease',
        paddingBottom: isOpen ? '24px' : 0,
        color: 'var(--text-muted)',
        fontSize: '0.9375rem',
        lineHeight: 1.6
      }}>
        {answer}
      </div>
    </div>
  );
};

export default function Landing() {
  const [feedIndex, setFeedIndex] = useState(0);
  const [phase, setPhase] = useState('result'); // 'typing', 'loading', 'result'
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let isActive = true;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const runLoop = async () => {
      let currentIndex = 0; // Starts with feedIndex 0
      
      while (isActive) {
        await sleep(4000); // Stay on result
        if (!isActive) break;

        const nextIndex = (currentIndex + 1) % DUMMY_FEEDS.length;
        const targetText = DUMMY_FEEDS[nextIndex].target;

        setPhase('typing');
        setTypedText('');

        // Typing effect
        for (let i = 1; i <= targetText.length; i++) {
          if (!isActive) break;
          setTypedText(targetText.slice(0, i));
          await sleep(40);
        }
        if (!isActive) break;

        await sleep(400); // Pause before loading
        if (!isActive) break;

        setPhase('loading');
        await sleep(2500); // Loading duration
        if (!isActive) break;

        setFeedIndex(nextIndex);
        setPhase('result');
        currentIndex = nextIndex;
      }
    };

    runLoop();

    return () => {
      isActive = false;
    };
  }, []);

  const activeFeed = DUMMY_FEEDS[feedIndex];

  return (
    <div className="page">
      <div className="container">

        {/* ── Hero ── */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '85vh',
          paddingBottom: '5vh',
        }}>
          {/* Content */}
          <div style={{ maxWidth: '700px', width: '100%' }}>
            <span className="mono" style={{ marginBottom: '24px', display: 'block', color: 'var(--accent)' }}>
              AI-POWERED VERIFICATION · ON-CHAIN PAYMENTS
            </span>

            <h1 className="heading-xl">
              <em>Verify before</em>
              <br />
              you pay.
            </h1>

            <p className="body-lg" style={{ 
              margin: '28px auto 0',
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: '1.25rem',
              color: 'var(--accent)',
              letterSpacing: '0.02em',
              lineHeight: '1.6'
            }}>
              Enter an email, domain, or company name. ClearGate scans 7 security databases
              in parallel, generates a trust report, and settles payment in USDC on Base —
              traceable, verifiable, instant.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '40px', justifyContent: 'center' }}>
              <Link to="/verify" className="btn btn-primary btn-lg" id="hero-cta">
                Start with $1.00
              </Link>
              <a href="#how" className="btn btn-secondary btn-lg">
                See how it works ↓
              </a>
            </div>
          </div>
        </section>

        {/* ── Verification Agent Card ── */}
        <section style={{ padding: '80px 0 100px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: '80px',
            alignItems: 'center',
          }}>
            {/* Left Context */}
            <div>
              <span className="mono mb-24" style={{ display: 'block', color: 'var(--accent)' }}>THE AGENT INTERFACE</span>
              <h2 className="heading-lg mb-24">
                Watch it work<br /><em>in real-time.</em>
              </h2>
              <p className="body-lg" style={{ marginBottom: '32px', color: 'var(--text-muted)' }}>
                ClearGate isn't just an API—it's an autonomous agent. When you submit a target, it orchestrates 7 different intelligence platforms simultaneously, scoring risk dynamically before generating an invoice.
              </p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }} />
                   <span className="body">Live OFAC entity cross-referencing</span>
                </li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }} />
                   <span className="body">Real-time domain reputation scoring</span>
                </li>
                <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                   <span className="body">Automated Gemini AI risk assessment</span>
                </li>
              </ul>
            </div>

            {/* Right — Live Demo Card */}
            <div style={{ width: '100%' }}>
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
                transition: 'opacity 0.3s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {phase === 'result' ? (
                    <>
                      <span style={{ color: activeFeed.color }}>
                        {activeFeed.status === 'Verified' ? '✓' : '✕'}
                      </span>
                      <span className="body">{activeFeed.status} {activeFeed.target} — Risk Score: {activeFeed.score}</span>
                    </>
                  ) : (
                    <>
                       <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
                       <span className="mono" style={{ fontSize: '0.875rem' }}>{typedText}{phase === 'typing' && <span className="cursor-blink">|</span>}</span>
                    </>
                  )}
                </div>
                {phase === 'result' ? (
                  <span style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                  }}>
                    BASE TX&nbsp;&nbsp;
                    <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>{activeFeed.tx} ↗</span>
                  </span>
                ) : (
                  <div style={{ height: '14px', marginTop: '6px' }} /> // Spacer to prevent layout shift during typing
                )}
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
                  {phase === 'typing' ? "AWAITING TARGET..." : "SCANNING · 7 DATABASES"}
                </div>
                <div className="body" style={{ marginTop: '4px' }}>
                  {phase === 'result' ? "OFAC · VirusTotal · Hunter · Email Rep · IP Intel · Firecrawl · Gemini" : "Fetching intelligence data..."}
                </div>
              </div>

              {/* Results */}
              <div>
                {[
                  { name: 'OFAC Sanctions', domain: activeFeed.domain, tag: activeFeed.tag1 },
                  { name: 'VirusTotal Scan', domain: activeFeed.domain, tag: activeFeed.tag2 },
                  { name: 'Email Verified', domain: 'HUNTER.IO', tag: activeFeed.tag3 },
                ].map((r, i) => (
                  <div key={`${activeFeed.target}-${phase}-${i}`} className="fade-in" style={{
                    padding: '12px 16px',
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '62px',
                    animationDelay: `${i * 0.15}s`,
                    animationFillMode: 'both'
                  }}>
                    {phase !== 'result' ? (
                      <div style={{ width: '100%' }}>
                        <div className="skeleton" style={{ width: '40%', height: '16px', borderRadius: '4px', marginBottom: '6px' }} />
                        <div className="skeleton" style={{ width: '60%', height: '12px', borderRadius: '4px' }} />
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                ))}
              </div>

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
          </div>
          </div>
        </section>
        {/* ── How It Works ── */}
        <section id="how" style={{ padding: '100px 0 80px' }}>
          <span className="mono mb-24" style={{ display: 'block' }}>HOW IT WORKS</span>
          <h2 className="heading-lg mb-48">
            Three steps.<br /><em>Complete protection.</em>
          </h2>

          <div className="grid-3" style={{ gap: '24px' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src="/images/verify_illustration_1776500442407.png" alt="Security Verification" style={{ width: '100%', height: '220px', objectFit: 'cover', borderBottom: '1px solid var(--border)' }} />
              <div style={{ padding: '24px' }}>
                <span className="mono mb-16" style={{ display: 'block', color: 'var(--accent)' }}>01</span>
                <h3 className="heading-md mb-8">Verify</h3>
                <p className="body">
                  OFAC sanctions screening, VirusTotal domain scan, email verification,
                  IP intelligence, website analysis. 7 scans in parallel — results in seconds.
                </p>
              </div>
            </div>
            <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src="/images/invoice_illustration_1776500457818.png" alt="AI Invoicing" style={{ width: '100%', height: '220px', objectFit: 'cover', borderBottom: '1px solid var(--border)' }} />
              <div style={{ padding: '24px' }}>
                <span className="mono mb-16" style={{ display: 'block', color: 'var(--accent)' }}>02</span>
                <h3 className="heading-md mb-8">Invoice</h3>
                <p className="body">
                  Describe the work in plain language. AI generates a professional invoice
                  with line items, tax calculation, and payment terms — instantly.
                </p>
              </div>
            </div>
            <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <img src="/images/pay_illustration_1776500474427.png" alt="Crypto Payments" style={{ width: '100%', height: '220px', objectFit: 'cover', borderBottom: '1px solid var(--border)' }} />
              <div style={{ padding: '24px' }}>
                <span className="mono mb-16" style={{ display: 'block', color: 'var(--accent)' }}>03</span>
                <h3 className="heading-md mb-8">Pay</h3>
                <p className="body">
                  One-click USDC payment via Locus Checkout. Zero wire fees. Instant
                  settlement. On-chain receipt with BaseScan transaction hash.
                </p>
              </div>
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
                    background: 'transparent',
                    color: api.type === 'CORE' ? 'var(--text-muted)' : 'var(--accent)',
                    border: api.type === 'CORE' ? '1px solid var(--border)' : '1px solid var(--accent)',
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

        {/* ── FAQ ── */}
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '80px',
            alignItems: 'flex-start',
          }}>
            {/* Left Col */}
            <div>
              <span className="mono mb-24" style={{ display: 'block', color: 'var(--text-muted)' }}>FREQUENTLY ASKED</span>
              <h2 className="heading-lg mb-24">
                Questions,<br /><em>answered plainly.</em>
              </h2>
              <p className="body-lg" style={{ color: 'var(--text-muted)' }}>
                Still have something we didn't cover? The agent can probably handle it — every verification prompt is open-ended.
              </p>
            </div>

            {/* Right Col */}
            <div>
              {[
                {
                  question: "What exactly is ClearGate?",
                  answer: "ClearGate is an autonomous verification and payment agent. It takes a vendor's email or domain, runs 7 background security checks, generates a professional invoice, and settles the payment in USDC—all in one seamless flow."
                },
                {
                  question: "Do I need a crypto wallet to use this?",
                  answer: "Yes, you will need a Web3 wallet. ClearGate uses Locus Checkout to securely route your USDC payment on the Base network directly to the verified vendor."
                },
                {
                  question: "How long does the verification take?",
                  answer: "Under 5 seconds. Our agent queries 7 distinct intelligence databases (including OFAC, VirusTotal, and Hunter.io) in parallel, drastically reducing the time it takes to clear a vendor."
                },
                {
                  question: "Why use ClearGate instead of traditional wire transfers?",
                  answer: "Traditional wires can take days, charge exorbitant fees, and offer zero built-in vendor security. ClearGate verifies the recipient instantly, costs exactly $0.04 to route, and settles immediately."
                },
                {
                  question: "Can I use ClearGate to pay international vendors?",
                  answer: "Absolutely. Because we settle transactions in USDC on the Base blockchain, cross-border payments are instant and immune to traditional foreign exchange delays."
                },
                {
                  question: "What happens if a vendor is flagged as high-risk?",
                  answer: "If our Gemini AI risk assessment detects a severe threat—such as an OFAC sanctions match or a known malicious domain—the payment is instantly blocked and your funds remain untouched."
                }
              ].map((faq, i) => (
                <FaqItem key={i} question={faq.question} answer={faq.answer} />
              ))}
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
