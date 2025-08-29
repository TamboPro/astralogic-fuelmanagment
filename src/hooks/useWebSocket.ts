// hooks/useWebSocket.ts
import { useState, useEffect, useRef } from 'react'

export const useWebSocket = (url: string, topics: string[] = []) => {
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING)
  const ws = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        if (ws.current) {
          ws.current.close()
        }

        ws.current = new WebSocket(url)
        
        ws.current.onopen = () => {
          setReadyState(WebSocket.OPEN)
          reconnectAttempts.current = 0
          
          // S'abonner aux topics
          topics.forEach(topic => {
            ws.current?.send(JSON.stringify({
              type: 'subscribe',
              topic
            }))
          })
        }

        ws.current.onmessage = (event) => {
          setLastMessage(event)
        }

        ws.current.onclose = () => {
          setReadyState(WebSocket.CLOSED)
          
          // Tentative de reconnexion avec backoff exponentiel
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          reconnectAttempts.current += 1
          
          setTimeout(() => {
            if (reconnectAttempts.current < 5) { // Maximum 5 tentatives
              connectWebSocket()
            }
          }, delay)
        }

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error)
          setReadyState(WebSocket.CLOSED)
        }

      } catch (error) {
        console.error('WebSocket connection error:', error)
        setReadyState(WebSocket.CLOSED)
      }
    }

    connectWebSocket()

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url]) // Seulement url comme dépendance

  return { lastMessage, readyState }
}

export default useWebSocket