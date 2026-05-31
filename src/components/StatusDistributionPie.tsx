import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface StatusDistributionPieProps {
  submitted: number
  pending: number
  success: number
  failed: number
}

export default function StatusDistributionPie({
  submitted,
  pending,
  success,
  failed,
}: StatusDistributionPieProps) {
  const data = [
    { name: 'Submitted', value: submitted, fill: '#2B3381' },
    { name: 'Pending', value: pending, fill: '#ff9500' },
    { name: 'Success', value: success, fill: '#00b371' },
    { name: 'Failed', value: failed, fill: '#ff6b6b' },
  ]

  const hasData = data.some((item) => item.value > 0)

  if (!hasData) {
    return <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>No data available</p>
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: 600, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#fff', fontSize: 13 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <YAxis 
            tick={{ fill: '#fff', fontSize: 13 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#fff' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#2B3381',
              border: '2px solid #4a5aa8',
              borderRadius: 8,
              color: '#fff',
            }}
            formatter={(value) => `${value} reports`}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  )
}
