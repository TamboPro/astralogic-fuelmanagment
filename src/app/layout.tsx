// app/layout.tsx
'use client'

import { Provider } from 'react-redux'
import { store } from '@/store/store'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  )
}