import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  TrendingUp, Clock, Trophy, Wallet, Sparkles,
  LineChart, Filter, History, GitCompare, Share2, CalendarClock
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Tooltip, Legend
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import PageHeader from '@/components/common/PageHeader'
import reportsService from '@/services/reportsService'
import sellersService from '@/services/sellersService'
import { formatUSD } from '@/utils/currency'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

const todayISO = () => new Date().toISOString().slice(0, 10)

const getPeriodRange = (preset, customStart, customEnd) => {
  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth()

  switch (preset) {
    case 'month':
      return { start: new Date(y, m, 1).toISOString().slice(0, 10), end: todayISO() }
    case 'custom':
      return { start: customStart, end: customEnd }
    case 'year':
    default:
      return { start: new Date(y, 0, 1).toISOString().slice(0, 10), end: todayISO() }
  }
}

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const formatPeriodLabel = (period) => {
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(period)
  if (monthMatch) return MONTH_LABELS[Number(monthMatch[2]) - 1]
  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period)
  if (dayMatch) return `${dayMatch[3]} ${MONTH_LABELS[Number(dayMatch[2]) - 1]}`
  return period
}

const initialsOf = (name) => (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')

const TABS = [
  { key: 'ventas', label: 'Vendido vs cobrado', icon: TrendingUp },
  { key: 'adeudos', label: 'Adeudos a vendedores', icon: Clock },
  { key: 'ranking', label: 'Ranking', icon: Trophy },
  { key: 'roadmap', label: 'Próximamente', icon: Sparkles },
]

const ROADMAP = [
  {
    title: 'Proyección de cobranza',
    desc: 'Estimado de lo que se cobrará en los próximos 30/60/90 días según el calendario de pagos vigente.',
    icon: LineChart
  },
  {
    title: 'Embudo del pipeline',
    desc: 'Apartado → promesa → definitivo → escriturado → entregado, con tiempos promedio por etapa.',
    icon: Filter
  },
  {
    title: 'Cartera vencida por antigüedad',
    desc: 'Saldo vencido agrupado en 0-30 / 31-60 / 61-90 / 90+ días, por comprador y por vendedor.',
    icon: History
  },
  {
    title: 'Comparativo interanual',
    desc: 'Este año vs el anterior, mes a mes, para ver si el negocio crece o se desacelera.',
    icon: GitCompare
  },
  {
    title: 'Exportar y compartir',
    desc: 'Descargar el reporte en PDF o enviarlo por WhatsApp/correo directo desde el celular.',
    icon: Share2
  },
  {
    title: 'Resumen semanal automático',
    desc: 'Un mensaje con las cifras clave cada lunes, sin tener que abrir la app a buscarlo.',
    icon: CalendarClock
  },
]

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('ventas')

  // ---- Vendido vs cobrado ----
  const [preset, setPreset] = useState('year')
  const [customStart, setCustomStart] = useState(todayISO())
  const [customEnd, setCustomEnd] = useState(todayISO())
  const [groupBy, setGroupBy] = useState('month')
  const [salesData, setSalesData] = useState([])
  const [loadingSales, setLoadingSales] = useState(true)

  const fetchSales = useCallback(async () => {
    setLoadingSales(true)
    try {
      const { start, end } = getPeriodRange(preset, customStart, customEnd)
      const res = await reportsService.getSalesVsCollections(start, end, groupBy)
      setSalesData(res.data || [])
    } catch (err) {
      console.error('Error al cargar el reporte de ventas:', err)
      setSalesData([])
    } finally {
      setLoadingSales(false)
    }
  }, [preset, customStart, customEnd, groupBy])

  useEffect(() => { fetchSales() }, [fetchSales])

  const salesTotals = useMemo(() => {
    const sold = salesData.reduce((a, r) => a + r.sold, 0)
    const collected = salesData.reduce((a, r) => a + r.collected, 0)
    const pct = sold > 0 ? Math.round((collected / sold) * 100) : 0
    return { sold, collected, pct, pending: sold - collected }
  }, [salesData])

  const chartData = useMemo(() => ({
    labels: salesData.map(r => formatPeriodLabel(r.period)),
    datasets: [
      {
        type: 'bar',
        label: 'Vendido',
        data: salesData.map(r => r.sold),
        backgroundColor: '#1B3A5CE8',
        borderRadius: 4,
        barPercentage: 0.55,
        order: 2
      },
      {
        type: 'line',
        label: 'Cobrado',
        data: salesData.map(r => r.collected),
        borderColor: '#C8A45A',
        backgroundColor: '#C8A45A',
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2.5,
        tension: 0.3,
        order: 1
      }
    ]
  }), [salesData])

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatUSD(ctx.parsed.y)}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        grid: { color: '#E4E8EE' },
        ticks: {
          font: { size: 10 },
          callback: (v) => v >= 1000 ? `$${v / 1000}k` : `$${v}`
        }
      }
    }
  }), [])

  // ---- Vendedores (compartido por adeudos y ranking) ----
  const [sellers, setSellers] = useState([])
  const [loadingSellers, setLoadingSellers] = useState(true)
  const [rankingMetric, setRankingMetric] = useState('monto')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await sellersService.getAll()
        setSellers(res.data || [])
      } catch (err) {
        console.error('Error al cargar vendedores:', err)
      } finally {
        setLoadingSellers(false)
      }
    }
    load()
  }, [])

  const adeudos = useMemo(() => {
    return sellers
      .map(s => {
        const assigned = s.stats?.commissionAssigned || 0
        const pending = s.stats?.commissionPending || 0
        const paidPct = assigned > 0 ? Math.round(((assigned - pending) / assigned) * 100) : 0
        return { _id: s._id, name: s.name, contractsCount: s.stats?.contractsCount || 0, pending, paidPct }
      })
      .filter(s => s.pending > 0)
      .sort((a, b) => b.pending - a.pending)
  }, [sellers])

  const totalAdeudado = adeudos.reduce((a, s) => a + s.pending, 0)
  const maxAdeudo = Math.max(1, ...adeudos.map(s => s.pending))

  const ranking = useMemo(() => {
    const rows = sellers.map(s => ({
      _id: s._id,
      name: s.name,
      totalSales: s.stats?.totalSales || 0,
      contractsCount: s.stats?.contractsCount || 0
    }))
    return rows.sort((a, b) => rankingMetric === 'monto'
      ? b.totalSales - a.totalSales
      : b.contractsCount - a.contractsCount)
  }, [sellers, rankingMetric])

  const maxRankingValue = Math.max(1, ...ranking.map(s => rankingMetric === 'monto' ? s.totalSales : s.contractsCount))

  return (
    <div className="animate-fadeIn">
      <PageHeader title="Reportes" subtitle="Ventas, cobranza y comisiones del negocio" />

      {/* Selector de reporte */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap"
              style={isActive
                ? { background: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff' }
                : { background: 'var(--color-surface-raised)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
              }
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ===================== VENDIDO VS COBRADO ===================== */}
      {activeTab === 'ventas' && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Vendido', value: formatUSD(salesTotals.sold), color: 'var(--color-text)' },
              { label: 'Cobrado', value: formatUSD(salesTotals.collected), color: 'var(--color-success)' },
              { label: '% cobrado', value: `${salesTotals.pct}%`, color: 'var(--color-accent)' },
              { label: 'Saldo pendiente', value: formatUSD(salesTotals.pending), color: 'var(--color-warning)' },
            ].map((kpi, i) => (
              <div key={i} className="p-4 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{kpi.label}</p>
                <p className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Vendido vs cobrado</h3>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {[
                { value: 'year', label: 'Este año' },
                { value: 'month', label: 'Este mes' },
                { value: 'custom', label: 'Personalizado' },
              ].map(p => (
                <button
                  key={p.value}
                  onClick={() => { setPreset(p.value); setGroupBy(p.value === 'month' ? 'week' : 'month') }}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
                  style={preset === p.value
                    ? { background: 'var(--color-accent)', borderColor: 'var(--color-accent)', color: '#201404' }
                    : { background: 'white', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                  }
                >
                  {p.label}
                </button>
              ))}
              <div className="ml-auto flex border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                {[{ value: 'month', label: 'Mes' }, { value: 'week', label: 'Semana' }].map(g => (
                  <button
                    key={g.value}
                    onClick={() => setGroupBy(g.value)}
                    className="px-2.5 py-1.5 text-[11px] font-semibold"
                    style={groupBy === g.value ? { background: 'var(--color-primary)', color: '#fff' } : { background: 'white', color: 'var(--color-text-muted)' }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {preset === 'custom' && (
              <div className="flex items-center gap-3 flex-wrap mb-4 p-3 rounded-lg" style={{ background: 'var(--color-surface)' }}>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Desde</label>
                  <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="px-2 py-1 text-xs rounded-md border bg-white" style={{ borderColor: 'var(--color-border)' }} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Hasta</label>
                  <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="px-2 py-1 text-xs rounded-md border bg-white" style={{ borderColor: 'var(--color-border)' }} />
                </div>
              </div>
            )}

            {loadingSales ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
              </div>
            ) : salesData.length === 0 ? (
              <p className="text-sm text-center py-16" style={{ color: 'var(--color-text-muted)' }}>Sin datos para este periodo</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div style={{ height: 260, minWidth: 420 }}>
                    <Chart type="bar" data={chartData} options={chartOptions} />
                  </div>
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-xs" style={{ minWidth: 420 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                        {['Periodo', 'Vendido', 'Cobrado', 'Saldo'].map((h, i) => (
                          <th key={i} className={`py-2 font-semibold uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`} style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((row, i) => {
                        const balance = row.sold - row.collected
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                            <td className="py-2">{formatPeriodLabel(row.period)}</td>
                            <td className="py-2 text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatUSD(row.sold)}</td>
                            <td className="py-2 text-right font-semibold" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-success)' }}>{formatUSD(row.collected)}</td>
                            <td className="py-2 text-right font-semibold" style={{ fontVariantNumeric: 'tabular-nums', color: balance > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatUSD(balance)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===================== ADEUDOS A VENDEDORES ===================== */}
      {activeTab === 'adeudos' && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total adeudado', value: formatUSD(totalAdeudado), color: 'var(--color-warning)' },
              { label: 'Vendedores con saldo', value: adeudos.length, color: 'var(--color-text)' },
              { label: 'Mayor adeudo', value: formatUSD(adeudos[0]?.pending || 0), color: 'var(--color-danger)' },
            ].map((kpi, i) => (
              <div key={i} className="p-4 rounded-xl border bg-white" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{kpi.label}</p>
                <p className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Comisión pendiente por vendedor</h3>
            {loadingSellers ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
              </div>
            ) : adeudos.length === 0 ? (
              <div className="text-center py-12">
                <Wallet size={28} className="mx-auto mb-2" style={{ color: 'var(--color-success)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No hay comisiones pendientes de pago</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {adeudos.map((s, idx) => (
                  <div key={s._id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={idx === 0 ? { background: 'var(--color-accent)', color: '#201404' } : { background: 'var(--color-primary)', color: '#fff' }}
                    >
                      {initialsOf(s.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{s.name}</p>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{s.contractsCount} contratos · {s.paidPct}% pagado</p>
                      <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: 'var(--color-border-light)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round(s.pending / maxAdeudo * 100)}%`, background: 'var(--color-accent)' }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>{formatUSD(s.pending)}</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>pendiente</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== RANKING DE VENDEDORES ===================== */}
      {activeTab === 'ranking' && (
        <div className="animate-fadeIn">
          <div className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Ranking de vendedores</h3>
            </div>
            <div className="flex items-center gap-1.5 mb-4">
              {[{ value: 'monto', label: 'Monto vendido' }, { value: 'contratos', label: '# de contratos' }].map(m => (
                <button
                  key={m.value}
                  onClick={() => setRankingMetric(m.value)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border transition-all"
                  style={rankingMetric === m.value
                    ? { background: 'var(--color-accent)', borderColor: 'var(--color-accent)', color: '#201404' }
                    : { background: 'white', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>

            {loadingSellers ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
              </div>
            ) : ranking.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: 'var(--color-text-muted)' }}>Aún no hay vendedores con contratos</p>
            ) : (
              <div className="flex flex-col gap-3">
                {ranking.map((s, idx) => {
                  const value = rankingMetric === 'monto' ? s.totalSales : s.contractsCount
                  return (
                    <div key={s._id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                          {initialsOf(s.name)}
                        </div>
                        <div
                          className="absolute -top-1 -left-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{
                            background: idx === 0 ? 'var(--color-accent)' : 'var(--color-surface-sunken)',
                            color: idx === 0 ? '#201404' : 'var(--color-text-muted)',
                            border: '1.5px solid var(--color-surface-raised)'
                          }}
                        >
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{s.name}</p>
                        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{rankingMetric === 'monto' ? `${s.contractsCount} contratos` : formatUSD(s.totalSales)}</p>
                        <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: 'var(--color-border-light)' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.round(value / maxRankingValue * 100)}%`, background: 'var(--color-accent)' }} />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold" style={{ color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
                          {rankingMetric === 'monto' ? formatUSD(value) : value}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== PRÓXIMAMENTE (ROADMAP) ===================== */}
      {activeTab === 'roadmap' && (
        <div className="animate-fadeIn">
          <div className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Próximas ampliaciones propuestas</h3>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>No incluidas en esta primera versión</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROADMAP.map((item, i) => (
                <div key={i} className="flex gap-3 p-3.5 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
                    <item.icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[13px] font-bold mb-0.5" style={{ color: 'var(--color-text)' }}>{item.title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
