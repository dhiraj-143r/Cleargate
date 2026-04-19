import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Invoice({ apiUrl }) {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ 
    description: 'Bulk verification escrow', 
    amount: searchParams.get('amount') || '', 
    clientName: searchParams.get('company') || '', 
    clientEmail: searchParams.get('email') || '', 
    freelancerName: '' 
  })
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const navigate = useNavigate()

  const handleGenerate = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/invoice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed to generate invoice')
      const data = await res.json()
      setInvoice(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handlePay = async () => {
    if (!invoice) return
    setPaying(true)
    try {
      const res = await fetch(`${apiUrl}/checkout/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Invoice ${invoice.invoiceNumber}`,
          amount: invoice.total,
          metadata: { invoiceId: invoice.id }
        })
      })
      if (!res.ok) throw new Error('Failed to create checkout session')
      const data = await res.json()
      navigate(`/checkout/${data.id}`)
    } catch (err) { console.error(err) }
    finally { setPaying(false) }
  }

  const u = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div className="invoice-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left Column: Headers + Form */}
          <div className="no-print">
            <span className="mono mb-16" style={{ display: 'block' }}>INVOICE GENERATOR</span>
            <h1 className="heading-lg mb-8">
              Generate an <em>invoice.</em>
            </h1>
            <p className="body-lg mb-32" style={{ maxWidth: '460px' }}>
              Describe the work in plain language. AI generates a professional invoice instantly.
            </p>

            <form onSubmit={handleGenerate} className="flex flex-col gap-16 no-print">
              <div className="input-group">
                <label>Work description</label>
                <textarea id="inv-desc" className="input" placeholder="e.g. Web development for e-commerce redesign"
                  rows="3" value={form.description} onChange={u('description')}
                  style={{ resize: 'vertical', fontFamily: 'var(--sans)' }} required />
              </div>
              <div className="input-group">
                <label>Amount (USD)</label>
                <input id="inv-amount" className="input" type="number" step="0.01"
                  placeholder="500.00" value={form.amount} onChange={u('amount')} required />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Client name</label>
                  <input className="input" placeholder="GlobalTech Inc." value={form.clientName} onChange={u('clientName')} />
                </div>
                <div className="input-group">
                  <label>Client email</label>
                  <input className="input" type="email" placeholder="client@company.com" value={form.clientEmail} onChange={u('clientEmail')} />
                </div>
              </div>
              <div className="input-group">
                <label>Your name</label>
                <input className="input" placeholder="Your full name" value={form.freelancerName} onChange={u('freelancerName')} />
              </div>
              <button id="gen-inv-btn" className="btn btn-primary" type="submit"
                disabled={loading || !form.description || !form.amount}>
                {loading ? <><span className="spinner" /> Generating</> : 'Generate invoice →'}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div>
            {!invoice && !loading && (
              <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: '0.3' }}>📄</div>
                  <span className="body" style={{ color: 'var(--text-muted)' }}>Invoice preview appears here</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="card">
                <div className="skeleton" style={{ height: '20px', width: '50%', marginBottom: '16px' }} />
                <div className="skeleton" style={{ height: '16px', width: '35%', marginBottom: '24px' }} />
                <div className="skeleton" style={{ height: '100px', marginBottom: '16px' }} />
                <div className="skeleton" style={{ height: '36px' }} />
              </div>
            )}

            {invoice && (
              <div className="card fade-in" style={{ borderColor: 'var(--accent-border)' }}>
                {/* Header */}
                <div className="flex justify-between items-center mb-24">
                  <div>
                    <h3 className="heading-md" style={{ color: 'var(--accent)' }}>INVOICE</h3>
                    <span className="body-sm">{invoice.invoiceNumber}</span>
                  </div>
                  <span className="badge badge-info">{invoice.status}</span>
                </div>

                {/* Parties */}
                <div className="grid-2 mb-24">
                  <div>
                    <span className="mono" style={{ fontSize: '0.625rem' }}>FROM</span>
                    <div className="body mt-4" style={{ color: 'var(--text)', fontWeight: '500' }}>{invoice.from.name}</div>
                    <div className="body-sm">via ClearGate</div>
                  </div>
                  <div>
                    <span className="mono" style={{ fontSize: '0.625rem' }}>TO</span>
                    <div className="body mt-4" style={{ color: 'var(--text)', fontWeight: '500' }}>{invoice.to.name}</div>
                    {invoice.to.email && <div className="body-sm">{invoice.to.email}</div>}
                  </div>
                </div>

                <hr className="divider" />

                {/* Line Items */}
                {invoice.lineItems?.map((item, i) => (
                  <div key={i} className="flex justify-between mb-8">
                    <div style={{ flex: 1 }}>
                      <span className="body" style={{ color: 'var(--text)' }}>{item.description}</span>
                      {item.quantity > 1 && <span className="body-sm"> × {item.quantity}</span>}
                    </div>
                    <span className="body" style={{ color: 'var(--text)', fontWeight: '500', flexShrink: 0, marginLeft: '16px' }}>
                      ${item.total.toFixed(2)}
                    </span>
                  </div>
                ))}

                <hr className="divider" />

                {/* Totals */}
                <div className="flex justify-between mb-4">
                  <span className="body-sm">Subtotal</span>
                  <span className="body" style={{ color: 'var(--text)' }}>${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between mb-4">
                    <span className="body-sm">Tax ({invoice.taxRate}%)</span>
                    <span className="body" style={{ color: 'var(--text)' }}>${invoice.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mt-8">
                  <span className="heading-md">Total</span>
                  <span className="heading-md" style={{ color: 'var(--accent)' }}>{invoice.totalUsdc} USDC</span>
                </div>

                {/* Terms */}
                <div style={{
                  marginTop: '16px', padding: '10px 14px',
                  background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                }}>
                  <span className="body-sm" style={{ color: 'var(--text-muted)' }}>{invoice.terms}</span>
                </div>

                {/* Due Date */}
                <div className="body-sm mt-8" style={{ color: 'var(--text-muted)' }}>
                  Due {new Date(invoice.dueDate).toLocaleDateString()}
                </div>

                {/* AI attribution */}
                <div className="body-sm mt-4" style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                  Generated by {invoice.generatedBy}
                  {invoice.mode === 'DEMO' && ' · Demo mode'}
                </div>

                {/* Action Buttons */}
                <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="btn btn-primary" onClick={handlePay}
                    disabled={paying} style={{ flex: 1 }}>
                    {paying ? <><span className="spinner" /> Processing</> : 'Send & pay via Checkout'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => window.print()}>
                    Export PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
