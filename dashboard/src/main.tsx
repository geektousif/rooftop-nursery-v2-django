import {
  ErrorComponent,
  RouterProvider,
  createRouter,
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

// Import the generated route tree
import { routeTree } from './routeTree.gen.ts'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import 'mantine-react-table/styles.css'
import { useAuthStore } from './features/auth/auth.provider.tsx'
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'
import reportWebVitals from './reportWebVitals.ts'
// import './styles.css'

import { MantineProvider } from '@mantine/core'
import theme from './theme.tsx'

import '@fontsource-variable/playfair-display'
import '@fontsource-variable/nunito'
import { CustomLoader } from './components/common/Loader.tsx'
import NotFound from './components/common/NotFound.tsx'
// Create a new router instance

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: ({ error, reset }) => <ErrorComponent error={error} />,
  defaultPendingComponent: CustomLoader,
  defaultNotFoundComponent: () => <NotFound />,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function AppRouter() {
  const auth = useAuthStore((state) => state)

  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <MantineProvider theme={theme}>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <AppRouter />
      </TanStackQueryProvider.Provider>
    </MantineProvider>
  )
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
