interface LoadingProps {
  size?: number
  color?: string
}

const BARS = Array(12).fill(0)

export function Loading({ size = 16, color = 'hsl(0, 0%, 43.5%)' }: LoadingProps) {
  return (
    <div style={{ width: size, height: size }}>
      <div className="relative top-1/2 left-1/2" style={{ width: size, height: size }}>
        {BARS.map((_, index) => (
          <div className="loading-bar" key={`spinner-bar-${index}`} style={{ backgroundColor: color }} />
        ))}
      </div>
    </div>
  )
}
