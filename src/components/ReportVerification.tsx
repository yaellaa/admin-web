import { useEffect, useState } from 'react'
import '../styles/Dashboard.css'
import { db } from '../firebase'
import { get, ref } from 'firebase/database'

type ReportItem = {
  id: string
  [key: string]: any
}

export default function ReportVerification() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedScanResult, setSelectedScanResult] = useState<any>(null)

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
          list.push({ id: child.key ?? '', ...(child.val() as object) })
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
            {reports.length === 0 ? (
              <p>No reports found.</p>
            ) : (
              reports.map((report) => (
                <div className="card" key={report.id} style={{ marginBottom: 20 }}>
                  <h3>{report.category || 'Report'}</h3>
                  <p><strong>Report ID:</strong> {report.id}</p>
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
                          style={{ maxWidth: '100%', borderRadius: 8, maxHeight: 360, objectFit: 'cover' }}
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
                        .filter(([key]) => key !== 'id' && key !== 'scanResults')
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
      </div>
    </div>
  )
}
