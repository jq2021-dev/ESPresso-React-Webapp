import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './vendor/fontawesome-free-6.2.1-web/css/fontawesome.min.css'
import './vendor/fontawesome-free-6.2.1-web/css/solid.min.css'
import { WebSocketConnectionProvider } from './contexts/webSocketContext/webSocketConnection';
import { SensorValueProvider } from './contexts/webSocketContext/sensorValuesContext';
import { MachineStateProvider } from './contexts/webSocketContext/machineStateContext';
import { AppSettingsProvider } from './contexts/LocalStorageContext/appSettingsContext';
import { ShotHistoryProvider } from './contexts/LocalStorageContext/ShotHistoryContext';
import { ProfilesProvider } from './contexts/webSocketContext/ProfilesContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
    <WebSocketConnectionProvider>
    <MachineStateProvider>
    <AppSettingsProvider>
    <ProfilesProvider>
    <SensorValueProvider>
    {/* <ActiveProfileProvider> */}
    <ShotHistoryProvider>
      <App />
    </ShotHistoryProvider>
    {/* </ActiveProfileProvider> */}
    </SensorValueProvider>
    </ProfilesProvider>  
    </AppSettingsProvider>
    </MachineStateProvider>
    </WebSocketConnectionProvider>
    </BrowserRouter>
)