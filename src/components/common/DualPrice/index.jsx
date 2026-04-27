import { formatUSD, formatMXN, convertToMXN, formatExchangeRate } from '@/utils/currency'

/**
 * Muestra un monto USD con su equivalente MXN debajo (o lado a lado)
 * @param {number} usd - Monto en USD
 * @param {number} rate - Tipo de cambio
 * @param {string} layout - 'stacked' (por defecto) o 'inline'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} showRate - Si muestra "TC: $X.XX" debajo
 */
const DualPrice = ({ usd, rate, layout = 'stacked', size = 'md', showRate = false, color }) => {
  const sizes = {
    sm: { primary: 'text-xs font-semibold', secondary: 'text-[10px]', rate: 'text-[9px]' },
    md: { primary: 'text-sm font-semibold', secondary: 'text-xs', rate: 'text-[10px]' },
    lg: { primary: 'text-base font-bold', secondary: 'text-sm', rate: 'text-xs' },
  }
  const s = sizes[size] || sizes.md
  const mxn = convertToMXN(usd, rate)
  const primaryColor = color || 'var(--color-text)'

  if (layout === 'inline') {
    return (
      <span className={`inline-flex items-baseline gap-1.5`}>
        <span className={s.primary} style={{ color: primaryColor }}>{formatUSD(usd)}</span>
        {rate && <span className={s.secondary} style={{ color: 'var(--color-text-muted)' }}>≈ {formatMXN(mxn)}</span>}
      </span>
    )
  }

  return (
    <div className="flex flex-col leading-tight">
      <span className={s.primary} style={{ color: primaryColor }}>{formatUSD(usd)}</span>
      {rate ? (
        <>
          <span className={s.secondary} style={{ color: 'var(--color-text-muted)' }}>≈ {formatMXN(mxn)}</span>
          {showRate && <span className={s.rate} style={{ color: 'var(--color-text-muted)' }}>TC: {formatExchangeRate(rate)}</span>}
        </>
      ) : null}
    </div>
  )
}

export default DualPrice