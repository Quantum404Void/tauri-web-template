/**
 * useResponsive.ts — 响应式断点
 */

import { ref, onMounted, onUnmounted } from 'vue'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 960,
  lg: 1280,
  xl: 1600
}

export function useResponsive() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  let _raf = 0

  function onResize() {
    cancelAnimationFrame(_raf)
    _raf = requestAnimationFrame(() => {
      width.value = window.innerWidth
      height.value = window.innerHeight
    })
  }

  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => {
    window.removeEventListener('resize', onResize)
    cancelAnimationFrame(_raf)
  })

  function isGreaterOrEqual(bp: Breakpoint) {
    return width.value >= BREAKPOINTS[bp]
  }

  function isLessThan(bp: Breakpoint) {
    return width.value < BREAKPOINTS[bp]
  }

  const isMobile = () => isLessThan('md')

  function current(): Breakpoint {
    if (width.value >= BREAKPOINTS.xl) return 'xl'
    if (width.value >= BREAKPOINTS.lg) return 'lg'
    if (width.value >= BREAKPOINTS.md) return 'md'
    if (width.value >= BREAKPOINTS.sm) return 'sm'
    return 'xs'
  }

  return {
    width,
    height,
    isGreaterOrEqual,
    isLessThan,
    isMobile,
    current,
    bp: BREAKPOINTS
  }
}
