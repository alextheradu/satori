import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import 'katex/dist/katex.min.css'
import './index.css'
import App from './App.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { boot } from '@/lib/store'

void boot()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider delayDuration={300}>
        <App />
        <Toaster position="bottom-center" richColors />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
