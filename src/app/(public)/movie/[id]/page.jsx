import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { movieService } from '../../../../api/movieService.js'

export default function MovieDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const res = await movieService.detail(id)
        setData(res)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!data) return <div className="p-6">Không tìm thấy phim</div>

  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
      <p className="text-gray-700">{data.description}</p>
      <div className="mt-4 text-sm text-gray-600">Thời lượng: {data.duration} phút</div>
    </section>
  )
}