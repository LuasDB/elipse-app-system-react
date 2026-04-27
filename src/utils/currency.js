// Utilidades de manejo de moneda dual USD/MXN

/**
 * Formatea un monto en USD con símbolo y separadores
 */
export const formatUSD = (n) => {
  if (n === null || n === undefined || n === '') return '—'
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USD`
}

/**
 * Formatea un monto en MXN con símbolo y separadores
 */
export const formatMXN = (n) => {
  if (n === null || n === undefined || n === '') return '—'
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} MXN`
}

/**
 * Convierte un monto USD a MXN aplicando un tipo de cambio
 */
export const convertToMXN = (usdAmount, exchangeRate) => {
  if (!usdAmount || !exchangeRate) return 0
  return Math.round(Number(usdAmount) * Number(exchangeRate) * 100) / 100
}

/**
 * Formatea el TC para mostrarlo
 */
export const formatExchangeRate = (rate) => {
  if (!rate) return '—'
  return `$${Number(rate).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
}

/**
 * Formatea fecha del TC
 */
export const formatExchangeRateDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}