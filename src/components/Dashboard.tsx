import { useEffect, useState } from 'react'
import '../styles/Dashboard.css'
import { db } from '../firebase'
import { ref, get } from 'firebase/database'
import ReportMap from './ReportMap'
import StatusDistributionPie from './StatusDistributionPie'

interface DashboardStats {
  totalReports: number
  submittedReports: number
  pendingReports: number
  resolvedReports: number
  dismissedReports: number
  totalUsers: number
  adminUsers: number
  regularUsers: number
  recentReports: any[]
  recentLogs: any[]
  mapReports: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    submittedReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    dismissedReports: 0,
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    recentReports: [],
    recentLogs: [],
    mapReports: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError('')
      try {
        // Fetch Reports
        const reportsSnapshot = await get(ref(db, 'Report'))
        let totalReports = 0
        let submittedReports = 0
        let pendingReports = 0
        let resolvedReports = 0
        let dismissedReports = 0
        const recentReportsList: any[] = []
        const mapReportsList: any[] = []

        if (reportsSnapshot.exists()) {
          const reports = reportsSnapshot.val()
          Object.entries(reports).forEach(([key, report]: [string, any]) => {
            totalReports++
            const status = report.status || 'submitted'
            if (status === 'submitted') submittedReports++
            else if (status === 'pending') pendingReports++
            else if (status === 'resolved') resolvedReports++
            else if (status === 'dismissed') dismissedReports++

            const reportData = {
              id: key,
              category: report.category,
              status: status,
              timestamp: report.timestamp,
              location: report.location,
              latitude: report.latitude,
              longitude: report.longitude,
            }

            recentReportsList.push(reportData)
            mapReportsList.push(reportData)
          })
        }

        // Sort by timestamp and get last 5
        recentReportsList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        const recent5Reports = recentReportsList.slice(0, 5)

        // Fetch Users
        const usersSnapshot = await get(ref(db, 'Users'))
        let totalUsers = 0
        let adminUsers = 0
        let regularUsers = 0

        if (usersSnapshot.exists()) {
          const users = usersSnapshot.val()
          Object.entries(users).forEach(([_, user]: [string, any]) => {
            totalUsers++
            if (user.admin === 1 || user.admin === '1' || user.admin === true) {
              adminUsers++
            } else {
              regularUsers++
            }
          })
        }

        // Fetch Audit Trail
        const auditSnapshot = await get(ref(db, 'audit_trail'))
        const recentLogsList: any[] = []

        if (auditSnapshot.exists()) {
          const logs = auditSnapshot.val()
          Object.entries(logs).forEach(([_, log]: [string, any]) => {
            recentLogsList.push({
              userName: log.userName || log.name || log.email || 'Unknown',
              action: log.action || log.type || 'Unknown',
              timestamp: log.timestamp || log.dateTime,
            })
          })
        }

        // Sort by timestamp and get last 5
        recentLogsList.sort((a, b) => {
          const aTime = typeof a.timestamp === 'string' ? Date.parse(a.timestamp) : a.timestamp || 0
          const bTime = typeof b.timestamp === 'string' ? Date.parse(b.timestamp) : b.timestamp || 0
          return bTime - aTime
        })
        const recent5Logs = recentLogsList.slice(0, 5)

        setStats({
          totalReports,
          submittedReports,
          pendingReports,
          resolvedReports,
          dismissedReports,
          totalUsers,
          adminUsers,
          regularUsers,
          recentReports: recent5Reports,
          recentLogs: recent5Logs,
          mapReports: mapReportsList,
        })
      } catch (err) {
        console.error(err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return '#2B3381'
      case 'pending':
        return '#ff9500'
      case 'resolved':
        return '#00b371'
      case 'dismissed':
        return '#ff6b6b'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="page-content">
      <div className="content-header">
        <h2>Dashboard</h2>
        <p className="description">Overview of your BacoorConnect platform</p>
      </div>

      <div className="content-body">
        {loading && <p>Loading dashboard data...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            {/* Reports Section */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3>Report Analytics</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
                <div
                  className="stat-card"
                  style={{
                    background: 'linear-gradient(135deg, #2B3381 0%, #4a5aa8 100%)',
                    color: 'white',
                  }}
                >
                  <h4>Total Reports</h4>
                  <p className="stat-number">{stats.totalReports}</p>
                </div>

                <div
                  className="stat-card"
                  style={{
                    background: 'linear-gradient(135deg, #4a5aa8 0%, #2B3381 100%)',
                    color: 'white',
                  }}
                >
                  <h4>Submitted</h4>
                  <p className="stat-number">{stats.submittedReports}</p>
                </div>

                <div
                  className="stat-card"
                  style={{
                    background: 'linear-gradient(135deg, #ff9500 0%, #ff8c00 100%)',
                    color: 'white',
                  }}
                >
                  <h4>Pending</h4>
                  <p className="stat-number">{stats.pendingReports}</p>
                </div>

                <div
                  className="stat-card"
                  style={{
                    background: 'linear-gradient(135deg, #00d084 0%, #00a062 100%)',
                    color: 'white',
                  }}
                >
                  <h4>Resolved</h4>
                  <p className="stat-number">{stats.resolvedReports}</p>
                </div>

                <div
                  className="stat-card"
                  style={{
                    background: 'linear-gradient(135deg, #ff7575 0%, #ff4444 100%)',
                    color: 'white',
                  }}
                >
                  <h4>Dismissed</h4>
                  <p className="stat-number">{stats.dismissedReports}</p>
                </div>
              </div>

              {/* Status Distribution */}
              <div style={{ marginTop: 24 }}>
                <h4 style={{ marginBottom: 16 }}>Status Distribution</h4>
                <div style={{ background: '#1e1f43', padding: 24, borderRadius: 8, display: 'inline-block', width: '100%', maxWidth: 650 }}>
                  <StatusDistributionPie
                    submitted={stats.submittedReports}
                    pending={stats.pendingReports}
                    resolved={stats.resolvedReports}
                    dismissed={stats.dismissedReports}
                  />
                </div>
              </div>
            </div>

            {/* Report Locations Map */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3>Report Locations</h3>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
                Interactive map showing the geographic distribution of reports
              </p>
              <ReportMap reports={stats.mapReports} />
            </div>

            {/* Users Section */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3>User Analytics</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
                <div
                  className="stat-card"
                  style={{
                    background: 'linear-gradient(135deg, #2B3381 0%, #4a5aa8 100%)',
                    color: 'white',
                  }}
                >
                  <h4>Total Users</h4>
                  <p className="stat-number">{stats.totalUsers}</p>
                </div>

                <div
                  className="stat-card"
                  style={{
                    background: 'linear-gradient(135deg, #5a6bb8 0%, #3d4590 100%)',
                    color: 'white',
                  }}
                >
                  <h4>Admin Users</h4>
                  <p className="stat-number">{stats.adminUsers}</p>
                </div>

                <div
                  className="stat-card"
                  style={{
                    background: 'linear-gradient(135deg, #00d4e8 0%, #00a8c4 100%)',
                    color: 'white',
                  }}
                >
                  <h4>Regular Users</h4>
                  <p className="stat-number">{stats.regularUsers}</p>
                </div>
              </div>

              {/* User Distribution */}
              <div style={{ marginTop: 24, background: '#f9fafb', padding: 16, borderRadius: 8 }}>
                <h4 style={{ marginBottom: 12 }}>User Type Distribution</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  {stats.totalUsers > 0 && (
                    <>
                      <div
                        style={{
                          flex: `${(stats.adminUsers / stats.totalUsers) * 100}%`,
                          minWidth: '40px',
                          height: 30,
                          background: '#5a6bb8',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        {stats.adminUsers > 0 && `${Math.round((stats.adminUsers / stats.totalUsers) * 100)}%`}
                      </div>
                      <div
                        style={{
                          flex: `${(stats.regularUsers / stats.totalUsers) * 100}%`,
                          minWidth: '40px',
                          height: 30,
                          background: '#00d4e8',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        {stats.regularUsers > 0 && `${Math.round((stats.regularUsers / stats.totalUsers) * 100)}%`}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Reports Section */}
            {stats.recentReports.length > 0 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <h3>Recent Reports</h3>
                <table className="user-table" style={{ marginTop: 16 }}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.category || 'Unknown'}</td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: 12,
                              backgroundColor: getStatusColor(report.status),
                              color: 'white',
                              fontSize: 12,
                              fontWeight: 'bold',
                            }}
                          >
                            {report.status || 'submitted'}
                          </span>
                        </td>
                        <td>{report.timestamp ? new Date(report.timestamp).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Recent Activity Section */}
            {stats.recentLogs.length > 0 && (
              <div className="card">
                <h3>Recent Activity</h3>
                <table className="user-table" style={{ marginTop: 16 }}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Action</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentLogs.map((log, index) => (
                      <tr key={index}>
                        <td>{log.userName}</td>
                        <td>{log.action}</td>
                        <td>
                          {log.timestamp
                            ? typeof log.timestamp === 'string'
                              ? new Date(log.timestamp).toLocaleString()
                              : new Date(log.timestamp).toLocaleString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
