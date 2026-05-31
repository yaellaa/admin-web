import { useState } from 'react'
import '../styles/Dashboard.css'

interface PageContent {
  [key: string]: {
    title: string
    description: string
    content: string
  }
}

export default function Dashboard() {
  const [currentPage] = useState('dashboard')

  const pageContent: PageContent = {
    dashboard: {
      title: 'Dashboard',
      description: 'Welcome to your admin dashboard',
      content: `Here you can manage all aspects of your BacoorConnect platform. Use the sidebar menu to navigate through different sections.`
    }
  }

  const content = pageContent[currentPage]

  return (
    <div className="page-content">
      <div className="content-header">
        <h2>{content.title}</h2>
        <p className="description">{content.description}</p>
      </div>

      <div className="content-body">
        <div className="card">
          <h3>Welcome to {content.title}</h3>
          <p>{content.content}</p>

          <div className="dashboard-stats">
            <div className="stat-card">
              <h4>Total Users</h4>
              <p className="stat-number">1,234</p>
            </div>
            <div className="stat-card">
              <h4>Total Orders</h4>
              <p className="stat-number">5,678</p>
            </div>
            <div className="stat-card">
              <h4>Revenue</h4>
              <p className="stat-number">$45,920</p>
            </div>
            <div className="stat-card">
              <h4>Active Sessions</h4>
              <p className="stat-number">234</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
