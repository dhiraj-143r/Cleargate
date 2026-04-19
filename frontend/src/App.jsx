import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Verify from './pages/Verify'
import Invoice from './pages/Invoice'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Report from './pages/Report'
import Audit from './pages/Audit'
import Batch from './pages/Batch'
import Enterprise from './pages/Enterprise'

const API_URL = import.meta.env.DEV ? '/api' : 'https://svc-mo5nnu4nl3nuz3b7.buildwithlocus.com/api';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify" element={<Verify apiUrl={API_URL} />} />
        <Route path="/invoice" element={<Invoice apiUrl={API_URL} />} />
        <Route path="/checkout/:sessionId" element={<Checkout apiUrl={API_URL} />} />
        <Route path="/dashboard" element={<Dashboard apiUrl={API_URL} />} />
        <Route path="/report/:id" element={<Report apiUrl={API_URL} />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/batch" element={<Batch />} />
        <Route path="/enterprise" element={<Enterprise apiUrl={API_URL} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
