import { useState } from 'react'

export default function Invoice({ apiUrl }) {
  const [form, setForm] = useState({ description: '', amount: '', clientName: '', clientEmail: '', freelancerName: '' })
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/invoice/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setInvoice(await res.json())
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const u = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>
        <span className="mono mb-16" style={{ display: 'block' }}>INVOICE GENERATOR</span>
        <h1 className="heading-lg mb-8">
          Generate an <em>invoice.</em>
        </h1>
        <p className="body-lg mb-32" style={{ maxWidth: '460px' }}>
          Describe the work in plain language. AI generates a professional invoice instantly.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Form */}
          <form onSubmit={handleGenerate} className="flex flex-col gap-16">
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

          {/* Preview */}
          <div>
            {!invoice && !loading && (
              <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="body" style={{ color: 'var(--text-muted)' }}>Invoice preview appears here</span>
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
                <div className="flex justify-between items-center mb-24">
                  <div>
                    <h3 className="heading-md" style={{ color: 'var(--accent)' }}>INVOICE</h3>
                    <span className="body-sm">{invoice.invoiceNumber}</span>
                  </div>
                  <span className="badge badge-info">DRAFT</span>
                </div>

                <div className="grid-2 mb-24">
                  <div>
                    <span className="mono" style={{ fontSize: '0.625rem' }}>FROM</span>
                    <div className="body mt-4" style={{ color: 'var(--text)', fontWeight: '500' }}>{invoice.from.name}</div>
                    <div className="body-sm">via ClearGate</div>
                  </div>
                  <div>
                    <span className="mono" style={{ fontSize: '0.625rem' }}>TO</span>
                    <div className="body mt-4" style={{ color: 'var(--text)', fontWeight: '500' }}>{invoice.to.name}</div>
                    <div className="body-sm">{invoice.to.email}</div>
                  </div>
                </div>

                <hr className="divider" />

                {invoice.lineItems?.map((item, i) => (
                  <div key={i} className="flex justify-between mb-8">
                    <span className="body">{item.description}</span>
                    <span className="body" style={{ color: 'var(--text)', fontWeight: '500' }}>${item.total.toFixed(2)}</span>
                  </div>
                ))}

                <hr className="divider" />

                <div className="flex justify-between">
                  <span className="heading-md">Total</span>
                  <span className="heading-md" style={{ color: 'var(--accent)' }}>{invoice.totalUsdc} USDC</span>
                </div>

                <div className="body-sm mt-8" style={{ color: 'var(--text-muted)' }}>
                  Due {new Date(invoice.dueDate).toLocaleDateString()}
                </div>

                <button className="btn btn-primary mt-24" style={{ width: '100%' }}>
                  Send & pay via Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
