import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page-shell auth-page">
      <div className="auth-card">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The route you requested could not be located. Return to the home page and continue exploring.</p>
        <Link className="btn" to="/">
          Go home
        </Link>
      </div>
    </div>
  )
}
