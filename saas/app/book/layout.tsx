import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import '../globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  fallback: ['system-ui', 'arial']
})

export const metadata = {
  title: 'Book Appointment',
  description: 'Online booking system',
}

export default function BookLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}