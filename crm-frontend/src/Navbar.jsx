import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function Navbar() {
  const location          = useLocation()
  const navigate          = useNavigate()
  const { user, logout }  = useAuth()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const links = [
    { path: '/',           label: 'Leads'      },
    { path: '/properties', label: 'Properties' },
    { path: '/deals',      label: 'Deals'      },
  ]

  return (
    <nav style={{
      background: '#1a1a2e', padding: '0 32px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: '56px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px', marginRight: '24px' }}>
          RE CRM
        </span>
        {links.map(l => (
          <Link key={l.path} to={l.path} style={{
            color:          location.pathname === l.path ? '#fff'      : '#aaa',
            background:     location.pathname === l.path ? '#ffffff22' : 'transparent',
            padding:        '6px 16px',
            borderRadius:   '6px',
            textDecoration: 'none',
            fontSize:       '14px',
            fontWeight:     location.pathname === l.path ? 500 : 400
          }}>{l.label}</Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user && (
          <span style={{ color: '#aaa', fontSize: '13px' }}>
            {user.name} · {user.role}
          </span>
        )}
        <button onClick={handleLogout} style={{
          padding: '6px 14px', borderRadius: '6px',
          border: '1px solid #ffffff33', background: 'transparent',
          color: '#aaa', cursor: 'pointer', fontSize: '13px'
        }}>Logout</button>
      </div>
    </nav>
  )
}