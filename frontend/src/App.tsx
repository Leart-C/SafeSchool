import { AppRouter } from './routes/AppRouter'
import { Toaster } from './components/ui/Toaster'

function App() {
  return(
    <>
      <AppRouter />
      <Toaster />
    </>
  )
}

export default App