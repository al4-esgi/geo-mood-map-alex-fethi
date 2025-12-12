import { useEffect, useState } from 'react'

/**
 * Responsive helper to know when viewport is below a breakpoint.
 */
export function useResponsive(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const query = `(max-width: ${breakpoint - 1}px)`
    const media = window.matchMedia(query)

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches)
    }

    // Sync immediately and subscribe
    handleChange(media)
    media.addEventListener('change', handleChange)

    return () => media.removeEventListener('change', handleChange)
  }, [breakpoint])

  return {
    isMobile,
    isDesktop: !isMobile,
  }
}
