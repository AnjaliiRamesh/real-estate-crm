import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const links = [
    { path: '/',           label: 'Leads'      },
    { path: '/properties', label: 'Properties' },
    { path: '/deals',      label: 'Deals'      },
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