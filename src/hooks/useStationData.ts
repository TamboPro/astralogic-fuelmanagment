import { useState, useCallback, useEffect } from 'react'
import { StationData } from '@/app/pages/v2/dashboard/page'

export const useStationData = (stationName: string) => {
  const [data, setData] = useState<StationData>({
    cameras: { camera1: '', camera2: '' },
    fuels: { essence1: 0, essence2: 0, petrol: 0, gazoil: 0 },
    pumps: { pompe1: 0, pompe2: 0, pompe3: 0, pompe4: 0 },
    sales: [],
    transactions: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const updateData = useCallback((key: keyof StationData, value: any) => {
    setData(prev => ({
      ...prev,
      [key]: { ...prev[key], ...value }
    }))
  }, [])

  // Chargement initial des données
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/station/${stationName}/initial`)
        if (response.ok) {
          const initialData = await response.json()
          setData(initialData)
        }
      } catch (err) {
        setError('Erreur lors du chargement des données initiales')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [stationName])

  return { data, updateData, loading, error }
}