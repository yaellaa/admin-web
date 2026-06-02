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
          <>
            <div style={{ marginBottom: 24 }}>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 500,
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2B3381'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(43, 51, 129, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <p style={{ marginTop: 12, color: '#6b7280', fontSize: 13, fontWeight: 500 }}>
                Showing {filterUsers(users).length} of {users.length} users
              </p>
            </div>

            {filterUsers(users).length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#9ca3af',
              }}>
                <p style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>{searchQuery ? 'No users match your search.' : 'No users found.'}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
                {filterUsers(users).map((u) => (
                  <div
                    key={u.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 12,
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)'
                      e.currentTarget.style.transform = 'translateY(-4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Profile Header */}
                    <div style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}>
                        {u.profileImage ? (
                          <img
                            src={u.profileImage}
                            alt={u.firstName || 'User'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: '#d1d5db',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#6b7280',
                          }}>
                            {(u.firstName ?? 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937',
                        }}>
                          {editingId === u.id ? (
                            <input
                              value={editedUser.firstName ?? ''}
                              onChange={(e) => setEditedUser((s) => ({ ...s, firstName: e.target.value }))}
                              placeholder="First name"
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: 4,
                                border: '1px solid #e5e7eb',
                                fontSize: 14,
                                marginBottom: 4,
                              }}
                            />
                          ) : (
                            `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'User'
                          )}
                        </h4>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 20,
                          background: (u.admin === 1 || u.admin === '1' || u.admin === true) ? '#fef3c7' : '#dbeafe',
                          color: (u.admin === 1 || u.admin === '1' || u.admin === true) ? '#92400e' : '#1e40af',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}>
                          {u.admin === 1 || u.admin === '1' || u.admin === true ? 'Admin' : 'User'}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '20px', flex: 1 }}>
                      {/* Email */}
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>
                          Email
                        </p>
                        {editingId === u.id ? (
                          <input
                            value={editedUser.email ?? ''}
                            onChange={(e) => setEditedUser((s) => ({ ...s, email: e.target.value }))}
                            placeholder="Email"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: 6,
                              border: '1px solid #e5e7eb',
                              fontSize: 13,
                            }}
                          />
                        ) : (
                          <p style={{ margin: 0, fontSize: '13px', color: '#374151', wordBreak: 'break-all' }}>
                            {u.email ?? '—'}
                          </p>
                        )}
                      </div>

                      {/* Phone */}
                      <div style={{ marginBottom: 16 }}>
                        <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>
                          Contact Number
                        </p>
                        {editingId === u.id ? (
                          <input
                            value={editedUser.contactNum ?? editedUser.phone ?? ''}
                            onChange={(e) => setEditedUser((s) => ({ ...s, contactNum: e.target.value }))}
                            placeholder="Contact"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: 6,
                              border: '1px solid #e5e7eb',
                              fontSize: 13,
                            }}
                          />
                        ) : (
                          <p style={{ margin: 0, fontSize: '13px', color: '#374151', fontFamily: 'monospace' }}>
                            {u.contactNum ?? u.phone ?? '—'}
                          </p>
                        )}
                      </div>

                      {/* User ID */}
                      <div>
                        <p style={{ margin: '0 0 6px 0', fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>
                          User ID
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                          {u.id.substring(0, 16)}...
                        </p>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div style={{
                      padding: '16px 20px',
                      borderTop: '1px solid #f3f4f6',
                      background: '#fafbfc',
                      display: 'flex',
                      gap: 8,
                      flexDirection: 'column',
                    }}>
                      {u.admin === 1 || u.admin === '1' || u.admin === true ? (
                        editingId === u.id ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="save-btn"
                              onClick={() => saveEdit(u.id)}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: 6,
                                border: 'none',
                                background: '#10b981',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
                            >
                              Save
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={cancelEdit}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: 6,
                                border: '1px solid #e5e7eb',
                                background: '#f3f4f6',
                                color: '#6b7280',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e5e7eb'
                                e.currentTarget.style.color = '#1f2937'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f3f4f6'
                                e.currentTarget.style.color = '#6b7280'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="edit-btn"
                            onClick={() => startEdit(u)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: 6,
                              border: '1px solid #3b82f6',
                              background: '#eff6ff',
                              color: '#1e40af',
                              fontWeight: '600',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#3b82f6'
                              e.currentTarget.style.color = '#fff'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#eff6ff'
                              e.currentTarget.style.color = '#1e40af'
                            }}
                          >
                            Edit
                          </button>
                        )
                      ) : (
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(u.id)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: '1px solid #ef4444',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef4444'
                            e.currentTarget.style.color = '#fff'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fef2f2'
                            e.currentTarget.style.color = '#dc2626'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
