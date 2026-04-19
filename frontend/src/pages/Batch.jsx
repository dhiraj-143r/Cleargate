import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Batch() {
  const [inputData, setInputData] = useState('');
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(-1);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = function(e) {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setInputData(text);
    };
    reader.readAsText(file);
  };

  const loadSampleData = () => {
    setInputData(
      "vendor1@globaltech.com, GlobalTech Inc, 1500.00\n" +
      "contractor@acmecorp.xyz, Acme Corp, 250.00\n" +
      "sketchy@unknown-domain.su, Unknown Entity, 5000.00\n" +
      "design@creative-studio.io, Creative Studio, 850.00\n" +
      "payments@sanctioned-org.ir, Restricted Org, 1200.00"
    );
  };

  const handleStart = () => {
    if (!inputData.trim()) return;
    
    // Parse CSV
    const parsedJobs = inputData.split('\n').filter(line => line.trim()).map((line, index) => {
      const [email, company, amount] = line.split(',').map(s => s?.trim() || '');
      return {
        id: index,
        email,
        company,
        amount: parseFloat(amount) || 0,
        status: 'PENDING', // PENDING, SCANNING, INVOICING, BLOCKED, COMPLETED
        logs: []
      };
    });
    
    setJobs(parsedJobs);
    setProcessing(true);
    setComplete(false);
    setCurrentJobIndex(0);
  };

  // Autonomous processing loop
  useEffect(() => {
    if (!processing) return;

    if (currentJobIndex >= jobs.length) {
      setProcessing(false);
      setComplete(true);
      return;
    }

    let isCancelled = false;
    const currentJob = jobs[currentJobIndex];

    const processStep = async () => {
      try {
        // Step 1: Scanning
        setJobs(prev => prev.map((j, i) => i === currentJobIndex ? { ...j, status: 'SCANNING', logs: ['INITIALIZING LIVE SCANS VIA LOCUS...'] } : j));
        
        const verifyRes = await fetch(`${apiUrl}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: currentJob.email })
        });
        
        if (!verifyRes.ok) {
          const errText = await verifyRes.text()
          throw new Error(`Verify failed: ${errText.slice(0, 50)}... Ensure backend is running.`);
        }
        const verifyData = await verifyRes.json();
        
        if (isCancelled) return;

        const isBad = verifyData.assessment?.riskLevel === 'HIGH';

        if (isBad) {
          setJobs(prev => prev.map((j, i) => i === currentJobIndex ? { 
            ...j, 
            status: 'BLOCKED', 
            logs: [...j.logs, `CRITICAL: ${verifyData.assessment?.summary}`] 
          } : j));
          if (!isCancelled) setCurrentJobIndex(prev => prev + 1);
          return;
        }

        setJobs(prev => prev.map((j, i) => i === currentJobIndex ? { 
          ...j, 
          logs: [...j.logs, 'Checks passed. Risk score: LOW.'] 
        } : j));
        
        if (isCancelled) return;

        // Step 2: Invoicing
        setJobs(prev => prev.map((j, i) => i === currentJobIndex ? { ...j, status: 'INVOICING', logs: [...j.logs, `Generating ${currentJob.amount.toFixed(2)} USDC invoice...`] } : j));
        
        const invoiceRes = await fetch(`${apiUrl}/invoice/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            description: 'Batch Verification Escrow',
            amount: currentJob.amount,
            clientName: currentJob.company,
            clientEmail: currentJob.email
          })
        });

        if (!invoiceRes.ok) throw new Error('Invoice generation failed');
        const invoiceData = await invoiceRes.json();
        
        if (isCancelled) return;

        // Step 3: Complete
        setJobs(prev => prev.map((j, i) => i === currentJobIndex ? { ...j, status: 'COMPLETED', logs: [...j.logs, `Invoice queued for escrow. (#${invoiceData.invoice.invoiceNumber})`] } : j));
        
        if (isCancelled) return;
        
      } catch (error) {
        setJobs(prev => prev.map((j, i) => i === currentJobIndex ? { ...j, status: 'BLOCKED', logs: [...j.logs, `ERROR: ${error.message}`] } : j));
      }
      
      setCurrentJobIndex(prev => prev + 1);
    };

    processStep();

    return () => { isCancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentJobIndex, processing]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return <span className="badge" style={{ color: 'var(--text-muted)' }}>QUEUED</span>;
      case 'SCANNING': return <span className="badge badge-caution cursor-blink">SCANNING</span>;
      case 'INVOICING': return <span className="badge badge-info cursor-blink">INVOICING</span>;
      case 'COMPLETED': return <span className="badge badge-safe">COMPLETED</span>;
      case 'BLOCKED': return <span className="badge badge-danger">BLOCKED</span>;
      default: return null;
    }
  };

  const generatedCount = jobs.filter(j => j.status === 'COMPLETED').length;
  const blockedCount = jobs.filter(j => j.status === 'BLOCKED').length;
  const totalValue = jobs.filter(j => j.status === 'COMPLETED').reduce((acc, j) => acc + j.amount, 0);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '1100px' }}>
        <span className="mono mb-16" style={{ display: 'block' }}>AUTONOMOUS AGENT</span>
        <h1 className="heading-lg mb-8">
          Bulk Verify & <em>Bill.</em>
        </h1>
        <p className="body-lg mb-32" style={{ maxWidth: '600px' }}>
          Upload a list of counterparties. The agent will automatically verify each entity and generate invoices for the safe ones.
        </p>

        {(!processing && !complete && jobs.length === 0) ? (
          <div className="grid-2 gap-32">
            <div className="card">
              <span className="mono mb-16" style={{ display: 'block' }}>DATA INPUT (CSV)</span>
              <p className="body-sm mb-16" style={{ color: 'var(--text-muted)' }}>
                Format: <code style={{ color: 'var(--accent)' }}>email, company name, amount</code>
              </p>
              <textarea 
                className="input mb-16" 
                rows="8" 
                placeholder="vendor@company.com, Company Inc, 1500.00"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                style={{ fontFamily: 'var(--mono)', fontSize: '0.875rem' }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={handleStart} disabled={!inputData.trim()}>
                  Start Agent →
                </button>
                <button className="btn btn-secondary" onClick={loadSampleData}>
                  Load Sample Data
                </button>
              </div>
            </div>
            
            <div 
              className="card" 
              style={{ 
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
                borderStyle: 'dashed', 
                borderColor: dragActive ? 'var(--accent)' : 'var(--border)',
                background: dragActive ? 'rgba(110, 86, 207, 0.05)' : 'transparent',
                opacity: dragActive ? 1 : 0.6,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileSelect} 
                 style={{ display: 'none' }} 
                 accept=".csv,.txt"
               />
               <div style={{ marginBottom: '16px', color: dragActive ? 'var(--accent)' : 'var(--text-muted)', filter: dragActive ? 'drop-shadow(0 0 10px var(--accent))' : 'none' }}>
                 <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
               </div>
               <span className="body text-center" style={{ color: dragActive ? 'var(--accent)' : 'var(--text)' }}>
                 {dragActive ? 'Drop file to upload' : 'Click or drag CSV file here'}
               </span>
               <span className="body-sm mt-8" style={{ color: 'var(--text-muted)' }}>(.csv or .txt files)</span>
            </div>
          </div>
        ) : (
          <div className="fade-in">
            {/* Progress / Summary Header */}
            <div className="card mb-32" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="mono mb-8" style={{ display: 'block' }}>
                  {processing ? 'AGENT IS RUNNING...' : 'BATCH COMPLETE'}
                </span>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div>
                    <div className="heading-md">{jobs.length}</div>
                    <div className="body-sm" style={{ color: 'var(--text-muted)' }}>Total targets</div>
                  </div>
                  <div>
                    <div className="heading-md" style={{ color: 'var(--green)' }}>{generatedCount}</div>
                    <div className="body-sm" style={{ color: 'var(--text-muted)' }}>Invoices created</div>
                  </div>
                  <div>
                    <div className="heading-md" style={{ color: 'var(--red)' }}>{blockedCount}</div>
                    <div className="body-sm" style={{ color: 'var(--text-muted)' }}>Threats blocked</div>
                  </div>
                  <div>
                    <div className="heading-md" style={{ color: 'var(--accent)' }}>${totalValue.toFixed(2)}</div>
                    <div className="body-sm" style={{ color: 'var(--text-muted)' }}>Total billed</div>
                  </div>
                </div>
              </div>
              {processing && <div className="spinner spinner-lg" />}
              {complete && (
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                  View Dashboard →
                </button>
              )}
            </div>

            {/* Live Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '16px' }}>
                <span className="mono">STATUS</span>
                <span className="mono">TARGET / LOGS</span>
                <span className="mono">AMOUNT</span>
                <span className="mono">ACTIONS</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {jobs.map((job, i) => (
                  <div key={i} style={{ 
                    padding: '20px 24px', 
                    borderBottom: '1px solid var(--border)',
                    display: 'grid', 
                    gridTemplateColumns: '1fr 2fr 1fr 1fr', 
                    gap: '16px',
                    background: currentJobIndex === i ? 'rgba(110, 86, 207, 0.05)' : 'transparent',
                    opacity: job.status === 'PENDING' ? 0.5 : 1
                  }}>
                    <div>{getStatusBadge(job.status)}</div>
                    
                    <div>
                      <div className="body" style={{ fontWeight: 500 }}>{job.company}</div>
                      <div className="body-sm mb-8" style={{ color: 'var(--text-muted)' }}>{job.email}</div>
                      
                      {job.logs.length > 0 && (
                        <div style={{ background: 'var(--bg)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                          {job.logs.map((log, li) => (
                            <div key={li} className="mono" style={{ fontSize: '0.75rem', color: log.includes('CRITICAL') ? 'var(--red)' : 'var(--text-muted)', marginBottom: '4px' }}>
                              &gt; {log}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="body" style={{ color: 'var(--accent)' }}>
                      ${job.amount.toFixed(2)} USDC
                    </div>
                    
                    <div>
                      {job.status === 'COMPLETED' && (
                        <span className="body-sm" style={{ color: 'var(--green)', cursor: 'pointer' }} 
                              onClick={() => navigate(`/invoice?company=${encodeURIComponent(job.company)}&amount=${job.amount}&email=${encodeURIComponent(job.email)}`)}>
                          View Invoice ↗
                        </span>
                      )}
                      {job.status === 'BLOCKED' && (
                        <span className="body-sm" style={{ color: 'var(--red)', cursor: 'pointer' }} onClick={() => navigate('/report/rep_123')}>View Report ↗</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
