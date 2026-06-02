import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface ReportMapProps {
  reports: Array<{
    id: string
    category: string
    location: string
    status: string
    latitude?: number
    longitude?: number
    timestamp?: number
  }>
}

export default function ReportMap({ reports = [] }: ReportMapProps) {
  // Filter reports with valid coordinates
  const reportsWithCoords = (reports || []).filter((r) => r.latitude && r.longitude)

  // Philippines bounds: [South, West] to [North, East]
  const philippinesBounds: [[number, number], [number, number]] = [
    [5.5305, 117.1731], // Southwest corner
    [21.1449, 126.6043], // Northeast corner
  ]

  // Default center (Philippines center)
  const defaultCenter: [number, number] = [12.8797, 121.774]

  // Calculate center based on reports, but stay within Philippines
  let center: [number, number] = defaultCenter
  if (reportsWithCoords.length > 0) {
    const avgLat = reportsWithCoords.reduce((sum, r) => sum + (r.latitude || 0), 0) / reportsWithCoords.length
    const avgLng = reportsWithCoords.reduce((sum, r) => sum + (r.longitude || 0), 0) / reportsWithCoords.length
    center = [avgLat, avgLng]
  }

  // Get color for status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return '#2B3381'
      case 'pending':
        return '#ff9500'
      case 'success':
        return '#00d084'
      case 'failed':
        return '#ff6b6b'
      default:
        return '#6b7280'
    }
  }

  // Get icon based on report category
  const getCategoryIcon = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      accident: '/images/accident%20location.png',
      criminal: '/images/criminal%20location.png',
      medical: '/images/medical%20location.png',
      traffic: '/images/traffic%20location.png',
    }

    const imagePath = categoryMap[category?.toLowerCase()] || '/images/accident%20location.png'

    return L.icon({
      iconUrl: imagePath,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [13, 41],
    })
  }

  if (reportsWithCoords.length === 0) {
    return (
      <div
        style={{
          background: 'white',
          padding: 24,
          borderRadius: 8,
          textAlign: 'center',
          color: '#666',
          fontSize: 14,
        }}
      >
        <p>No reports with location coordinates available to display on the map.</p>
        <p style={{ fontSize: 12, marginTop: 8 }}>
          Make sure reports have latitude and longitude data.
        </p>
      </div>
    )
  }

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
      <MapContainer 
        center={center} 
        zoom={7} 
        style={{ height: 500, width: '100%' }}
        maxBounds={philippinesBounds}
        maxBoundsViscosity={1.0}
        minZoom={6}
        maxZoom={15}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reportsWithCoords.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude || 0, report.longitude || 0]}
            icon={getCategoryIcon(report.category)}
          >
            <Popup>
              <div style={{ minWidth: 250 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>{report.category}</h4>
                <p style={{ margin: '4px 0', fontSize: 13 }}>
                  <strong>Location:</strong> {report.location}
                </p>
                <p style={{ margin: '4px 0', fontSize: 13 }}>
                  <strong>Status:</strong>{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 6,
                      backgroundColor: getStatusColor(report.status),
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 'bold',
                    }}
                  >
                    {report.status}
                  </span>
                </p>
                <p style={{ margin: '4px 0', fontSize: 13 }}>
                  <strong>ID:</strong> {report.id}
                </p>
                <p style={{ margin: '4px 0', fontSize: 13 }}>
                  <strong>Timestamp:</strong>{' '}
                  {report.timestamp
                    ? new Date(report.timestamp).toLocaleString()
                    : '—'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
