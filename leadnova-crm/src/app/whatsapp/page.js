'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WhatsAppRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard/indian-leads')
  }, [router])
  return null
}
