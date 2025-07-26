import { useEffect } from 'react'

/**
 * Hook to apply security headers and configurations
 * This provides additional client-side security measures
 */
export function useSecurityHeaders() {
  useEffect(() => {
    // Prevent clickjacking by disabling iframe embedding
    if (window.self !== window.top) {
      document.body.style.display = 'none'
      console.warn('Page loaded in iframe - potential clickjacking attempt')
    }

    // Disable right-click context menu in production
    if (import.meta.env.PROD) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        return false
      }
      
      document.addEventListener('contextmenu', handleContextMenu)
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu)
      }
    }
  }, [])
}