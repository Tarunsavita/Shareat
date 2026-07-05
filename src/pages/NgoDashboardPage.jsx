import { useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import { useAppContext } from '../context/AppContext'

export default function NgoDashboardPage() {
  const { currentUser, donations, acceptDonation, updateDonationStatus } = useAppContext()

  const incomingRequests = useMemo(() => donations.filter((donation) => donation.status === 'Requested'), [donations])
  const activeQueue = useMemo(() => donations.filter((donation) => donation.partnerName === (currentUser?.organization || currentUser?.name)), [currentUser, donations])

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">NGO workspace</p>
            <h1>Manage incoming donations for {currentUser?.organization}</h1>
            <p>Accept collection requests, dispatch pickups, and confirm distribution updates.</p>
          </div>
        </header>

        <section className="content-grid">
          <div className="card" id="requests">
            <h2>Incoming requests</h2>
            <div className="list-stack">
              {incomingRequests.length === 0 ? (
                <p className="muted">No new donation requests are waiting right now. Check back later for incoming requests.</p>
              ) : incomingRequests.map((donation) => (
                <div key={donation.id} className="list-item">
                  <div>
                    <strong>{donation.category}</strong>
                    <p>{donation.quantity} items • {donation.city}</p>
                    <p className="muted">{donation.address}</p>
                  </div>
                  <button type="button" className="btn btn-small" onClick={() => acceptDonation(donation.id)}>
                    Accept request
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card" id="dispatch">
            <h2>Collection queue</h2>
            <div className="list-stack">
              {activeQueue.length === 0 ? (
                <p className="muted">No active collection queue items yet. Accepted requests will appear here for follow-up.</p>
              ) : activeQueue.map((donation) => (
                <div key={donation.id} className="list-item">
                  <div>
                    <strong>{donation.category}</strong>
                    <p>{donation.status} • {donation.donorName}</p>
                    <p className="muted">{donation.notes || 'Ready for collection'}</p>
                  </div>
                  <div className="list-actions">
                    <button type="button" className="btn btn-small btn-secondary" onClick={() => updateDonationStatus(donation.id, 'Collected')}>
                      Mark collected
                    </button>
                    <button type="button" className="btn btn-small" onClick={() => updateDonationStatus(donation.id, 'Distributed')}>
                      Mark distributed
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
