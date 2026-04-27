import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { GlobalToast } from '@/components/ui/GlobalToast'

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <GlobalToast />
    </>
  )
}

export default App
