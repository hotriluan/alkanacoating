import { useState, useEffect } from 'react'
import api from '../services/api'

export default function ApiTest() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('API Base URL:', api.defaults.baseURL)
    
    api.get('/products')
      .then(response => {
        console.log('API Response:', response.data)
        setData(response.data)
      })
      .catch(error => {
        console.error('API Error:', error)
        setError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div className="p-4">
      <h2>API Test</h2>
      <p>Base URL: {api.defaults.baseURL}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}