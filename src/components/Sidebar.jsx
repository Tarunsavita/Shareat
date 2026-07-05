import { NavLink, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const donorLinks = [
  { to: '/dashboard/donor', label: 'My dashboard' },
  { to: '/dashboard/donor#requests', label: 'Donation requests' },
]

const ngoLinks = [
  { to: '/dashboard/ngo', label: 'Incoming requests' },
  { to: '/dashboard/ngo#dispatch', label: 'Collection queue' },
]

const adminLinks = [
  { to: '/dashboard/admin', label: 'Operations' },
  { to: '/dashboard/admin#partners', label: 'Partner verification' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAppContext()

  const links = currentUser?.role === 'ngo'
    ? ngoLinks
    : currentUser?.role === 'admin'
      ? adminLinks
      : donorLinks

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <p className="eyebrow">Signed in as</p>
        <h3>{currentUser?.name}</h3>
        <p className="muted">{currentUser?.organization || currentUser?.city}</p>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          logout()
          navigate('/login')
        }}
      >
        Log out
      </button>
    </aside>
  )
}
