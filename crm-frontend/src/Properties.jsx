import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from './Navbar'

// import Navbar from "app.jsx"

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'


function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

function StatusBadge({ status }) {
  const colors = {
    available: { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' },
    sold:      { background: '#fce4ec', color: '#b71c1c', border: '1px solid #f48fb1' },
    rented:    { background: '#fff8e1', color: '#8a6200', border: '1px solid #ffe082' },
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

function AddPropertyForm({ onClose, onAdded }) {
  const [form, setForm] = useState({
    title: '', type: 'residential', price: '',
    location: '', city: '', size_sqft: '', agent_id: 2
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await axios.post(`${API}/properties`, form)
      onAdded()
      onClose()
    } catch (err) {
      alert('Error: ' + err.message)
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
        padding: '28px', width: '420px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px' }}>Add New Property</h2>
        <form onSubmit={handleSubmit}>
          <input style={inputStyle} name="title"     placeholder="Property Title *" value={form.title}     onChange={handleChange} required />
          <select style={inputStyle} name="type"     value={form.type}     onChange={handleChange}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
          <input style={inputStyle} name="price"     placeholder="Price (₹)"        value={form.price}     onChange={handleChange} type="number" />
          <input style={inputStyle} name="location"  placeholder="Full Address"      value={form.location}  onChange={handleChange} />
          <input style={inputStyle} name="city"      placeholder="City"              value={form.city}      onChange={handleChange} />
          <input style={inputStyle} name="size_sqft" placeholder="Size (sq ft)"      value={form.size_sqft} onChange={handleChange} type="number" />
          <select style={inputStyle} name="agent_id" value={form.agent_id} onChange={handleChange}>
            <option value={2}>Anjali Mehta</option>
            <option value={3}>Vikram Nair</option>
          </select>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '8px 18px', borderRadius: '8px',
              border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer'
            }}>Cancel</button>
            <button type="submit" style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none',
              background: '#1a73e8', color: '#fff', cursor: 'pointer', fontWeight: 500
            }}>Save Property</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Properties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [filterType, setFilter]     = useState('All')

  async function fetchProperties() {
    try {
      const res = await axios.get(`${API}/properties`)
      setProperties(res.data)
    } catch (err) {
      alert('Could not connect to API: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteProperty(id, title) {
    if (!window.confirm(`Delete "${title}"?`)) return
    await axios.delete(`${API}/properties/${id}`)
    fetchProperties()
  }

  async function updateStatus(id, newStatus) {
    const p = properties.find(p => p.id === id)
    await axios.put(`${API}/properties/${id}`, { ...p, status: newStatus })
    fetchProperties()
  }

  useEffect(() => { fetchProperties() }, [])

  const types    = ['All', 'residential', 'commercial']
  const filtered = filterType === 'All' ? properties : properties.filter(p => p.type === filterType)

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f7f8fc', minHeight: '100vh', padding: '32px' }}>
        <Navbar />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1a1a2e' }}>Properties</h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>Property Listings Dashboard</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          padding: '10px 20px', background: '#1a73e8', color: '#fff',
          border: 'none', borderRadius: '8px', cursor: 'pointer',
          fontSize: '14px', fontWeight: 500
        }}>+ Add Property</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {['available', 'sold', 'rented'].map(s => (
          <div key={s} style={{
            background: '#fff', borderRadius: '10px', padding: '16px 20px',
            flex: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
          }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a2e' }}>
              {properties.filter(p => p.status === s).length}
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textTransform: 'capitalize' }}>{s}</div>
          </div>
        ))}
        <div style={{
          background: '#fff', borderRadius: '10px', padding: '16px 20px',
          flex: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
        }}>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a2e' }}>
            {properties.length}
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Total</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '6px 16px', borderRadius: '20px', cursor: 'pointer',
            border: '1px solid #ddd', fontSize: '13px',
            background: filterType === t ? '#1a73e8' : '#fff',
            color:      filterType === t ? '#fff'    : '#555',
            fontWeight: filterType === t ? 500       : 400,
            textTransform: 'capitalize'
          }}>{t}</button>
        ))}
      </div>

      {/* Properties Table */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7f8fc', borderBottom: '1px solid #eee' }}>
              {['Title', 'Type', 'Price', 'Location', 'Size', 'Status', 'Agent', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#888', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>Loading properties...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#888' }}>No properties found</td></tr>
            ) : filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '14px 16px', fontWeight: 500, color: '#1a1a2e' }}>{p.title}</td>
                <td style={{ padding: '14px 16px', color: '#555', fontSize: '14px', textTransform: 'capitalize' }}>{p.type}</td>
                <td style={{ padding: '14px 16px', color: '#555', fontSize: '14px' }}>{formatPrice(p.price)}</td>
                <td style={{ padding: '14px 16px', color: '#555', fontSize: '14px' }}>{p.city}</td>
                <td style={{ padding: '14px 16px', color: '#555', fontSize: '14px' }}>{p.size_sqft} sqft</td>
                <td style={{ padding: '14px 16px' }}>
                  <select
                    value={p.status}
                    onChange={e => updateStatus(p.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', marginRight: '6px' }}
                  >
                    {['available', 'sold', 'rented'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <StatusBadge status={p.status} />
                </td>
                <td style={{ padding: '14px 16px', color: '#555', fontSize: '14px' }}>{p.agent_name}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => deleteProperty(p.id, p.title)} style={{
                    padding: '5px 12px', borderRadius: '6px', border: '1px solid #fcc',
                    background: '#fff5f5', color: '#c0392b', cursor: 'pointer', fontSize: '12px'
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <AddPropertyForm onClose={() => setShowForm(false)} onAdded={fetchProperties} />}
    </div>
  )
}