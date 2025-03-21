
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set the initial value
    checkIfMobile()
    
    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile)
    
    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return !!isMobile
}

// Additional mobile-specific hooks for better UI adaptation
export function useViewportSize() {
  const [viewportSize, setViewportSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  React.useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    handleResize() // Set initial size
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewportSize
}

// Detect device type more specifically
export function useDeviceType() {
  const { width } = useViewportSize()
  
  if (width < 640) return 'mobile'
  if (width >= 640 && width < 768) return 'tablet-small'
  if (width >= 768 && width < 1024) return 'tablet'
  if (width >= 1024 && width < 1280) return 'laptop'
  return 'desktop'
}

// Hook for font size adjustments based on screen size
export function useResponsiveFontSize(baseSize: number, mobileReduction: number = 0.2) {
  const isMobile = useIsMobile()
  
  return isMobile ? `${baseSize - mobileReduction}rem` : `${baseSize}rem`
}
