import { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from './Navbar'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const STAGES = ['Negotiation', 'Agreement', 'Closed']

function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN')
}

function DealCard({ deal, onMove, onDelete }) {
  const isFirst = deal.stage === STAGES[0]
  const isLast  = deal.stage === STAGES[STAGES.length - 1]

  return (
    <div style={{
      background: '#fff', borderRadius: '10px', padding: '16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '12px',
      borderLeft: `4px solid ${
        deal.stage === 'Negotiation' ? '#f39c12' :
        deal.stage === 'Agreement'   ? '#3498db' : '#27ae60'
      }`
    }}>
      <div style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: '6px', fontSize: '14px' }}>
        {deal.client_name}
      </div>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
        {deal.property_title}
      </div>
      <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
        Deal: <strong>{formatPrice(deal.deal_value)}</strong>
      </div>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
        Commission: {formatPrice(deal.commission)}
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '12px' }}>
        Agent: {deal.agent_name}
      </div>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {!isFirst && (
            <button onClick={() => onMove(deal, 'back')} style={{
              padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
              border: '1px solid #ddd', background: '#f5f5f5',
              cursor: 'pointer', color: '#555'
            }}>← Back</button>
          )}
          {!isLast && (
            <button onClick={() => onMove(deal, 'forward')} style={{
              padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
              border: 'none', background: '#1a73e8',
              cursor: 'pointer', color: '#fff'
            }}>Forward →</button>
          )}
        </div>
        <button onClick={() => onDelete(deal.id, deal.client_name)} style={{
          padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
          border: '1px solid #fcc', background: '#fff5f5',
          cursor: 'pointer', color: '#c0392b'
        }}>Delete</button>
      </div>
    </div>
  )
}

function AddDealForm({ onClose, onAdded }) {
  const [form, setForm] = useState({
    client_id: 1, property_id: 3, agent_id: 3,
    stage: 'Negotiation', deal_value: '', commission: ''
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await axios.post(`${API}/deals`, form)
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
        background: '#fff', borderRadius: '12px', padding: '28px',
        width: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
      }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px' }}>Add New Deal</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '12px', color: '#888' }}>Client ID</label>
          <input style={inputStyle} name="client_id"   type="number" value={form.client_id}   onChange={handleChange} required />
          <label style={{ fontSize: '12px', color: '#888' }}>Property ID</label>
          <input style={inputStyle} name="property_id" type="number" value={form.property_id} onChange={handleChange} required />
          <label style={{ fontSize: '12px', color: '#888' }}>Agent ID</label>
          <input style={inputStyle} name="agent_id"    type="number" value={form.agent_id}    onChange={handleChange} required />
          <label style={{ fontSize: '12px', color: '#888' }}>Deal Value (₹)</label>
          <input style={inputStyle} name="deal_value"  type="number" value={form.deal_value}  onChange={handleChange} required />
          <label style={{ fontSize: '12px', color: '#888' }}>Commission (₹)</label>
          <input style={inputStyle} name="commission"  type="number" value={form.commission}   onChange={handleChange} required />
          <select style={inputStyle} name="stage" value={form.stage} onChange={handleChange}>
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '8px 18px', borderRadius: '8px',
              border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer'
            }}>Cancel</button>
            <button type="submit" style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none',
              background: '#1a73e8', color: '#fff', cursor: 'pointer', fontWeight: 500
            }}>Save Deal</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Deals() {
  const [deals, setDeals]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function fetchDeals() {
    try {
      const res = await axios.get(`${API}/deals`)
      setDeals(res.data)
    } catch (err) {
      alert('Could not connect to API: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function moveDeal(deal, direction) {
    const currentIndex = STAGES.indexOf(deal.stage)
    const newStage     = direction === 'forward'
      ? STAGES[currentIndex + 1]
      : STAGES[currentIndex - 1]

    await axios.put(`${API}/deals/${deal.id}`, {
      stage:      newStage,
      deal_value: deal.deal_value,
      commission: deal.commission
    })
    fetchDeals()
  }

  async function deleteDeal(id, name) {
    if (!window.confirm(`Delete deal for "${name}"?`)) return
    await axios.delete(`${API}/deals/${id}`)
    fetchDeals()
  }

  useEffect(() => { fetchDeals() }, [])

  const totalValue      = deals.reduce((sum, d) => sum + Number(d.deal_value),  0)
  const totalCommission = deals.reduce((sum, d) => sum + Number(d.commission),  0)
  const closedDeals     = deals.filter(d => d.stage === 'Closed').length

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f7f8fc', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#1a1a2e' }}>Deals Pipeline</h1>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>Track deals from negotiation to closure</p>
          </div>
          <button onClick={() => setShowForm(true)} style={{
            padding: '10px 20px', background: '#1a73e8', color: '#fff',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontSize: '14px', fontWeight: 500
          }}>+ Add Deal</button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Deals',      value: deals.length },
            { label: 'Closed Deals',     value: closedDeals },
            { label: 'Total Value',      value: formatPrice(totalValue) },
            { label: 'Total Commission', value: formatPrice(totalCommission) },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: '10px', padding: '16px 20px',
              flex: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a2e' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        {loading ? (
          <p style={{ color: '#888', textAlign: 'center' }}>Loading deals...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {STAGES.map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage)
              const color = stage === 'Negotiation' ? '#f39c12' :
                            stage === 'Agreement'   ? '#3498db' : '#27ae60'
              return (
                <div key={stage}>
                  {/* Column Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                      <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '15px' }}>{stage}</span>
                    </div>
                    <span style={{
                      background: color + '22', color: color,
                      borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: 500
                    }}>{stageDeals.length}</span>
                  </div>

                  {/* Column Body */}
                  <div style={{
                    background: '#eeeff4', borderRadius: '12px',
                    padding: '12px', minHeight: '200px'
                  }}>
                    {stageDeals.length === 0 ? (
                      <p style={{ color: '#bbb', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                        No deals here
                      </p>
                    ) : (
                      stageDeals.map(deal => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          onMove={moveDeal}
                          onDelete={deleteDeal}
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && <AddDealForm onClose={() => setShowForm(false)} onAdded={fetchDeals} />}
    </div>
  )
}