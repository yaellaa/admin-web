import { useEffect, useState } from 'react'
import { get, ref, update } from 'firebase/database'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { db, storage } from '../firebase'
import '../styles/Dashboard.css'

type ProfileData = {
  firstName?: string
  lastName?: string
  email?: string
  contactNum?: string
  phone?: string
  profileImage?: string
  admin?: any
  [key: string]: any
}

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState('')
  const [data, setData] = useState<ProfileData>({})
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const currentUserId = localStorage.getItem('userId') || ''
        setUserId(currentUserId)

        if (!currentUserId) {
          setError('No logged-in user found')
          return
        }

        const snapshot = await get(ref(db, `Users/${currentUserId}`))
        if (!snapshot.exists()) {
          setError('Profile not found')
          return
        }

        const value = snapshot.val() as ProfileData
        setData(value)
        setPreviewUrl(value.profileImage || '')
      } catch (err) {
        console.error(err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (field: keyof ProfileData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = async (file: File | null) => {
    if (!file || !userId) return

    const fileRef = storageRef(storage, `profile_images/${userId}/${Date.now()}-${file.name}`)
    await uploadBytes(fileRef, file)
    const url = await getDownloadURL(fileRef)
    setData((prev) => ({ ...prev, profileImage: url }))
    setPreviewUrl(url)
  }

  const handleSave = async () => {
    if (!userId) return

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        contactNum: data.contactNum || data.phone || '',
        profileImage: data.profileImage || '',
      }

      await update(ref(db, `Users/${userId}`), payload)
      localStorage.setItem('userEmail', payload.email)
      setSuccess('Profile updated successfully')
    } catch (err) {
      console.error(err)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-content">
      <div className="content-header">
        <h2>Profile</h2>
        <p className="description">View and update your profile information.</p>
      </div>

      <div className="content-body">
        {loading && <p>Loading profile...</p>}
        {error && <p className="error-message">{error}</p>}
        {success && <p style={{ color: '#2ecc71' }}>{success}</p>}

        {!loading && !error && (
          <div className="card" style={{ maxWidth: 720 }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <div style={{ marginBottom: 12 }}>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: '#e5e7eb',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#6b7280',
                        fontWeight: 600,
                      }}
                    >
                      No Photo
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                />
              </div>

              <div style={{ flex: 1, minWidth: 280 }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input value={data.firstName || ''} onChange={(e) => handleChange('firstName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input value={data.lastName || ''} onChange={(e) => handleChange('lastName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input value={data.email || ''} onChange={(e) => handleChange('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input value={data.contactNum || data.phone || ''} onChange={(e) => handleChange('contactNum', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input readOnly value={data.admin === 1 || data.admin === '1' || data.admin === true ? 'Admin' : 'User'} />
                </div>

                <button className="login-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
