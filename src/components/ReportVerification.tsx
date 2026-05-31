import { useEffect, useState } from 'react'
import '../styles/Dashboard.css'
import { db } from '../firebase'
import { get, ref, update } from 'firebase/database'

type ReportItem = {
  id: string
  status?: 'submitted' | 'pending' | 'success' | 'failed'
  [key: string]: any
}

export default function ReportVerification() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedScanResult, setSelectedScanResult] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const formatJson = (value: any) => {
    if (value == null) return '—'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return JSON.stringify(parsed, null, 2)
      } catch {
        return value
      }
    }

    return String(value)
  }

  const updateReportStatus = async (reportId: string, newStatus: 'submitted' | 'pending' | 'success' | 'failed') => {
    try {
      setUpdatingStatus(reportId)
      await update(ref(db, `Report/${reportId}`), { status: newStatus })
      
      // Update local state
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      )
    } catch (err) {
      console.error('Failed to update status:', err)
      setError('Failed to update report status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'submitted':
        return '#2B3381' // dark blue-purple
      case 'pending':
        return '#ff9500' // orange
      case 'success':
        return '#00b371' // green
      case 'failed':
        return '#ff6b6b' // red
      default:
        return '#6b7280' // gray
    }
  }

  const filterReports = (reportsToFilter: ReportItem[]) => {
    if (!searchQuery.trim()) return reportsToFilter
    const query = searchQuery.toLowerCase()
    return reportsToFilter.filter(
      (report) =>
        (report.category?.toLowerCase().includes(query)) ||
        (report.description?.toLowerCase().includes(query)) ||
        (report.location?.toLowerCase().includes(query)) ||
        (report.id?.toLowerCase().includes(query)) ||
        (report.userId?.toLowerCase().includes(query))
    )
  }

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      setError('')
      try {
        const snapshot = await get(ref(db, 'Report'))
        if (!snapshot.exists()) {
          setReports([])
          return
        }

        const list: ReportItem[] = []
        snapshot.forEach((child) => {
          const reportData = child.val() as object
          list.push({ 
            id: child.key ?? '', 
            status: (reportData as any).status || 'submitted',
            ...reportData
          })
        })

        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        setReports(list)
      } catch (err) {
        console.error(err)
        setError('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  return (
    <div className="page-content">
      <div className="content-header">
        <h2>Report Verification</h2>
        <p className="description">All reports fetched from the Realtime Database.</p>
      </div>

      <div className="content-body">
        {loading && <p>Loading reports...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Search by category, description, location, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: 500,
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ marginTop: 8, color: '#666', fontSize: 13 }}>
                Showing {filterReports(reports).length} of {reports.length} reports
              </p>
            </div>

            {filterReports(reports).length === 0 ? (
              <p>{searchQuery ? 'No reports match your search.' : 'No reports found.'}</p>
            ) : (
              filterReports(reports).map((report) => (
                <div className="card" key={report.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3>{report.category || 'Report'}</h3>
                      <p><strong>Report ID:</strong> {report.id}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: 14, color: '#666' }}>Status</strong>
                      <div style={{ marginTop: 8 }}>
                        <select
                          value={report.status || 'submitted'}
                          onChange={(e) => updateReportStatus(report.id, e.target.value as any)}
                          disabled={updatingStatus === report.id}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 4,
                            border: '2px solid #e5e7eb',
                            backgroundColor: '#fff',
                            color: getStatusColor(report.status),
                            fontWeight: 'bold',
                            cursor: updatingStatus === report.id ? 'not-allowed' : 'pointer',
                            opacity: updatingStatus === report.id ? 0.6 : 1,
                          }}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="pending">Pending</option>
                          <option value="success">Success</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <p><strong>Description:</strong> {report.description || '—'}</p>
                  <p><strong>Location:</strong> {report.location || '—'}</p>
                  <p><strong>Address Precision:</strong> {report.addressPrecision || '—'}</p>
                  <p><strong>Latitude:</strong> {report.latitude ?? '—'}</p>
                  <p><strong>Longitude:</strong> {report.longitude ?? '—'}</p>
                  <p><strong>Upvotes:</strong> {report.upvotes ?? 0}</p>
                  <p><strong>Downvotes:</strong> {report.downvotes ?? 0}</p>
                  <p><strong>User ID:</strong> {report.userId || '—'}</p>
                  <p><strong>Timestamp:</strong> {report.timestamp ? new Date(report.timestamp).toLocaleString() : '—'}</p>

                  {report.imageUrl && (
                    <div style={{ marginTop: 12 }}>
                      <strong>Image:</strong>
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={report.imageUrl}
                          alt={report.category || 'Report image'}
                          onClick={() => setSelectedImage(report.imageUrl)}
                          style={{ 
                            maxWidth: '100%', 
                            borderRadius: 8, 
                            maxHeight: 360, 
                            objectFit: 'cover',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      </div>
                    </div>
                  )}

                  {report.scanResults && (
                    <div style={{ marginTop: 12 }}>
                      <strong>Scan Results:</strong>
                      <div style={{ marginTop: 8 }}>
                        <button
                          className="edit-btn"
                          onClick={() => setSelectedScanResult(report.scanResults)}
                        >
                          View full result
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 12 }}>
                    <strong>All Details:</strong>
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      {Object.entries(report)
                        .filter(([key]) => key !== 'id' && key !== 'scanResults' && key !== 'status')
                        .map(([key, value]) => (
                          <li key={key} style={{ marginBottom: 8 }}>
                            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {selectedScanResult !== null && (
          <div
            onClick={() => setSelectedScanResult(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(900px, 100%)',
                maxHeight: '90vh',
                overflow: 'auto',
                background: '#fff',
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Full Scan Result</h3>
                <button className="cancel-btn" onClick={() => setSelectedScanResult(null)}>
                  Close
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {formatJson(selectedScanResult)}
              </pre>
            </div>
          </div>
        )}

        {selectedImage !== null && (
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
              padding: 20,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <img
                src={selectedImage}
                alt="Full size preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
