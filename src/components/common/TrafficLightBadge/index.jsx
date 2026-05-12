import { MILESTONE_TRAFFIC, getMilestoneTrafficLight } from '@/utils/contractConstants'

/**
 * Badge visual de semáforo para un hito.
 *
 * Props:
 * - milestone: objeto pago/hito (preferido)
 * - light: alternativa, pasar el valor directo ('red'|'yellow'|'green'|'delivered')
 * - size: 'xs' | 'sm' | 'md'
 * - showLabel: bool — mostrar texto al lado del dot
 */
const TrafficLightBadge = ({ milestone, light, size = 'sm', showLabel = true }) => {
  const config = light
    ? MILESTONE_TRAFFIC[light]
    : getMilestoneTrafficLight(milestone)

  const sizes = {
    xs: { dot: 8, font: 'text-[9px]', padding: 'px-1.5 py-0.5' },
    sm: { dot: 10, font: 'text-[10px]', padding: 'px-2 py-0.5' },
    md: { dot: 12, font: 'text-xs', padding: 'px-2.5 py-1' }
  }
  const s = sizes[size] || sizes.sm

  if (!showLabel) {
    return (
      <span
        className="inline-block rounded-full"
        style={{ width: s.dot, height: s.dot, background: config.dotColor }}
        title={config.label}
      />
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold uppercase tracking-wider ${s.font} ${s.padding}`}
      style={{ background: config.bg, color: config.color }}
      title={config.description}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: s.dot * 0.7, height: s.dot * 0.7, background: config.dotColor }}
      />
      {config.label}
    </span>
  )
}

export default TrafficLightBadge