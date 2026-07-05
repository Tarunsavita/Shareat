import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'data', 'db.json')
const jwtSecret = process.env.JWT_SECRET || 'shareat-dev-secret'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

let dbCache = null

function normalizeDatabase(db) {
  return {
    ...db,
    users: db.users || [],
    donations: db.donations || [],
    notifications: db.notifications || [],
    complaints: db.complaints || [],
  }
}

function addNotification(db, userId, message, relatedType = 'system', relatedId = null) {
  const notification = {
    id: `n-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    message,
    relatedType,
    relatedId,
    createdAt: new Date().toISOString(),
  }

  db.notifications.unshift(notification)
  return notification
}

const initialSeed = {
  users: [
    {
      id: 'u-donor-1',
      name: 'Asha Kumar',
      email: 'donor@shareat.com',
      password: bcrypt.hashSync('123456', 10),
      role: 'donor',
      city: 'Bengaluru',
      address: 'House 12, Sector 15',
      verified: true,
    },
    {
      id: 'u-ngo-1',
      name: 'Riya Sharma',
      email: 'ngo@shareat.com',
      password: bcrypt.hashSync('123456', 10),
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
      password: bcrypt.hashSync('123456', 10),
      role: 'admin',
      city: 'Mumbai',
      address: 'Admin Office, Bandra',
      verified: true,
    },
  ],
  donations: [
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
  ],
  notifications: [],
  complaints: [],
}

async function ensureDatabase() {
  try {
    await fs.access(dbPath)
    const raw = await fs.readFile(dbPath, 'utf8')
    if (!raw.trim()) {
      throw new Error('empty db')
    }
    dbCache = normalizeDatabase(JSON.parse(raw))
  } catch {
    dbCache = normalizeDatabase(initialSeed)
    await fs.mkdir(path.dirname(dbPath), { recursive: true })
    await fs.writeFile(dbPath, JSON.stringify(dbCache, null, 2))
  }
}

async function saveDatabase() {
  await fs.mkdir(path.dirname(dbPath), { recursive: true })
  await fs.writeFile(dbPath, JSON.stringify(dbCache, null, 2))
}

async function getDatabase() {
  if (!dbCache) {
    await ensureDatabase()
  }
  return dbCache
}

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: '7d' })
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  try {
    const payload = jwt.verify(token, jwtSecret)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Shareat backend is running.' })
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, organization = '', city, address } = req.body
    if (!name || !email || !password || !city || !address) {
      return res.status(400).json({ message: 'Please fill in all required fields.' })
    }

    const db = await getDatabase()
    const existing = db.users.find((user) => user.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const newUser = {
      id: `u-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      role,
      organization,
      city,
      address,
      verified: role === 'donor' ? true : false,
    }

    db.users.unshift(newUser)
    await saveDatabase()

    const token = createToken(newUser)
    res.status(201).json({ user: newUser, token, users: db.users })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to register user.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const db = await getDatabase()
    const user = db.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase())

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = createToken(user)
    res.json({ user, token, users: db.users })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to login.' })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase()
    const user = db.users.find((entry) => entry.id === req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    res.json({ user, users: db.users })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to load account.' })
  }
})

app.get('/api/donations', authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase()
    res.json({ donations: db.donations })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to load donations.' })
  }
})

app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase()
    const notifications = db.notifications.filter((entry) => entry.userId === req.user.id)
    res.json({ notifications })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to load notifications.' })
  }
})

app.get('/api/complaints', authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase()
    res.json({ complaints: db.complaints })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to load complaints.' })
  }
})

app.post('/api/donations', authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase()
    const user = db.users.find((entry) => entry.id === req.user.id)

    const donation = {
      id: `d-${Math.random().toString(36).slice(2, 8)}`,
      donorId: user.id,
      donorName: user.name,
      category: req.body.category,
      quantity: Number(req.body.quantity || 1),
      address: req.body.address || user.address,
      city: req.body.city || user.city,
      notes: req.body.notes || '',
      pickupDate: req.body.pickupDate || '',
      pickupTime: req.body.pickupTime || '',
      status: 'Requested',
      requestedAt: new Date().toISOString().slice(0, 10),
      partnerName: null,
    }

    db.donations.unshift(donation)
    addNotification(db, user.id, 'Your donation request is now live and awaiting partner acceptance.', 'donation', donation.id)
    await saveDatabase()
    res.status(201).json({ donation, donations: db.donations })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to create donation request.' })
  }
})

app.patch('/api/donations/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase()
    const donation = db.donations.find((entry) => entry.id === req.params.id)
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found.' })
    }

    const user = db.users.find((entry) => entry.id === req.user.id)
    if (req.body.status === 'Accepted') {
      donation.status = 'Accepted'
      donation.partnerName = user?.organization || user?.name || donation.partnerName
      addNotification(db, donation.donorId, `Your donation request for ${donation.category} was accepted by ${user?.organization || user?.name}.`, 'donation', donation.id)
      addNotification(db, user.id, `You accepted the donation request for ${donation.category}.`, 'donation', donation.id)
    } else if (req.body.status) {
      donation.status = req.body.status
      if (req.body.status === 'Collected') {
        addNotification(db, donation.donorId, `Your donation request for ${donation.category} was marked as collected.`, 'donation', donation.id)
      } else if (req.body.status === 'Distributed') {
        addNotification(db, donation.donorId, `Your donation request for ${donation.category} was marked as distributed.`, 'donation', donation.id)
      }
    }

    await saveDatabase()
    res.json({ donation, donations: db.donations })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update donation.' })
  }
})

app.patch('/api/users/:id/verify', authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase()
    const currentUser = db.users.find((entry) => entry.id === req.user.id)
    if (currentUser?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can verify partners.' })
    }

    const target = db.users.find((entry) => entry.id === req.params.id)
    if (!target) {
      return res.status(404).json({ message: 'User not found.' })
    }

    target.verified = !target.verified
    addNotification(db, target.id, target.verified ? 'Your account has been verified by the admin team.' : 'Your verification status was updated.', 'verification', target.id)
    await saveDatabase()
    res.json({ user: target, users: db.users })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update verification.' })
  }
})

app.post('/api/complaints', authMiddleware, async (req, res) => {
  try {
    const db = await getDatabase()
    const complaint = {
      id: `c-${Math.random().toString(36).slice(2, 8)}`,
      userId: req.user.id,
      userName: req.body.userName || 'User',
      subject: req.body.subject || 'Issue reported',
      description: req.body.description || '',
      status: 'Open',
      createdAt: new Date().toISOString(),
    }

    db.complaints.unshift(complaint)
    addNotification(db, req.user.id, 'Your issue report was submitted successfully. An admin will review it shortly.', 'complaint', complaint.id)
    const adminUsers = db.users.filter((entry) => entry.role === 'admin')
    adminUsers.forEach((admin) => {
      addNotification(db, admin.id, `New issue reported: ${complaint.subject}`, 'complaint', complaint.id)
    })

    await saveDatabase()
    res.status(201).json({ complaint, complaints: db.complaints })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to submit complaint.' })
  }
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Shareat backend listening on http://localhost:${port}`)
})
