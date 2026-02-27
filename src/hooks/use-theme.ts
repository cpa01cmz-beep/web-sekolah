import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { storage } from '@/lib/storage'

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = storage.getItem(STORAGE_KEYS.THEME)
    return savedTheme
      ? savedTheme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      storage.setItem(STORAGE_KEYS.THEME, 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      storage.setItem(STORAGE_KEYS.THEME, 'light')
    }
  }, [isDark])

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev)
  }, [])

  return { isDark, toggleTheme }
}
