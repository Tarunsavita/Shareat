import { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useAppContext } from '../context/AppContext'

const initialForm = {
  category: 'Clothes',
  quantity: '2',
  address: '',
  city: '',
  notes: '',
  pickupDate: '',
  pickupTime: '',
}

const initialComplaint = {
  subject: '',
  description: '',
}

export default function DonorDashboardPage() {
  const { currentUser, donations, notifications, createDonationRequest, updateDonationStatus, createComplaint, clearNotifications } = useAppContext()
  const [form, setForm] = useState(initialForm)
  const [complaintForm, setComplaintForm] = useState(initialComplaint)
  const [message, setMessage] = useState('')
  const [complaintMessage, setComplaintMessage] = useState('')

  const donorDonations = useMemo(() => donations.filter((donation) => donation.donorId === currentUser?.id), [currentUser, donations])
  const stats = useMemo(() => ({
    total: donorDonations.length,
    pending: donorDonations.filter((donation) => donation.status === 'Requested').length,
    accepted: donorDonations.filter((donation) => donation.status === 'Accepted').length,
    collected: donorDonations.filter((donation) => donation.status === 'Collected').length,
  }), [donorDonations])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleComplaintChange = (event) => {
    const { name, value } = event.target
    setComplaintForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await createDonationRequest({
      category: form.category,
      quantity: form.quantity,
      address: form.address || currentUser?.address,
      city: form.city || currentUser?.city,
      notes: form.notes,
      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,
    })

    setMessage(result.success ? 'Donation request created successfully.' : result.message)
    if (result.success) {
      setForm(initialForm)
    }
  }

  const handleComplaintSubmit = async (event) => {
    event.preventDefault()
    const result = await createComplaint({
      subject: complaintForm.subject,
      description: complaintForm.description,
    })

    setComplaintMessage(result.success ? 'Your issue report was submitted successfully.' : result.message)
    if (result.success) {
      setComplaintForm(initialComplaint)
    }
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Donor workspace</p>
            <h1>Welcome back, {currentUser?.name}</h1>
            <p>Manage pickup requests, track fulfillment, and keep a transparent giving history.</p>
          </div>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <strong>{stats.total}</strong>
            <span>Total requests</span>
          </article>
          <article className="stat-card">
            <strong>{stats.pending}</strong>
            <span>Pending</span>
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
          <form className="card stack-form" onSubmit={handleSubmit}>
            <h2>Schedule a new pickup</h2>
            <label>
              Item type
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Clothes</option>
                <option>Books</option>
                <option>Kitchenware</option>
                <option>Furniture</option>
              </select>
            </label>
            <label>
              Quantity
              <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
            </label>
            <label>
              Address
              <textarea name="address" value={form.address} onChange={handleChange} rows="2" placeholder={currentUser?.address} />
            </label>
            <label>
              City
              <input name="city" value={form.city} onChange={handleChange} placeholder={currentUser?.city} />
            </label>
            <div className="inline-fields">
              <label>
                Pickup date
                <input name="pickupDate" type="date" value={form.pickupDate} onChange={handleChange} />
              </label>
              <label>
                Pickup time
                <input name="pickupTime" type="time" value={form.pickupTime} onChange={handleChange} />
              </label>
            </div>
            <label>
              Notes
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="2" placeholder="Kindly mention any special instructions" />
            </label>
            {message ? <p className="success-text">{message}</p> : null}
            <button className="btn" type="submit">
              Submit request
            </button>
          </form>

          <div className="stack-card-group">
            <div className="card" id="requests">
              <div className="section-title-row">
                <h2>Recent donation activity</h2>
                <span className="pill-soft">Live tracking</span>
              </div>
              <div className="list-stack">
                {donorDonations.length === 0 ? (
                  <p className="muted">You have not created any donation requests yet. Use the form to schedule your first pickup.</p>
                ) : (donorDonations.map((donation) => (
                  <div key={donation.id} className="list-item">
                    <div>
                      <strong>{donation.category}</strong>
                      <p>{donation.quantity} items • {donation.city}</p>
                      <p className="muted">{donation.pickupDate ? `${donation.pickupDate} • ${donation.pickupTime || 'Flexible'}` : 'Flexible pickup window'}</p>
                      <p className="muted">{donation.notes || 'No extra notes'}</p>
                    </div>
                    <div className="list-actions">
                      <span className={`status-pill ${donation.status.toLowerCase()}`}>{donation.status}</span>
                      {donation.status === 'Accepted' ? (
                        <button type="button" className="btn btn-small" onClick={() => updateDonationStatus(donation.id, 'Collected')}>
                          Mark collected
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))) }
              </div>
            </div>

            <div className="card">
              <div className="section-title-row">
                <h2>Updates & alerts</h2>
                <button type="button" className="link-btn" onClick={clearNotifications}>Clear</button>
              </div>
              <div className="list-stack">
                {notifications.length === 0 ? (
                  <p className="muted">No updates yet. Your latest donation events will show here.</p>
                ) : notifications.map((notification) => (
                  <div key={notification.id} className="notice-item">
                    <strong>{notification.message}</strong>
                    <p className="muted">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2>Report an issue</h2>
              <form className="stack-form" onSubmit={handleComplaintSubmit}>
                <label>
                  Subject
                  <input name="subject" value={complaintForm.subject} onChange={handleComplaintChange} placeholder="Pickup delay or other concern" required />
                </label>
                <label>
                  Description
                  <textarea name="description" value={complaintForm.description} onChange={handleComplaintChange} rows="3" placeholder="Tell us what happened" required />
                </label>
                {complaintMessage ? <p className="success-text">{complaintMessage}</p> : null}
                <button className="btn btn-small" type="submit">Send report</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
