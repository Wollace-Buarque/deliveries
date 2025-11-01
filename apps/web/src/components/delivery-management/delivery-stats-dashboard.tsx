import { getMyStats } from '@/app/actions/deliveries'
import {
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconPackage,
  IconChecks,
  IconTruck,
  IconCurrencyDollar,
  IconCalendar,
  IconChartBar
} from '@tabler/icons-react'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export async function DeliveryStatsDashboard() {
  const statsResponse = await getMyStats()

  if (!statsResponse.success || !statsResponse.data) {
    return null
  }

  const { overview, earnings, performance, trends } = statsResponse.data

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-zinc-800">Suas Estatísticas</h2>
        <p className="text-sm text-zinc-600">Acompanhe seu desempenho e ganhos</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total de entregas</p>
              <p className="mt-2 text-3xl font-bold text-blue-900">{overview.totalDeliveries}</p>
            </div>
            <IconPackage className="text-blue-400" size={48} stroke={1.5} />
          </div>
        </div>

        <div className="rounded-lg bg-green-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Concluídas</p>
              <p className="mt-2 text-3xl font-bold text-green-900">{overview.completedDeliveries}</p>
            </div>
            <IconChecks className="text-green-400" size={48} stroke={1.5} />
          </div>
        </div>

        <div className="rounded-lg bg-violet-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-violet-700">Em andamento</p>
              <p className="mt-2 text-3xl font-bold text-violet-900">{overview.activeDeliveries}</p>
            </div>
            <IconTruck className="text-violet-400" size={48} stroke={1.5} />
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Taxa de sucesso</p>
              <p className="mt-2 text-3xl font-bold text-emerald-900">{overview.successRate}%</p>
            </div>
            <IconChartBar className="text-emerald-400" size={48} stroke={1.5} />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-4 text-xl font-semibold text-zinc-800">Ganhos</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <IconCurrencyDollar size={24} />
              <p className="text-sm font-medium opacity-90">Ganhos totais</p>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(earnings.total)}</p>
          </div>

          <div className="rounded-lg bg-zinc-50 p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center gap-2 mb-2">
              <IconCalendar size={20} className="text-zinc-600" />
              <p className="text-sm font-medium text-zinc-700">Este mês</p>
            </div>
            <p className="text-3xl font-bold text-zinc-900">{formatCurrency(earnings.thisMonth)}</p>
            <p className="mt-2 text-xs text-zinc-600">
              Mês passado: {formatCurrency(earnings.lastMonth)}
            </p>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <IconTrendingUp size={20} />
              <p className="text-sm font-medium opacity-90">Projeção mensal</p>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(earnings.projectedMonthly)}</p>
            <p className="mt-2 text-xs opacity-80">
              Baseado no ritmo atual
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-zinc-50 p-4 shadow-sm border border-zinc-200">
            <p className="text-sm font-medium text-zinc-700">Esta semana</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{formatCurrency(earnings.thisWeek)}</p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-4 shadow-sm border border-zinc-200">
            <p className="text-sm font-medium text-zinc-700">Hoje</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">{formatCurrency(earnings.today)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xl font-semibold text-zinc-800">Desempenho</h3>
          <div className="space-y-4">
            <div className="rounded-lg bg-zinc-50 p-4 shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconClock className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm font-medium text-zinc-700">Tempo médio de entrega</p>
                    <p className="text-2xl font-bold text-zinc-900">{performance.averageDeliveryTime} min</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-zinc-50 p-4 shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconChecks className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm font-medium text-zinc-700">Taxa de entregas no prazo</p>
                    <p className="text-2xl font-bold text-zinc-900">{performance.onTimeRate}%</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      {performance.totalOnTime} de {performance.totalDelivered} entregas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xl font-semibold text-zinc-800">Tendências</h3>
          <div className="space-y-4">

            <div className="rounded-lg bg-zinc-50 p-4 shadow-sm border border-zinc-200">
              <p className="text-sm font-medium text-zinc-700 mb-3">Entregas semanais</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{trends.deliveriesThisWeek}</p>
                  <p className="text-xs text-zinc-600">esta semana</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {trends.weeklyGrowth >= 0 ? (
                      <>
                        <IconTrendingUp className="text-green-600" size={20} />
                        <span className="text-lg font-bold text-green-600">+{trends.weeklyGrowth}%</span>
                      </>
                    ) : (
                      <>
                        <IconTrendingDown className="text-red-600" size={20} />
                        <span className="text-lg font-bold text-red-600">{trends.weeklyGrowth}%</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600">{trends.deliveriesLastWeek} semana passada</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-zinc-50 p-4 shadow-sm border border-zinc-200">
              <p className="text-sm font-medium text-zinc-700 mb-3">Entregas mensais</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{trends.deliveriesThisMonth}</p>
                  <p className="text-xs text-zinc-600">este mês</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {trends.monthlyGrowth >= 0 ? (
                      <>
                        <IconTrendingUp className="text-green-600" size={20} />
                        <span className="text-lg font-bold text-green-600">+{trends.monthlyGrowth}%</span>
                      </>
                    ) : (
                      <>
                        <IconTrendingDown className="text-red-600" size={20} />
                        <span className="text-lg font-bold text-red-600">{trends.monthlyGrowth}%</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600">{trends.deliveriesLastMonth} mês passado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

