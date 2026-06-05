import { useEffect, useState } from 'react'
import '../styles/Dashboard.css'
import { db } from '../firebase'
import { get, ref, update } from 'firebase/database'

type ReportItem = {
  id: string
  status?: 'submitted' | 'pending' | 'resolved' | 'dismissed'
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

  const updateReportStatus = async (reportId: string, newStatus: 'submitted' | 'pending' | 'resolved' | 'dismissed') => {
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
      case 'resolved':
        return '#00b371' // green
      case 'dismissed':
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
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9ca3af',
              }}>
                <p style={{ fontSize: 16 }}>{searchQuery ? 'No reports match your search.' : 'No reports found.'}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
                {filterReports(reports).map((report) => (
                  <div 
                    key={report.id} 
                    style={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 12,
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
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
                    {/* Header with category and status badge */}
                    <div style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}>
                      <div>
                        <h4 style={{
                          margin: 0,
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1f2937',
                          textTransform: 'capitalize',
                          marginBottom: 4,
                        }}>
                          {report.category || 'Report'}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#6b7280',
                          fontFamily: 'monospace',
                        }}>
                          {report.id.substring(0, 12)}...
                        </p>
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: 20,
                        background: getStatusColor(report.status),
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}>
                        {report.status || 'Submitted'}
                      </div>
                    </div>

                    {/* Main content */}
                    <div style={{ padding: '20px', flex: 1 }}>
                      {/* Description */}
                      {report.description && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Description
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.4 }}>
                            {report.description}
                          </p>
                        </div>
                      )}

                      {/* Location info grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        {report.location && (
                          <div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>
                              Location
                            </p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                              {report.location}
                            </p>
                          </div>
                        )}
                        {report.addressPrecision && (
                          <div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>
                              Precision
                            </p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                              {report.addressPrecision}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Coordinates */}
                      {(report.latitude || report.longitude) && (
                        <div style={{
                          padding: 12,
                          background: '#f9fafb',
                          borderRadius: 8,
                          marginBottom: 16,
                          border: '1px solid #e5e7eb',
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                            Coordinates
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div>
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>Latitude</span>
                              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#374151', fontFamily: 'monospace' }}>
                                {report.latitude ?? '—'}
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: '11px', color: '#9ca3af' }}>Longitude</span>
                              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#374151', fontFamily: 'monospace' }}>
                                {report.longitude ?? '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Engagement stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div style={{
                          padding: 12,
                          background: '#f0fdf4',
                          borderRadius: 8,
                          border: '1px solid #dcfce7',
                        }}>
                          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Upvotes</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#16a34a' }}>
                            {report.upvotes ?? 0}
                          </p>
                        </div>
                        <div style={{
                          padding: 12,
                          background: '#fef2f2',
                          borderRadius: 8,
                          border: '1px solid #fee2e2',
                        }}>
                          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Downvotes</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#dc2626' }}>
                            {report.downvotes ?? 0}
                          </p>
                        </div>
                      </div>

                      {/* Timestamp */}
                      {report.timestamp && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>
                            Submitted
                          </p>
                          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                            {new Date(report.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* User ID */}
                      {report.userId && (
                        <div style={{
                          padding: 8,
                          background: '#eff6ff',
                          borderRadius: 6,
                          border: '1px solid #bfdbfe',
                          marginBottom: 16,
                        }}>
                          <p style={{ margin: 0, fontSize: '11px', color: '#1e40af', fontWeight: '600' }}>
                            User: <span style={{ fontFamily: 'monospace' }}>{report.userId.substring(0, 16)}...</span>
                          </p>
                        </div>
                      )}

                      {/* Image */}
                      {report.imageUrl && (
                        <div style={{ marginBottom: 16 }}>
                          <img
                            src={report.imageUrl}
                            alt={report.category || 'Report image'}
                            onClick={() => setSelectedImage(report.imageUrl)}
                            style={{
                              width: '100%',
                              height: 200,
                              objectFit: 'cover',
                              borderRadius: 8,
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease, filter 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)'
                              e.currentTarget.style.filter = 'brightness(0.9)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)'
                              e.currentTarget.style.filter = 'brightness(1)'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions footer */}
                    <div style={{
                      padding: '16px 20px',
                      borderTop: '1px solid #f3f4f6',
                      background: '#fafbfc',
                      display: 'flex',
                      gap: 8,
                      flexDirection: 'column',
                    }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: 8 }}>
                          Update Status
                        </label>
                        <select
                          value={report.status || 'submitted'}
                          onChange={(e) => updateReportStatus(report.id, e.target.value as any)}
                          disabled={updatingStatus === report.id}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: `2px solid ${getStatusColor(report.status)}`,
                            backgroundColor: '#fff',
                            color: getStatusColor(report.status),
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: updatingStatus === report.id ? 'not-allowed' : 'pointer',
                            opacity: updatingStatus === report.id ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="pending">Pending</option>
                          <option value="resolved">Resolved</option>
                          <option value="dismissed">Dismissed</option>
                        </select>
                      </div>

                      {report.scanResults && (
                        <button
                          className="edit-btn"
                          onClick={() => setSelectedScanResult(report.scanResults)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: '1px solid #e5e7eb',
                            background: '#f3f4f6',
                            color: '#374151',
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
                            e.currentTarget.style.color = '#374151'
                          }}
                        >
                          View Scan Results
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
