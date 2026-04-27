import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, FileText, DollarSign, Users,
  AlertTriangle, Clock, CheckCircle, TrendingUp,
  ChevronRight, Calendar, Wallet
} from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import paymentsService from '@/services/paymentsService'
import { formatUSD, formatMXN, formatExchangeRate } from '@/utils/currency'

const formatPrice = (n) => formatUSD(n)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : '—'

// Helpers de fechas para los presets
const todayISO = () => new Date().toISOString().slice(0, 10)
const startOfWeekISO = () => {
  const d = new Date()
  const day = d.getDay() // 0 = domingo
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // lunes
  return new Date(d.setDate(diff)).toISOString().slice(0, 10)
}
const startOfMonthISO = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}
const startOfYearISO = () => {
  const d = new Date()
  return new Date(d.getFullYear(), 0, 1).toISOString().slice(0, 10)
}

const PERIOD_PRESETS = [
  { value: 'today', label: 'Hoy', getRange: () => ({ start: todayISO(), end: todayISO() }) },
  { value: 'week', label: 'Esta semana', getRange: () => ({ start: startOfWeekISO(), end: todayISO() }) },
  { value: 'month', label: 'Este mes', getRange: () => ({ start: startOfMonthISO(), end: todayISO() }) },
  { value: 'year', label: 'Este año', getRange: () => ({ start: startOfYearISO(), end: todayISO() }) },
  { value: 'custom', label: 'Personalizado', getRange: null },
]
const Dashboard = () => {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(null)
  const [loading, setLoading] = useState(true)

  // Estado de la sección de cobranza por periodo
  const [periodPreset, setPeriodPreset] = useState('month')
  const [customStart, setCustomStart] = useState(startOfMonthISO())
  const [customEnd, setCustomEnd] = useState(todayISO())
  const [collections, setCollections] = useState(null)
  const [loadingCollections, setLoadingCollections] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await paymentsService.getAlerts()
        setAlerts(res.data)
      } catch (err) {
        console.error(err)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  // Cargar cobranza del periodo seleccionado
  const fetchCollections = useCallback(async () => {
    let start, end
    if (periodPreset === 'custom') {
      start = customStart
      end = customEnd
    } else {
      const preset = PERIOD_PRESETS.find(p => p.value === periodPreset)
      const range = preset.getRange()
      start = range.start
      end = range.end
    }

    if (!start || !end) return

    setLoadingCollections(true)
    try {
      const res = await paymentsService.getCollectionsByPeriod(start, end)
      setCollections(res.data)
    } catch (err) {
      console.error(err)
      setCollections(null)
    } finally {
      setLoadingCollections(false)
    }
  }, [periodPreset, customStart, customEnd])

  useEffect(() => { fetchCollections() }, [fetchCollections])

  if (loading) return (
    <div className="animate-fadeIn">
      <PageHeader title="Dashboard" subtitle="Panel de control general" />
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    </div>
  )

  const cards = [
    {
      label: 'Pagos vencidos',
      value: alerts?.overdue?.count || 0,
      sub: formatPrice(alerts?.overdue?.total),
      icon: AlertTriangle,
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-bg)',
      urgent: (alerts?.overdue?.count || 0) > 0
    },
    {
      label: 'Vencen este mes',
      value: alerts?.dueThisMonth?.count || 0,
      sub: formatPrice(alerts?.dueThisMonth?.total),
      icon: Clock,
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-bg)'
    },
    {
      label: 'Próximos 30 días',
      value: alerts?.upcoming?.count || 0,
      sub: 'pagos por cobrar',
      icon: Calendar,
      color: 'var(--color-info)',
      bg: 'var(--color-info-bg)'
    },
  ]

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Dashboard" subtitle="Panel de control general" />

      {/* Alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cards.map((c, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl border bg-white transition-all ${c.urgent ? 'ring-2 ring-red-200' : ''}`}
            style={{ borderColor: c.urgent ? 'var(--color-danger)' : 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{c.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.bg }}>
                <c.icon size={16} style={{ color: c.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: c.color }}>{c.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Cobranza por periodo */}
      <div className="rounded-xl border bg-white overflow-hidden mb-8" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-success-bg)' }}>
              <Wallet size={18} style={{ color: 'var(--color-success)' }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Cobranza del periodo</h3>
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Montos cobrados en el rango seleccionado</p>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {PERIOD_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriodPreset(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${periodPreset === p.value
                  ? 'text-white border-transparent'
                  : 'bg-white hover:border-gray-300'
                  }`}
                style={periodPreset === p.value
                  ? { background: 'var(--color-primary)' }
                  : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date inputs (solo cuando custom está activo) */}
        {periodPreset === 'custom' && (
          <div className="px-5 py-3 flex items-center gap-3 flex-wrap" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border-light)' }}>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Desde:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Hasta:</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {loadingCollections ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-[var(--color-success)] rounded-full animate-spin" />
            </div>
          ) : !collections ? (
            <div className="text-center py-6">
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No se pudieron cargar los datos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total USD */}
              <div className="p-4 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--color-success-bg), #ECFDF5)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-success)' }}>Total cobrado</p>
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-success)' }}>{formatUSD(collections.totalUSD)}</p>
                {collections.totalMXN > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>≈ {formatMXN(collections.totalMXN)}</p>
                )}
              </div>

              {/* Movimientos */}
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Movimientos</p>
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{collections.movementsCount}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>cobros registrados</p>
              </div>

              {/* Pagos únicos */}
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Pagos involucrados</p>
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{collections.paymentsCount}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>en {collections.contractsCount} contrato(s)</p>
              </div>

              {/* TC promedio */}
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>TC promedio</p>
                <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-accent)' }}>
                  {collections.averageExchangeRate > 0 ? formatExchangeRate(collections.averageExchangeRate) : '—'}
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>ponderado por monto</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue payments */}
        <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Pagos Vencidos</h3>
            </div>
            <button onClick={() => navigate('/pagos')} className="text-xs font-medium flex items-center gap-1 transition-colors hover:text-[var(--color-accent)]" style={{ color: 'var(--color-text-muted)' }}>
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
            {!alerts?.overdue?.items?.length ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle size={24} className="mx-auto mb-2" style={{ color: 'var(--color-success)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sin pagos vencidos</p>
              </div>
            ) : alerts.overdue.items.slice(0, 6).map((p, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-[var(--color-surface)] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{p.buyerName}</p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{p.unitIdentifier} · {p.concept}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-danger)' }}>{formatPrice(p.balance)}</p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Venció {formatDate(p.dueDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming this month */}
        <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ color: 'var(--color-warning)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Por cobrar este mes</h3>
            </div>
            <button onClick={() => navigate('/pagos')} className="text-xs font-medium flex items-center gap-1 transition-colors hover:text-[var(--color-accent)]" style={{ color: 'var(--color-text-muted)' }}>
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
            {!alerts?.dueThisMonth?.items?.length ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle size={24} className="mx-auto mb-2" style={{ color: 'var(--color-success)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sin pagos pendientes este mes</p>
              </div>
            ) : alerts.dueThisMonth.items.slice(0, 6).map((p, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-[var(--color-surface)] transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{p.buyerName}</p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{p.unitIdentifier} · {p.concept}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-warning)' }}>{formatPrice(p.balance)}</p>
                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Vence {formatDate(p.dueDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard