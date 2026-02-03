import { usePromotionViewStats } from '@/hooks/usePromotionViews';
import { usePromotions } from '@/hooks/usePromotions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowLeft, Eye, TrendingUp, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const COLORS = ['#5a7a5a', '#c4423b', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function PromotionReports() {
  const { data: viewStats, isLoading: loadingStats } = usePromotionViewStats();
  const { data: promotions, isLoading: loadingPromotions } = usePromotions();

  const isLoading = loadingStats || loadingPromotions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalViews = viewStats?.reduce((sum, stat) => sum + stat.view_count, 0) || 0;
  const topPromotion = viewStats?.reduce((top, stat) => 
    stat.view_count > (top?.view_count || 0) ? stat : top, 
    viewStats[0]
  );
  const activePromotions = promotions?.filter(p => p.is_active).length || 0;

  const chartData = viewStats?.map(stat => ({
    name: stat.promotion_title.length > 15 
      ? stat.promotion_title.substring(0, 15) + '...' 
      : stat.promotion_title,
    views: stat.view_count,
  })).sort((a, b) => b.views - a.views).slice(0, 10) || [];

  const pieData = viewStats?.filter(s => s.view_count > 0).map(stat => ({
    name: stat.promotion_title.length > 20 
      ? stat.promotion_title.substring(0, 20) + '...' 
      : stat.promotion_title,
    value: stat.view_count,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/promocoes">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios de Promoções</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho das suas promoções</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Em todas as promoções</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promoção Mais Vista</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {topPromotion?.promotion_title || 'Nenhuma'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topPromotion?.view_count.toLocaleString('pt-BR') || 0} visualizações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promoções Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePromotions}</div>
            <p className="text-xs text-muted-foreground">
              De {promotions?.length || 0} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Visualizações por Promoção</CardTitle>
            <CardDescription>Top 10 promoções mais vistas</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Visualizações']}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma visualização registrada ainda
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Visualizações</CardTitle>
            <CardDescription>Proporção entre promoções</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Visualizações']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma visualização registrada ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Promoção</CardTitle>
          <CardDescription>Todas as promoções e suas visualizações</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promoção</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Visualizações</TableHead>
                <TableHead className="text-right">% do Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewStats?.sort((a, b) => b.view_count - a.view_count).map((stat) => {
                const promotion = promotions?.find(p => p.id === stat.promotion_id);
                const percentage = totalViews > 0 
                  ? ((stat.view_count / totalViews) * 100).toFixed(1) 
                  : '0.0';
                
                return (
                  <TableRow key={stat.promotion_id}>
                    <TableCell className="font-medium">{stat.promotion_title}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        promotion?.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {promotion?.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {stat.view_count.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {percentage}%
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!viewStats || viewStats.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhuma promoção encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
