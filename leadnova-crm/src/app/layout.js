import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/context/ThemeContext'
import SmoothScroll from '@/components/SmoothScroll'
import GlobalTransition from '@/components/GlobalTransition'
import ScrollProgress from '@/components/ScrollProgress'
import MouseFollower from '@/components/MouseFollower'
import CustomCursor from '@/components/Cursor'
import AppShell from '@/components/AppShell'

export const metadata = {
  title: 'LeadNova — AI-Powered Lead Generation CRM',
  description: 'Generate, qualify, and convert business leads with AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
        <AppShell>
          <SmoothScroll>
            <ThemeProvider>
              <GlobalTransition>{children}</GlobalTransition>
              {/* Global noise texture overlay */}
              <div
                className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.025]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: '256px 256px',
                  mixBlendMode: 'overlay',
                }}
              />
              <ScrollProgress />
              <MouseFollower />
              <CustomCursor />
              <Toaster position="top-right" toastOptions={{
                duration: 3000,
                style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '13px', fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' },
                success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }} />
            </ThemeProvider>
          </SmoothScroll>
        </AppShell>
      </body>
    </html>
  )
}
