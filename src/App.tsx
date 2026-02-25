import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import VaultView from './pages/VaultView'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vault/:vaultId" element={<VaultView />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
