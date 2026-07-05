import { useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import { useAppContext } from '../context/AppContext'

export default function AdminDashboardPage() {
  const { users, donations, stats, toggleUserVerification, updateDonationStatus } = useAppContext()

  const pendingPartners = useMemo(() => users.filter((user) => user.role === 'ngo' && !user.verified), [users])

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Admin operations</p>
            <h1>Operator control center</h1>
            <p>Verify partners, review collection health, and ensure a transparent and trusted delivery flow.</p>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <strong>{stats.total}</strong>
            <span>Requests tracked</span>
          </article>
          <article className="stat-card">
            <strong>{stats.pending}</strong>
            <span>Pending requests</span>
          </article>
          <article className="stat-card">
            <strong>{stats.accepted}</strong>
            <span>Accepted</span>
          </article>
          <article className="stat-card">
            <strong>{stats.collected}</strong>
            <span>Collected</span>
          </article>
        </section>

        <section className="content-grid">
          <div className="card" id="partners">
            <h2>Partner verification</h2>
            <div className="list-stack">
              {users.filter((user) => user.role === 'ngo').map((user) => (
                <div key={user.id} className="list-item">
                  <div>
                    <strong>{user.organization || user.name}</strong>
                    <p>{user.city} • {user.email}</p>
                  </div>
                  <button type="button" className="btn btn-small" onClick={() => toggleUserVerification(user.id)}>
                    {user.verified ? 'Unverify' : 'Verify'}
                  </button>
                </div>
              ))}
            </div>
            {pendingPartners.length ? <p className="muted">{pendingPartners.length} NGO account(s) still need review.</p> : null}
          </div>

          <div className="card">
            <h2>Donation monitoring</h2>
            <div className="list-stack">
              {donations.map((donation) => (
                <div key={donation.id} className="list-item">
                  <div>
                    <strong>{donation.category}</strong>
                    <p>{donation.donorName} • {donation.city}</p>
                    <p className="muted">{donation.status}</p>
                  </div>
                  <div className="list-actions">
                    <button type="button" className="btn btn-small btn-secondary" onClick={() => updateDonationStatus(donation.id, 'Distributed')}>
                      Resolve
                    </button>
                    <button type="button" className="btn btn-small" onClick={() => updateDonationStatus(donation.id, 'Dispute')}>
                      Escalate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
