export default function HealthVignette({ health }) {
  if (health >= 80) return null

  const intensity = Math.max(0, (80 - health) / 80)
  const spread = 80 + intensity * 200

  return (
    <div
      className="health-vignette"
      style={{
        boxShadow: `inset 0 0 ${spread}px rgba(0, 0, 0, ${intensity * 0.85})`,
      }}
    />
  )
}
