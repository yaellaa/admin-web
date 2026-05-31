export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #2B3381 0%, #4a5aa8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(43, 51, 129, 0.3)',
        }}
      >
        BC
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>
          BacoorConnect
        </h2>
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Admin Panel
        </p>
      </div>
    </div>
  )
}
