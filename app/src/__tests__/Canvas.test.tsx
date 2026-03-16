import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Canvas from '@/components/Canvas'

describe('Canvas', () => {
  it('renders the canvas-area div', () => {
    const { container } = render(<Canvas />)
    // The outermost div is the viewport, second div is the canvas-area with dot grid
    const viewport = container.firstElementChild as HTMLElement
    expect(viewport).toBeInTheDocument()
    // Canvas area is the first child of viewport (has the dot grid background)
    const canvasArea = viewport.firstElementChild as HTMLElement
    expect(canvasArea).toBeInTheDocument()
    expect(canvasArea.style.width).toBe('100%')
    expect(canvasArea.style.height).toBe('100%')
  })

  it('zoom-layer has data-canvas attribute', () => {
    const { container } = render(<Canvas />)
    const viewport = container.firstElementChild as HTMLElement
    const canvasArea = viewport.firstElementChild as HTMLElement
    const zoomLayer = canvasArea.firstElementChild as HTMLElement
    expect(zoomLayer).toHaveAttribute('data-canvas', 'true')
  })

  it('pan-layer has data-canvas attribute', () => {
    const { container } = render(<Canvas />)
    const viewport = container.firstElementChild as HTMLElement
    const canvasArea = viewport.firstElementChild as HTMLElement
    const zoomLayer = canvasArea.firstElementChild as HTMLElement
    const panLayer = zoomLayer.firstElementChild as HTMLElement
    expect(panLayer).toHaveAttribute('data-canvas', 'true')
  })

  it('has 3-level nesting structure (canvas-area → zoom-layer → pan-layer)', () => {
    const { container } = render(<Canvas />)
    const viewport = container.firstElementChild as HTMLElement
    const canvasArea = viewport.firstElementChild as HTMLElement
    const zoomLayer = canvasArea.firstElementChild as HTMLElement
    const panLayer = zoomLayer.firstElementChild as HTMLElement

    // Verify nesting: viewport > canvas-area > zoom-layer > pan-layer
    expect(canvasArea.parentElement).toBe(viewport)
    expect(zoomLayer.parentElement).toBe(canvasArea)
    expect(panLayer.parentElement).toBe(zoomLayer)

    // Zoom-layer has scale transform
    expect(zoomLayer.style.transform).toContain('scale')
    // Pan-layer has translate transform
    expect(panLayer.style.transform).toContain('translate')
  })

  it('starts with no session panels on mount', () => {
    render(<Canvas />)
    // Mock sessions should not be present — canvas starts empty
    expect(screen.queryByText('api-server')).not.toBeInTheDocument()
    expect(screen.queryByText('git-workflow')).not.toBeInTheDocument()
    expect(screen.queryByText('docker-build')).not.toBeInTheDocument()
    expect(screen.queryByText('test-runner')).not.toBeInTheDocument()
  })
})
