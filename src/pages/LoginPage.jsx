import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginUser } = useAppContext()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await loginUser(form.email, form.password)

    if (!result.success) {
      setError(result.message)
      return
    }

    const from = location.state?.from?.pathname || `/dashboard/${result.user.role}`
    navigate(from, { replace: true })
  }

  return (
    <div className="page-shell auth-page">
      <div className="auth-card auth-card-split">
        <div className="auth-panel">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to Shareat</h1>
          <p>Sign in to continue managing donations, pickup schedules, and verified partner requests.</p>
          <div className="auth-highlights">
            <div>
              <strong>Secure access</strong>
              <p>Login safely and keep your personal donation history private.</p>
            </div>
            <div>
              <strong>Role-based dashboard</strong>
              <p>Open the correct view for donors, NGOs, or administrators.</p>
            </div>
          </div>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2>Login to your account</h2>
            <p>Use the email and password you registered with.</p>
          </div>
          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              Email address
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </label>
            <label>
              Password
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
            </label>
            {error ? <p className="error-text">{error}</p> : null}
            <button className="btn btn-full btn-primary" type="submit">
              Sign in
            </button>
          </form>

          <div className="demo-card">
            <h3>Demo access</h3>
            <p>Use one of the ready-made accounts to explore donor, NGO, or admin workflows.</p>
            <div className="demo-list">
              <span>Donor: donor@shareat.com / 123456</span>
              <span>NGO: ngo@shareat.com / 123456</span>
              <span>Admin: admin@shareat.com / 123456</span>
            </div>
          </div>

          <p className="auth-link">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
