import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const impactPoints = [
  'Verified partners and transparent status updates',
  'Doorstep collection scheduling for convenient giving',
  'A complete journey from donor request to distribution reporting',
]

export default function HomePage() {
  const { stats, currentUser } = useAppContext()

  const workflowSteps = [
    {
      title: 'Register and verify',
      description: 'Donors sign up, NGOs join with organization details, and admins review partner verification.',
    },
    {
      title: 'Submit donation request',
      description: 'Donors list items, select pickup windows, and send requests to verified community partners.',
    },
    {
      title: 'Partner acceptance',
      description: 'NGOs review nearby requests, confirm collections, and coordinate doorstep pickups.',
    },
    {
      title: 'Track and confirm',
      description: 'Status updates are shared live, records are stored, and donors receive final distribution confirmation.',
    },
  ]

  const aboutFeatures = [
    {
      title: 'Sustainability built in',
      text: 'Reduce waste by reusing clothes and household goods while empowering local NGOs and beneficiaries.',
    },
    {
      title: 'Transparent results',
      text: 'Track each donation with a clear status lifecycle, reducing uncertainty and improving trust.',
    },
    {
      title: 'Community impact',
      text: 'Connect donors directly with verified partners and needy families in your city.',
    },
  ]

  return (
    <div className="page-shell hero-page">
      <header className="topbar topbar-light">
        <Link className="brand" to="/">
          <span className="brand-mark">♻</span>
          <span>Shareat</span>
        </Link>
        <nav className="topnav">
          <a href="#impact">Impact</a>
          <a href="#workflows">Workflows</a>
          <a href="#about">About</a>
        </nav>
        {currentUser ? (
          <Link className="btn btn-small" to={`/dashboard/${currentUser.role}`}>
            Open dashboard
          </Link>
        ) : (
          <div className="top-actions">
            <Link className="btn btn-small btn-secondary" to="/login">
              Sign in
            </Link>
            <Link className="btn btn-small" to="/register">
              Join now
            </Link>
          </div>
        )}
      </header>

      <section className="hero hero-home">
        <div className="hero-copy">
          <p className="eyebrow">Donation & Reuse Platform</p>
          <h1>Reimagine giving with a complete platform for clothes, home essentials, and community care.</h1>
          <p className="hero-text">
            Shareat allows donors to schedule doorstep collections, partners to accept and fulfill requests, and admins to verify the network with full transparency.
          </p>
          <div className="cta-group">
            <Link className="btn" to="/register">
              Create an account
            </Link>
            <Link className="btn btn-secondary" to="/login">
              Explore the dashboard
            </Link>
          </div>
          <ul className="hero-points">
            {impactPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="hero-card">
          <h2>Platform metrics</h2>
          <div className="metric-grid">
            <div className="metric-card">
              <strong>{stats.total}</strong>
              <span>Donation requests</span>
            </div>
            <div className="metric-card">
              <strong>{stats.verifiedPartners}</strong>
              <span>Verified NGOs</span>
            </div>
            <div className="metric-card">
              <strong>{stats.accepted}</strong>
              <span>Accepted pickups</span>
            </div>
            <div className="metric-card">
              <strong>{stats.collected}</strong>
              <span>Collected items</span>
            </div>
          </div>
          <div className="hero-card-footer">
            <div className="demo-card demo-card-inline">
              <h3>Try the live demo</h3>
              <p>Use donor, NGO, or admin accounts to explore the full workflow instantly.</p>
              <div className="demo-list">
                <span>Donor: donor@shareat.com / 123456</span>
                <span>NGO: ngo@shareat.com / 123456</span>
                <span>Admin: admin@shareat.com / 123456</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="impact" className="section">
        <div className="section-heading">
          <p className="eyebrow">What the platform does</p>
          <h2>From discovery to transparent distribution, everything is connected.</h2>
        </div>
        <div className="feature-grid">
          <article className="card">
            <h3>Donor-first booking</h3>
            <p>Schedule a pickup, share details, and keep a clear donation record for every item.</p>
          </article>
          <article className="card">
            <h3>NGO fulfillment</h3>
            <p>Partners receive requests, confirm pickups, and track distribution without manual paperwork.</p>
          </article>
          <article className="card">
            <h3>Admin supervision</h3>
            <p>Review partners, manage disputes, and keep the network efficient and trustworthy.</p>
          </article>
        </div>
      </section>

      <section id="workflows" className="section">
        <div className="section-heading">
          <p className="eyebrow">Platform workflows</p>
          <h2>Every donation moves through a reliable, transparent workflow.</h2>
        </div>
        <div className="workflow-grid">
          {workflowSteps.map((step, index) => (
            <article key={step.title} className="step-card">
              <span className="step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="section about-section">
        <div className="section-heading">
          <p className="eyebrow">About Shareat</p>
          <h2>A modern platform for donation, reuse, and sustainable community care.</h2>
        </div>
        <div className="feature-grid">
          {aboutFeatures.map((feature) => (
            <article key={feature.title} className="card">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
        <div className="about-cta">
          <p>
            Build a donation experience that helps people give with confidence, helps partners serve communities faster, and helps admin teams maintain trust.
          </p>
          <div className="cta-group">
            <Link className="btn" to="/register">
              Start donating
            </Link>
            <Link className="btn btn-secondary" to="/login">
              View the network
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
