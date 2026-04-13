import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, FileText, DollarSign, Users,
  AlertTriangle, Clock, CheckCircle, TrendingUp,
  ChevronRight, Calendar
} from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import paymentsService from '@/services/paymentsService'

const formatPrice = (n) => n ? `$${Number(n).toLocaleString('es-MX')}` : '$0'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) : '—'

const Dashboard = () => {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(null)
  const [loading, setLoading] = useState(true)

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
      label: 'Cobrado este mes',
      value: alerts?.collected?.count || 0,
      sub: formatPrice(alerts?.collected?.total),
      icon: CheckCircle,
      color: 'var(--color-success)',
      bg: 'var(--color-success-bg)'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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