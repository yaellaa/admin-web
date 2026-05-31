import { useEffect, useState } from 'react'
import '../styles/Dashboard.css'
import { db } from '../firebase'
import { ref, get, remove, update } from 'firebase/database'

type User = {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  contactNum?: string
  profileImage?: string
  admin?: any
  [key: string]: any
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError('')
      try {
        const usersRef = ref(db, 'Users')
        const snapshot = await get(usersRef)
        if (!snapshot.exists()) {
          setUsers([])
          setLoading(false)
          return
        }

        const list: User[] = []
        snapshot.forEach((child) => {
          list.push({ id: child.key ?? '', ...(child.val() as object) })
        })

        setUsers(list)
      } catch (err) {
        console.error(err)
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this user? This action cannot be undone.')
    if (!ok) return

    try {
      await remove(ref(db, `Users/${id}`))
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      console.error(err)
      setError('Failed to delete user')
    }
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedUser, setEditedUser] = useState<Partial<User>>({})

  const startEdit = (u: User) => {
    setEditingId(u.id)
    setEditedUser({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      contactNum: u.contactNum,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditedUser({})
  }

  const saveEdit = async (id: string) => {
    try {
      const payload: any = {}
      if (editedUser.firstName !== undefined) payload.firstName = editedUser.firstName
      if (editedUser.lastName !== undefined) payload.lastName = editedUser.lastName
      if (editedUser.email !== undefined) payload.email = editedUser.email
      if (editedUser.contactNum !== undefined) payload.contactNum = editedUser.contactNum

      await update(ref(db, `Users/${id}`), payload)

      // update local state
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...payload } : u)))
      setEditingId(null)
      setEditedUser({})
    } catch (err) {
      console.error(err)
      setError('Failed to save changes')
    }
  }

  const filterUsers = (usersToFilter: User[]) => {
    if (!searchQuery.trim()) return usersToFilter
    const query = searchQuery.toLowerCase()
    return usersToFilter.filter(
      (user) =>
        (user.firstName?.toLowerCase().includes(query)) ||
        (user.lastName?.toLowerCase().includes(query)) ||
        (user.email?.toLowerCase().includes(query)) ||
        (user.contactNum?.toLowerCase().includes(query)) ||
        (user.phone?.toLowerCase().includes(query)) ||
        (user.id?.toLowerCase().includes(query))
    )
  }

  return (
    <div className="page-content">
      <div className="content-header">
        <h2>User List</h2>
        <p className="description">All users from the Realtime Database</p>
      </div>

      <div className="content-body">
        {loading && <p>Loading users...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="user-table-wrapper">
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 400,
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
                Showing {filterUsers(users).length} of {users.length} users
              </p>
            </div>

            {filterUsers(users).length === 0 ? (
              <p>{searchQuery ? 'No users match your search.' : 'No users found.'}</p>
            ) : (
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Admin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterUsers(users).map((u) => (
                    <tr key={u.id}>
                      <td>
                        {u.profileImage ? (
                          editingId === u.id ? (
                            <input
                              value={editedUser.firstName ?? ''}
                              onChange={(e) => setEditedUser((s) => ({ ...s, firstName: e.target.value }))}
                              placeholder="First name"
                            />
                          ) : (
                            <img src={u.profileImage} alt={u.firstName} className="avatar" />
                          )
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        {editingId === u.id ? (
                          <>
                            <input
                              value={editedUser.firstName ?? ''}
                              onChange={(e) => setEditedUser((s) => ({ ...s, firstName: e.target.value }))}
                              placeholder="First name"
                            />
                            <input
                              value={editedUser.lastName ?? ''}
                              onChange={(e) => setEditedUser((s) => ({ ...s, lastName: e.target.value }))}
                              placeholder="Last name"
                            />
                          </>
                        ) : (
                          `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—'
                        )}
                      </td>
                      <td>
                        {editingId === u.id ? (
                          <input
                            value={editedUser.email ?? ''}
                            onChange={(e) => setEditedUser((s) => ({ ...s, email: e.target.value }))}
                            placeholder="Email"
                          />
                        ) : (
                          u.email ?? '—'
                        )}
                      </td>
                      <td>
                        {editingId === u.id ? (
                          <input
                            value={editedUser.contactNum ?? editedUser.phone ?? ''}
                            onChange={(e) => setEditedUser((s) => ({ ...s, contactNum: e.target.value }))}
                            placeholder="Contact"
                          />
                        ) : (
                          u.contactNum ?? u.phone ?? '—'
                        )}
                      </td>
                      <td>
                        <span className="admin-badge">
                          {u.admin === 1 || u.admin === '1' || u.admin === true ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>
                        {u.admin === 1 || u.admin === '1' || u.admin === true ? (
                          editingId === u.id ? (
                            <>
                              <button className="save-btn" onClick={() => saveEdit(u.id)}>
                                Save
                              </button>
                              <button className="cancel-btn" onClick={cancelEdit}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button className="edit-btn" onClick={() => startEdit(u)}>
                              Edit
                            </button>
                          )
                        ) : (
                          <button className="delete-btn" onClick={() => handleDelete(u.id)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
