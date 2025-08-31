// hooks/useApiActions.ts
import { useDispatch, useSelector } from 'react-redux'
import { addTestResult, RootState } from '@/store/store'

export const useApiActions = () => {
  const dispatch = useDispatch()
  const config = useSelector((state: RootState) => state.config)

  const testRestApi = async () => {
    try {
      dispatch(addTestResult('🌐 Test de l\'API REST en cours...'))
      const response = await fetch(`${config.restUrl}/status`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      dispatch(addTestResult(`✅ REST: ${JSON.stringify(data)}`))
    } catch (error) {
      dispatch(addTestResult(`❌ Erreur REST: ${error instanceof Error ? error.message : String(error)}`))
    }
  }

  const testGraphql = async () => {
    try {
      dispatch(addTestResult('🔄 Test de GraphQL en cours...'))
      const response = await fetch(config.graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: '{ status }'
        })
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      dispatch(addTestResult(`✅ GraphQL: ${JSON.stringify(data)}`))
    } catch (error) {
      dispatch(addTestResult(`❌ Erreur GraphQL: ${error instanceof Error ? error.message : String(error)}`))
    }
  }

  return { testRestApi, testGraphql }
}