import PageHeader from '@/components/common/PageHeader'
import { Building2, FileText, DollarSign, Users } from 'lucide-react'

const cards = [
  { label: 'Unidades', value: '—', sub: 'Próximamente', icon: Building2, color: 'var(--color-primary)' },
  { label: 'Contratos', value: '—', sub: 'Próximamente', icon: FileText, color: 'var(--color-accent)' },
  { label: 'Pagos del mes', value: '—', sub: 'Próximamente', icon: DollarSign, color: 'var(--color-success)' },
  { label: 'Usuarios', value: '—', sub: 'Próximamente', icon: Users, color: 'var(--color-info)' },
]

const Dashboard = () => {
  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Dashboard"
        subtitle="Panel de control general"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border bg-white"
            style={{ borderColor: 'var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{c.label}</span>
              <c.icon size={18} style={{ color: c.color }} />
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{c.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div
        className="mt-8 p-8 rounded-xl border border-dashed flex flex-col items-center justify-center text-center"
        style={{ borderColor: 'var(--color-border)', minHeight: 300 }}
      >
        <Building2 size={48} style={{ color: 'var(--color-border)' }} />
        <p className="text-lg font-medium mt-4" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)' }}>
          Módulos en desarrollo
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          El dashboard se poblará conforme se activen los módulos de unidades, contratos y pagos
        </p>
      </div>
    </div>
  )
}

export default Dashboard
