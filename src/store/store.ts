// store/store.ts
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'

// Interfaces
export interface Topic {
  id: string
  value: string
  qos: 0 | 1 | 2
  retain: boolean
}

export interface MqttAuth {
  username: string
  password: string
  clientId: string
}

export interface ConnectionConfig {
  mqttUrl: string
  restUrl: string
  graphqlUrl: string
  stationName: string
  topics: Topic[]
  saveToDatabase: boolean
  mqttAuth: MqttAuth
}

export interface ConnectionState {
  isConnected: boolean
  testResults: string[]
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  connectionStats: {
    messagesSent: number
    messagesReceived: number
    lastMessageTimestamp: number | null
  }
}

export interface StationData {
  fuels: {
    essence1: number
    essence2: number
    petrol: number
    gazoil: number
  }
  pumps: {
    pompe1: number
    pompe2: number
    pompe3: number
    pompe4: number
  }
  lastUpdate: number
}

export interface CameraData {
  camera1: string
  camera2: string
  lastUpdate: number
}

// Slice pour la configuration
const configSlice = createSlice({
  name: 'config',
  initialState: {
    mqttUrl: 'ws://broker.emqx.io:8083/mqtt',
    restUrl: process.env.NEXT_PUBLIC_REST_URL || 'http://localhost:3001/api',
    graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
    stationName: 'Station_Logbessou',
    topics: [
      { id: '1', value: 'astralogic/Station_Logbessou/data', qos: 1, retain: false },
      { id: '2', value: 'astralogic/Station_Logbessou/camera1', qos: 0, retain: false },
      { id: '3', value: 'astralogic/Station_Logbessou/camera2', qos: 0, retain: false }
    ],
    saveToDatabase: true,
    mqttAuth: {
      username: '',
      password: '',
      clientId: `react-client-${Math.random().toString(16).substr(2, 8)}`
    }
  } as ConnectionConfig,
  reducers: {
    updateConfig: (state, action: PayloadAction<Partial<ConnectionConfig>>) => {
      return { ...state, ...action.payload }
    },
    updateMqttAuth: (state, action: PayloadAction<Partial<MqttAuth>>) => {
      state.mqttAuth = { ...state.mqttAuth, ...action.payload }
    },
    updateTopic: (state, action: PayloadAction<{ id: string; field: keyof Topic; value: string | number | boolean }>) => {
      const { id, field, value } = action.payload
      state.topics = state.topics.map(topic => 
        topic.id === id ? { ...topic, [field]: value } : topic
      )
    },
    addTopic: (state, action: PayloadAction<Topic>) => {
      if (state.topics.length < 15) {
        state.topics.push(action.payload)
      }
    },
    removeTopic: (state, action: PayloadAction<string>) => {
      state.topics = state.topics.filter(topic => topic.id !== action.payload)
    }
  }
})

// Slice pour les connexions
const connectionSlice = createSlice({
  name: 'connection',
  initialState: {
    isConnected: false,
    testResults: [],
    connectionStatus: 'disconnected',
    connectionStats: {
      messagesSent: 0,
      messagesReceived: 0,
      lastMessageTimestamp: null
    }
  } as ConnectionState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
      state.connectionStatus = action.payload ? 'connected' : 'disconnected'
    },
    setConnecting: (state) => {
      state.connectionStatus = 'connecting'
    },
    setConnectionError: (state) => {
      state.connectionStatus = 'error'
    },
    addTestResult: (state, action: PayloadAction<string>) => {
      state.testResults.push(action.payload)
      if (state.testResults.length > 20) {
        state.testResults = state.testResults.slice(-20)
      }
    },
    clearTestResults: (state) => {
      state.testResults = []
    },
    incrementMessagesSent: (state) => {
      state.connectionStats.messagesSent += 1
      state.connectionStats.lastMessageTimestamp = Date.now()
    },
    incrementMessagesReceived: (state) => {
      state.connectionStats.messagesReceived += 1
    },
    resetStats: (state) => {
      state.connectionStats = {
        messagesSent: 0,
        messagesReceived: 0,
        lastMessageTimestamp: null
      }
    }
  }
})

// Slice pour les données de la station (carburants et pompes)
const stationDataSlice = createSlice({
  name: 'stationData',
  initialState: {
    fuels: {
      essence1: 450,
      essence2: 250,
      petrol: 1500,
      gazoil: 1200
    },
    pumps: {
      pompe1: 45,
      pompe2: 67,
      pompe3: 89,
      pompe4: 23
    },
    lastUpdate: Date.now()
  } as StationData,
  reducers: {
    updateStationData: (state, action: PayloadAction<Partial<StationData>>) => {
      return { ...state, ...action.payload, lastUpdate: Date.now() }
    },
    updateFuelData: (state, action: PayloadAction<{ type: keyof StationData['fuels']; value: number }>) => {
      const { type, value } = action.payload
      state.fuels[type] = value
      state.lastUpdate = Date.now()
    },
    updatePumpData: (state, action: PayloadAction<{ type: keyof StationData['pumps']; value: number }>) => {
      const { type, value } = action.payload
      state.pumps[type] = value
      state.lastUpdate = Date.now()
    }
  }
})

// Slice pour les données des caméras
const cameraDataSlice = createSlice({
  name: 'cameraData',
  initialState: {
    camera1: "/assets/images/camera-placeholder.jpg",
    camera2: "/assets/images/camera-placeholder.jpg",
    lastUpdate: Date.now()
  } as CameraData,
  reducers: {
    updateCameraData: (state, action: PayloadAction<Partial<CameraData>>) => {
      return { ...state, ...action.payload, lastUpdate: Date.now() }
    },
    updateCamera1: (state, action: PayloadAction<string>) => {
      state.camera1 = action.payload
      state.lastUpdate = Date.now()
    },
    updateCamera2: (state, action: PayloadAction<string>) => {
      state.camera2 = action.payload
      state.lastUpdate = Date.now()
    }
  }
})

// Configuration du store Redux
export const store = configureStore({
  reducer: {
    config: configSlice.reducer,
    connection: connectionSlice.reducer,
    stationData: stationDataSlice.reducer,
    cameraData: cameraDataSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['config.topics'],
      },
    }),
})

// Export des actions
export const { 
  updateConfig, 
  updateMqttAuth, 
  updateTopic, 
  addTopic, 
  removeTopic 
} = configSlice.actions

export const { 
  setConnected, 
  setConnecting, 
  setConnectionError, 
  addTestResult, 
  clearTestResults, 
  incrementMessagesSent, 
  incrementMessagesReceived,
  resetStats
} = connectionSlice.actions

export const { 
  updateStationData, 
  updateFuelData, 
  updatePumpData
} = stationDataSlice.actions

export const { 
  updateCameraData,
  updateCamera1,
  updateCamera2
} = cameraDataSlice.actions

// Types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch