import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AppContext = createContext(null)

const storageKey = 'shareat-platform-state'
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const initialUsers = [
  {
    id: 'u-donor-1',
    name: 'Asha Kumar',
    email: 'donor@shareat.com',
    password: '123456',
    role: 'donor',
    city: 'Bengaluru',
    address: 'House 12, Sector 15',
    verified: true,
  },
  {
    id: 'u-ngo-1',
    name: 'Riya Sharma',
    email: 'ngo@shareat.com',
    password: '123456',
    role: 'ngo',
    organization: 'Riya Foundation',
    city: 'Bengaluru',
    address: '18, Mayur Vihar',
    verified: true,
  },
  {
    id: 'u-admin-1',
    name: 'Meera Iyer',
    email: 'admin@shareat.com',
    password: '123456',
    role: 'admin',
    city: 'Mumbai',
    address: 'Admin Office, Bandra',
    verified: true,
  },
]

const initialDonations = [
  {
    id: 'd-1',
    donorId: 'u-donor-1',
    donorName: 'Asha Kumar',
    category: 'Clothes',
    quantity: 3,
    address: 'House 12, Sector 15',
    city: 'Bengaluru',
    notes: 'Winter jackets and children clothes',
    status: 'Accepted',
    requestedAt: '2026-06-28',
    partnerName: 'Riya Foundation',
  },
  {
    id: 'd-2',
    donorId: 'u-donor-1',
    donorName: 'Asha Kumar',
    category: 'Kitchenware',
    quantity: 5,
    address: 'House 12, Sector 15',
    city: 'Bengaluru',
    notes: 'Mix of utensils and storage containers',
    status: 'Requested',
    requestedAt: '2026-06-30',
    partnerName: null,
  },
  {
    id: 'd-3',
    donorId: 'u-donor-1',
    donorName: 'Asha Kumar',
    category: 'Books',
    quantity: 8,
    address: 'House 12, Sector 15',
    city: 'Bengaluru',
    notes: 'Story books and school reference books',
    status: 'Collected',
    requestedAt: '2026-06-20',
    partnerName: 'Riya Foundation',
  },
]

function readStoredState() {
  if (typeof window === 'undefined') {
    return { users: initialUsers, donations: initialDonations, currentUser: null, token: null, notifications: [], complaints: [] }
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return { users: initialUsers, donations: initialDonations, currentUser: null, token: null, notifications: [], complaints: [] }
    }

    const parsed = JSON.parse(raw)
    return {
      users: parsed.users || initialUsers,
      donations: parsed.donations || initialDonations,
      currentUser: parsed.currentUser || null,
      token: parsed.token || null,
      notifications: parsed.notifications || [],
      complaints: parsed.complaints || [],
    }
  } catch {
    return { users: initialUsers, donations: initialDonations, currentUser: null, token: null, notifications: [], complaints: [] }
  }
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => readStoredState().users)
  const [donations, setDonations] = useState(() => readStoredState().donations)
  const [currentUser, setCurrentUser] = useState(() => readStoredState().currentUser)
  const [token, setToken] = useState(() => readStoredState().token)
  const [notifications, setNotifications] = useState(() => readStoredState().notifications)
  const [complaints, setComplaints] = useState(() => readStoredState().complaints)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify({ users, donations, currentUser, token, notifications, complaints }))
    }
  }, [users, donations, currentUser, token, notifications, complaints])

  useEffect(() => {
    const syncFromServer = async () => {
      if (!token || typeof window === 'undefined') return

      try {
        const [authResponse, donationsResponse, notificationsResponse, complaintsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/donations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/complaints`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (authResponse.ok) {
          const data = await authResponse.json()
          setCurrentUser(data.user)
          setUsers(data.users || [])
        }

        if (donationsResponse.ok) {
          const donationsData = await donationsResponse.json()
          setDonations(donationsData.donations || [])
        }

        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json()
          setNotifications(notificationsData.notifications || [])
        }

        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json()
          setComplaints(complaintsData.complaints || [])
        }
      } catch {
        // keep local state if the backend is unavailable
      }
    }

    syncFromServer()
  }, [token])

  const apiRequest = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }

    return data
  }

  const registerUser = async ({ name, email, password, role, organization = '', city, address }) => {
    try {
      const result = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, organization, city, address }),
      })

      setUsers(result.users || [])
      setCurrentUser(result.user)
      setToken(result.token)
      return { success: true, user: result.user }
    } catch (error) {
      const existing = users.find((user) => user.email.toLowerCase() === email.toLowerCase())
      if (existing) {
        return { success: false, message: 'An account with this email already exists.' }
      }

      const newUser = {
        id: `u-${Math.random().toString(36).slice(2, 8)}`,
        name,
        email,
        password,
        role,
        organization,
        city,
        address,
        verified: role === 'donor' ? true : false,
      }

      setUsers((prev) => [newUser, ...prev])
      setCurrentUser(newUser)
      setToken('local-demo-token')
      return { success: true, user: newUser }
    }
  }

  const loginUser = async (email, password) => {
    try {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      setUsers(result.users || [])
      setCurrentUser(result.user)
      setToken(result.token)
      return { success: true, user: result.user }
    } catch (error) {
      const found = users.find((user) => user.email.toLowerCase() === email.toLowerCase())
      if (!found) {
        return { success: false, message: 'No account found with that email.' }
      }

      if (found.password !== password) {
        return { success: false, message: 'The password you entered is incorrect.' }
      }

      setCurrentUser(found)
      setToken('local-demo-token')
      return { success: true, user: found }
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setToken(null)
  }

  const createDonationRequest = async ({ category, quantity, address, city, notes, pickupDate, pickupTime }) => {
    if (!currentUser) {
      return { success: false, message: 'You need to be signed in to create a request.' }
    }

    try {
      const result = await apiRequest('/api/donations', {
        method: 'POST',
        body: JSON.stringify({ category, quantity, address, city, notes, pickupDate, pickupTime }),
      })

      setDonations(result.donations || [])
      const notification = {
        id: `n-${Math.random().toString(36).slice(2, 8)}`,
        userId: currentUser.id,
        message: 'Your donation request is now live and awaiting partner acceptance.',
        relatedType: 'donation',
        createdAt: new Date().toISOString(),
      }
      setNotifications((prev) => [notification, ...prev])
      return { success: true, donation: result.donation }
    } catch (error) {
      const donation = {
        id: `d-${Math.random().toString(36).slice(2, 8)}`,
        donorId: currentUser.id,
        donorName: currentUser.name,
        category,
        quantity: Number(quantity),
        address,
        city,
        notes,
        pickupDate,
        pickupTime,
        status: 'Requested',
        requestedAt: new Date().toISOString().slice(0, 10),
        partnerName: null,
      }

      setDonations((prev) => [donation, ...prev])
      setNotifications((prev) => [{ id: `n-${Math.random().toString(36).slice(2, 8)}`, userId: currentUser.id, message: 'Your donation request is now live and awaiting partner acceptance.', relatedType: 'donation', createdAt: new Date().toISOString() }, ...prev])
      return { success: true, donation }
    }
  }

  const acceptDonation = async (donationId) => {
    try {
      const result = await apiRequest(`/api/donations/${donationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Accepted' }),
      })

      setDonations(result.donations || [])
      setNotifications((prev) => [{ id: `n-${Math.random().toString(36).slice(2, 8)}`, userId: currentUser?.id, message: 'You accepted a donation request and it is now in the collection queue.', relatedType: 'donation', createdAt: new Date().toISOString() }, ...prev])
    } catch {
      setDonations((prev) => prev.map((donation) => {
        if (donation.id !== donationId) return donation
        return {
          ...donation,
          status: 'Accepted',
          partnerName: currentUser?.organization || currentUser?.name,
        }
      }))
    }
  }

  const updateDonationStatus = async (donationId, status) => {
    try {
      const result = await apiRequest(`/api/donations/${donationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })

      setDonations(result.donations || [])
      const donation = donations.find((entry) => entry.id === donationId)
      const message = status === 'Collected'
        ? 'A donation was marked as collected.'
        : status === 'Distributed'
          ? 'A donation was marked as distributed.'
          : 'A donation status was updated.'
      if (donation) {
        setNotifications((prev) => [{ id: `n-${Math.random().toString(36).slice(2, 8)}`, userId: currentUser?.id, message, relatedType: 'donation', createdAt: new Date().toISOString() }, ...prev])
      }
    } catch {
      setDonations((prev) => prev.map((donation) => {
        if (donation.id !== donationId) return donation
        return { ...donation, status }
      }))
    }
  }

  const toggleUserVerification = async (userId) => {
    try {
      const result = await apiRequest(`/api/users/${userId}/verify`, {
        method: 'PATCH',
      })

      setUsers(result.users || [])
    } catch {
      setUsers((prev) => prev.map((user) => (
        user.id === userId ? { ...user, verified: !user.verified } : user
      )))
    }
  }

  const createComplaint = async ({ subject, description }) => {
    if (!currentUser) {
      return { success: false, message: 'You need to be signed in to report an issue.' }
    }

    try {
      const result = await apiRequest('/api/complaints', {
        method: 'POST',
        body: JSON.stringify({ userName: currentUser.name, subject, description }),
      })

      setComplaints(result.complaints || [])
      return { success: true, complaint: result.complaint }
    } catch {
      const complaint = {
        id: `c-${Math.random().toString(36).slice(2, 8)}`,
        userId: currentUser.id,
        userName: currentUser.name,
        subject,
        description,
        status: 'Open',
        createdAt: new Date().toISOString(),
      }

      setComplaints((prev) => [complaint, ...prev])
      setNotifications((prev) => [{ id: `n-${Math.random().toString(36).slice(2, 8)}`, userId: currentUser.id, message: 'Your issue report was saved and sent for review.', relatedType: 'complaint', createdAt: new Date().toISOString() }, ...prev])
      return { success: true, complaint }
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const stats = useMemo(() => {
    const total = donations.length
    const pending = donations.filter((donation) => donation.status === 'Requested').length
    const accepted = donations.filter((donation) => donation.status === 'Accepted').length
    const collected = donations.filter((donation) => donation.status === 'Collected').length
    const verifiedPartners = users.filter((user) => user.role === 'ngo' && user.verified).length

    return { total, pending, accepted, collected, verifiedPartners }
  }, [donations, users])

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        donations,
        stats,
        registerUser,
        loginUser,
        logout,
        createDonationRequest,
        acceptDonation,
        updateDonationStatus,
        toggleUserVerification,
        notifications,
        complaints,
        createComplaint,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used inside AppProvider')
  return context
}
