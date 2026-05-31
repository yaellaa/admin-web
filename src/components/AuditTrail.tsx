import { useEffect, useState } from 'react'
import '../styles/Dashboard.css'
import { db } from '../firebase'
import { ref, get } from 'firebase/database'

type AuditEntry = {
  id: string
  userId?: string
  userName?: string
  action?: string
  details?: string
  timestamp?: number
  isAdmin?: boolean
  [key: string]: any
}

export default function AuditTrail() {
  const [tab, setTab] = useState<'user' | 'admin'>('user')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userLogs, setUserLogs] = useState<AuditEntry[]>([])
  const [adminLogs, setAdminLogs] = useState<AuditEntry[]>([])
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError('')
      try {
        // load all users once to build an admin map
        const usersSnap = await get(ref(db, 'Users'))
        const usersMap: Record<string, any> = {}
        if (usersSnap.exists()) {
          usersSnap.forEach((c) => {
            usersMap[c.key ?? ''] = c.val()
          })
        }

        const currentUserId = localStorage.getItem('userId') ?? ''
        const curUser = usersMap[currentUserId]
        setCurrentUserIsAdmin(
          !!curUser && (curUser.admin === 1 || curUser.admin === '1' || curUser.admin === true)
        )

        // fetch audit_trail
        const auditSnap = await get(ref(db, 'audit_trail'))
        const userList: AuditEntry[] = []
        const adminList: AuditEntry[] = []

        if (auditSnap.exists()) {
          auditSnap.forEach((c) => {
            const val = c.val() as any
            // determine timestamp (prefer dateTime if present). Normalize to milliseconds.
            let ts = 0
            if (val.dateTime) {
              // try parsing ISO string
              const parsed = Date.parse(val.dateTime)
              if (!isNaN(parsed)) ts = parsed
              else {
                const n = parseInt(val.dateTime)
                if (!isNaN(n)) ts = n < 1e12 ? n * 1000 : n
              }
            } else if (val.timestamp !== undefined && val.timestamp !== null) {
              if (typeof val.timestamp === 'number') {
                ts = val.timestamp
              } else {
                const n = parseInt(val.timestamp)
                if (!isNaN(n)) ts = n
              }
              // convert seconds -> ms if needed
              if (ts > 0 && ts < 1e12) ts = ts * 1000
            }

            const entry: AuditEntry = {
              id: c.key ?? '',
              userId: val.userId ?? val.uid ?? val.user ?? null,
              userName: val.userName ?? val.name ?? val.email ?? '',
              action: val.action ?? val.type ?? JSON.stringify(val),
              details: val.notes ?? val.details ?? val.message ?? '',
              timestamp: ts,
              isAdmin: false,
              ...val,
            }

            // classify: prefer explicit flags in entry, else consult usersMap
            if (val.isAdmin === true || val.admin === 1 || val.admin === '1' || val.role === 'admin') {
              entry.isAdmin = true
            } else if (entry.userId && usersMap[entry.userId]) {
              const u = usersMap[entry.userId]
              entry.isAdmin = u && (u.admin === 1 || u.admin === '1' || u.admin === true)
            }

            if (entry.isAdmin) adminList.push(entry)
            else userList.push(entry)
          })
        }

        // sort newest first by timestamp
        const sortDesc = (a: AuditEntry, b: AuditEntry) => (b.timestamp || 0) - (a.timestamp || 0)
        setAdminLogs(adminList.sort(sortDesc))
        setUserLogs(userList.sort(sortDesc))
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to load audit trail')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  const filterLogs = (logs: AuditEntry[]) => {
    if (!searchQuery.trim()) return logs
    const query = searchQuery.toLowerCase()
    return logs.filter(
      (log) =>
        (log.userName?.toLowerCase().includes(query)) ||
        (log.userId?.toLowerCase().includes(query)) ||
        (log.action?.toLowerCase().includes(query)) ||
        (log.details?.toLowerCase().includes(query))
    )
  }

  return (
    <div className="page-content">
      <div className="content-header">
        <h2>Audit Trail</h2>
        <p className="description">View user and admin activity logs.</p>
      </div>

      <div className="content-body">
        {loading && <p>Loading audit trail...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
              <button
                className={`tab-btn ${tab === 'user' ? 'tab-btn-active' : ''}`}
                onClick={() => setTab('user')}
              >
                User Logs ({filterLogs(userLogs).length})
              </button>

              {currentUserIsAdmin && (
                <button
                  className={`tab-btn ${tab === 'admin' ? 'tab-btn-active' : ''}`}
                  onClick={() => setTab('admin')}
                >
                  Admin Logs ({filterLogs(adminLogs).length})
                </button>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <input
                type="text"
                placeholder="Search by user, action, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="audit-search-input"
              />
            </div>

            <div className="audit-trail-container">

            {tab === 'user' && (
              <>
                {filterLogs(userLogs).length === 0 ? (
                  <div className="empty-state">
                    <p>{searchQuery ? 'No results found.' : 'No user logs found.'}</p>
                  </div>
                ) : (
                  <div className="audit-table-wrapper">
                    <table className="audit-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>User</th>
                          <th>Action</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterLogs(userLogs).map((e) => (
                          <tr key={e.id} className="audit-row">
                            <td className="time-cell">{new Date(e.timestamp || 0).toLocaleString()}</td>
                            <td className="user-cell"><span className="badge">{e.userName || e.userId || '—'}</span></td>
                            <td className="action-cell">{e.action}</td>
                            <td className="details-cell">{e.details || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {tab === 'admin' && currentUserIsAdmin && (
              <>
                {filterLogs(adminLogs).length === 0 ? (
                  <div className="empty-state">
                    <p>{searchQuery ? 'No results found.' : 'No admin logs found.'}</p>
                  </div>
                ) : (
                  <div className="audit-table-wrapper">
                    <table className="audit-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Admin</th>
                          <th>Action</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterLogs(adminLogs).map((e) => (
                          <tr key={e.id} className="audit-row">
                            <td className="time-cell">{new Date(e.timestamp || 0).toLocaleString()}</td>
                            <td className="admin-cell"><span className="admin-badge-small">{e.userName || e.userId || '—'}</span></td>
                            <td className="action-cell">{e.action}</td>
                            <td className="details-cell">{e.details || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
            </div>

            {!currentUserIsAdmin && (
              <p className="admin-disclaimer">Admin logs are hidden — admin privileges required.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
