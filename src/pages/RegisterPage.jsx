import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'donor',
  organization: '',
  city: '',
  address: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { registerUser } = useAppContext()
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await registerUser(form)
    if (!result.success) {
      setMessage(result.message)
      return
    }

    navigate(`/dashboard/${result.user.role}`)
  }

  return (
    <div className="page-shell auth-page">
      <div className="auth-card auth-card-split">
        <div className="auth-panel">
          <p className="eyebrow">Start giving</p>
          <h1>Create your Shareat account</h1>
          <p>Register as a donor, NGO, or admin to begin matching donations with local beneficiaries.</p>
          <div className="auth-highlights">
            <div>
              <strong>Trusted network</strong>
              <p>Join a community of verified donors and NGOs.</p>
            </div>
            <div>
              <strong>Clear workflow</strong>
              <p>Submit and manage donation requests with confidence.</p>
            </div>
          </div>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2>Register your account</h2>
            <p>Fill in your details to create the right profile for your role.</p>
          </div>
          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              Full name
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
            </label>
            <label>
              Email address
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </label>
            <label>
              Password
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Choose a secure password" required />
            </label>
            <label>
              Account type
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="donor">Donor</option>
                <option value="ngo">NGO / Beneficiary</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {form.role === 'ngo' ? (
              <label>
                Organization name
                <input name="organization" value={form.organization} onChange={handleChange} placeholder="Organization or beneficiary name" required />
              </label>
            ) : null}

            <div className="inline-fields">
              <label>
                City
                <input name="city" value={form.city} onChange={handleChange} placeholder="City or region" required />
              </label>
              <label>
                Address
                <textarea name="address" value={form.address} onChange={handleChange} rows="3" placeholder="Pickup or support address" required />
              </label>
            </div>

            {message ? <p className="error-text">{message}</p> : null}
            <button className="btn btn-full btn-primary" type="submit">
              Create account
            </button>
          </form>

          <div className="demo-card">
            <h3>Quick demo note</h3>
            <p>Prefer to explore first? Use the ready-made demo accounts on the sign-in page.</p>
          </div>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
