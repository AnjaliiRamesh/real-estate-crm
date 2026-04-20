import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API = 'http://localhost:3000'

import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()
  const links = [
    { path: '/',           label: 'Leads'      },
    { path: '/properties', label: 'Properties' },
  ]
  return (
    <nav style={{
      background: '#1a1a2e', padding: '0 32px',
      display: 'flex', alignItems: 'center', gap: '8px', height: '56px'
    }}>
      <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px', marginRight: '24px' }}>
        RE CRM
      </span>
      {links.map(l => (
        <Link key={l.path} to={l.path} style={{
          color:          location.pathname === l.path ? '#fff'    : '#aaa',
          background:     location.pathname === l.path ? '#ffffff22' : 'transparent',
          padding:        '6px 16px',
          borderRadius:   '6px',
          textDecoration: 'none',
          fontSize:       '14px',
          fontWeight:     location.pathname === l.path ? 500 : 400
        }}>{l.label}</Link>
      ))}
    </nav>
  )
}

// ── Status badge colors ──────────────────────
function StatusBadge({ status }) {
  const colors = {
    New:        { background: '#e8f4fd', color: '#1a6fa8', border: '1px solid #b3d9f5' },
    Contacted:  { background: '#fff8e1', color: '#8a6200', border: '1px solid #ffe082' },
    Qualified:  { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' },
    Closed:     { background: '#ede7f6', color: '#4527a0', border: '1px solid #ce93d8' },
    Lost:       { background: '#fce4ec', color: '#b71c1c', border: '1px solid #f48fb1' },
  }
  const style = colors[status] || { background: '#eee', color: '#333' }
  return (
    <span style={{
      ...style,
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 500
    }}>
      {status}
    </span>
  )
}

// ── Format budget as ₹ ──────────────────────
function formatBudget(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

// ── Add Lead Form ────────────────────────────
function AddLeadForm({ onClose, onLeadAdded }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    source: 'website', budget: '', assigned_to: 2, notes: ''
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await axios.post(`${API}/leads`, form)
      onLeadAdded()
      onClose()
    } catch (err) {
      alert('Error creating lead: ' + err.message)
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px 12px', marginBottom: '12px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', boxSizing: 'border-box'
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px',
        padding: '28px', width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px' }}>Add New Lead</h2>
        <form onSubmit={handleSubmit}>
          <input style={inputStyle} name="name"   placeholder="Full Name *"    value={form.name}   onChange={handleChange} required />
          <input style={inputStyle} name="phone"  placeholder="Phone Number"   value={form.phone}  onChange={handleChange} />
          <input style={inputStyle} name="email"  placeholder="Email Address"  value={form.email}  onChange={handleChange} type="email" />
          <select style={inputStyle} name="source" value={form.source} onChange={handleChange}>
            <option value="website">Website</option>
            <option value="ads">Ads</option>
            <option value="referral">Referral</option>
            <option value="call">Call</option>
          </select>
          <input style={inputStyle} name="budget" placeholder="Budget (₹)"    value={form.budget} onChange={handleChange} type="number" />
          <select style={inputStyle} name="assigned_to" value={form.assigned_to} onChange={handleChange}>
            <option value={2}>Anjali Mehta</option>
            <option value={3}>Vikram Nair</option>
          </select>
          <textarea style={{...inputStyle, height: '80px', resize: 'vertical'}}
            name="notes" placeholder="Notes" value={form.notes} onChange={handleChange}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '8px 18px', borderRadius: '8px',
              border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer'
            }}>Cancel</button>
            <button type="submit" style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none',
              background: '#1a73e8', color: '#fff', cursor: 'pointer', fontWeight: 500
            }}>Save Lead</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main App ─────────────────────────────────
export default function App() {
  const [leads, setLeads]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [filterStatus, setFilter] = useState('All')

  async function fetchLeads() {
    try {
      const res = await axios.get(`${API}/leads`)
      setLeads(res.data)
    } catch (err) {
      alert('Could not connect to API: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteLead(id, name) {
    if (!window.confirm(`Delete lead "${name}"?`)) return
    await axios.delete(`${API}/leads/${id}`)
    fetchLeads()
  }

  async function updateStatus(id, newStatus) {
    const lead = leads.find(l => l.id === id)
    await axios.put(`${API}/leads/${id}`, { ...lead, status: newStatus })
    fetchLeads()
  }

  useEffect(() => { fetchLeads() }, [])

  const statuses   = ['All', 'New', 'Contacted', 'Qualified', 'Closed', 'Lost']
  const filtered   = filterStatus === 'All' ? leads : leads.filter(l => l.status === filterStatus)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f7f8fc', minHeight: '100vh', padding: '32px' }}>

<Navbar />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1a1a2e' }}>Real Estate CRM</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>Lead Management Dashboard</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', background: '#1a73e8', color: '#fff',
          border: 'none', borderRadius: '8px', cursor: 'pointer',
          fontSize: '14px', fontWeight: 500
        }}>+ Add Lead</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {['New','Contacted','Qualified','Closed','Lost'].map(s => (
          <div key={s} style={{
            background: '#fff', borderRadius: '10px', padding: '16px 20px',
            flex: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
          }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a2e' }}>
              {leads.filter(l => l.status === s).length}
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 16px', borderRadius: '20px', cursor: 'pointer',
            border: '1px solid #ddd', fontSize: '13px',
            background: filterStatus === s ? '#1a73e8' : '#fff',
            color:      filterStatus === s ? '#fff'    : '#555',
            fontWeight: filterStatus === s ? 500       : 400
          }}>{s}</button>
        ))}
      </div>

      {/* Leads Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7f8fc', borderBottom: '1px solid #eee' }}>
              {['Name','Phone','Source','Budget','Status','Agent','Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>Loading leads...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No leads found</td></tr>
            ) : filtered.map((lead, i) => (
              <tr key={lead.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '14px 16px', fontWeight: 500, color: '#1a1a2e' }}>{lead.name}</td>
                <td style={{ padding: '14px 16px', color: '#555', fontSize: '14px' }}>{lead.phone}</td>
                <td style={{ padding: '14px 16px', color: '#555', fontSize: '14px', textTransform: 'capitalize' }}>{lead.source}</td>
                <td style={{ padding: '14px 16px', color: '#555', fontSize: '14px' }}>{formatBudget(lead.budget)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <select
                    value={lead.status}
                    onChange={e => updateStatus(lead.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px' }}
                  >
                    {['New','Contacted','Qualified','Closed','Lost'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <StatusBadge status={lead.status} />
                </td>
                <td style={{ padding: '14px 16px', color: '#555', fontSize: '14px' }}>{lead.agent_name}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => deleteLead(lead.id, lead.name)} style={{
                    padding: '5px 12px', borderRadius: '6px', border: '1px solid #fcc',
                    background: '#fff5f5', color: '#c0392b', cursor: 'pointer', fontSize: '12px'
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Lead Modal */}
      {showForm && <AddLeadForm onClose={() => setShowForm(false)} onLeadAdded={fetchLeads} />}
    </div>
  )
}