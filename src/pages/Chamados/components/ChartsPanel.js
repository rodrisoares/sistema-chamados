import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { STATUS_COR } from '@/utils/status';
import { DIAS_GRAFICO } from '../metrics';

// Área de gráficos / indicadores
export default function ChartsPanel({ grafico, graficoTemDados, pizzaPrioridade, tempoMedioTexto, resolvidosCount }){
  return(
    <div className="charts-row">
      {graficoTemDados && (
        <div className="chart-panel chart-panel-lg">
          <h3 className="chart-title">Chamados por período — últimos {DIAS_GRAFICO} dias</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={grafico} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#888' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#888' }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(53,131,246,0.08)' }}
                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
                labelStyle={{ color: 'var(--text)', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="Aberto" stackId="s" fill={STATUS_COR['Aberto']} maxBarSize={28} />
              <Bar dataKey="Em Atendimento" stackId="s" fill={STATUS_COR['Em Atendimento']} maxBarSize={28} />
              <Bar dataKey="Finalizado" stackId="s" fill={STATUS_COR['Finalizado']} maxBarSize={28} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="chart-panel chart-panel-sm">
        <h3 className="chart-title">Por prioridade</h3>
        {pizzaPrioridade.length > 0 ? (
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={pizzaPrioridade} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                {pizzaPrioridade.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="chart-empty">Sem dados.</p>
        )}

        <div className="kpi">
          <span className="kpi-label">Tempo médio de resolução</span>
          <span className="kpi-value">{tempoMedioTexto}</span>
          <span className="kpi-sub">{resolvidosCount} chamado(s) finalizado(s)</span>
        </div>
      </div>
    </div>
  )
}
