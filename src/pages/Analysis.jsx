import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Loader2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, Radar, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { fetchEmployees, fetchWarehouses, fetchBins, fetchParts, fetchBackorders } from '../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const AnalysisCard = ({ title, children, className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const Analysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    employeeType: [],
    departmentDistribution: [],
    partTypes: [],
    warehouseCapacity: [],
    backorderStatus: [],
    inventoryHealth: [],
    employeeStats: {},
    partStats: {},
    warehouseStats: {}
  });

  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setLoading(true);
        const [employees, warehouses, bins, parts, backorders] = await Promise.all([
          fetchEmployees(),
          fetchWarehouses(),
          fetchBins(),
          fetchParts(),
          fetchBackorders()
        ]);

        // Process Employee Data
        const employeeTypes = employees.reduce((acc, emp) => {
          const existing = acc.find(e => e.name === emp.type);
          if (existing) {
            existing.value += 1;
          } else {
            acc.push({ name: emp.type, value: 1 });
          }
          return acc;
        }, []);

        // Process Department Distribution
        const departments = employees.reduce((acc, emp) => {
          const existing = acc.find(d => d.name === emp.department);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ name: emp.department, count: 1 });
          }
          return acc;
        }, []);

        // Process Part Types
        const partTypes = parts.reduce((acc, part) => {
          const existing = acc.find(p => p.name === part.type);
          if (existing) {
            existing.count += 1;
            existing.stock += part.stock;
          } else {
            acc.push({ name: part.type, count: 1, stock: part.stock });
          }
          return acc;
        }, []);

        // Process Warehouse Capacity
        const warehouseCapacity = warehouses.map(wh => {
          const warehouseBins = bins.filter(b => b.warehouse === wh.warehouse_id);
          const totalCapacity = warehouseBins.reduce((sum, b) => sum + (b.capacity || 0), 0);
          const usedCapacity = warehouseBins.reduce((sum, b) => sum + (b.capacity - b.remaining), 0);
          return {
            name: wh.warehouse_id,
            used: usedCapacity,
            available: totalCapacity - usedCapacity,
            total: totalCapacity
          };
        });

        // Process Backorder Status
        const backorderStatus = backorders.reduce((acc, bo) => {
          const existing = acc.find(b => b.status === bo.status);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ status: bo.status, count: 1 });
          }
          return acc;
        }, []);

        // Process Inventory Health
        const inventoryHealth = parts.slice(0, 8).map(p => ({
          name: p.part_no.substring(0, 8),
          stock: p.stock,
          price: p.price || 0
        }));

        // Calculate statistics
        const employeeStats = {
          total: employees.length,
          managers: employees.filter(e => e.type === 'Manager').length,
          workers: employees.filter(e => e.type === 'Worker').length,
          avgPerDept: (employees.length / departments.length).toFixed(1)
        };

        const partStats = {
          total: parts.length,
          totalStock: parts.reduce((sum, p) => sum + p.stock, 0),
          avgStock: (parts.reduce((sum, p) => sum + p.stock, 0) / parts.length).toFixed(1),
          types: parts.length > 0 ? [...new Set(parts.map(p => p.type))].length : 0
        };

        const warehouseStats = {
          total: warehouses.length,
          totalBins: bins.length,
          avgCapacity: (bins.reduce((sum, b) => sum + (b.capacity || 0), 0) / bins.length).toFixed(0)
        };

        setChartData({
          employeeType: employeeTypes,
          departmentDistribution: departments,
          partTypes: partTypes,
          warehouseCapacity: warehouseCapacity,
          backorderStatus: backorderStatus.map(b => ({ name: b.status, value: b.count })),
          inventoryHealth: inventoryHealth,
          employeeStats,
          partStats,
          warehouseStats
        });

        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load analysis data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysisData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Analysis</h2>
        <p className="text-muted-foreground mt-1 text-sm">Comprehensive analysis of warehouse management system data with interactive visualizations.</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-9">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.employeeStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Managers: {chartData.employeeStats.managers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.partStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Stock: {chartData.partStats.totalStock}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Warehouses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.warehouseStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Bins: {chartData.warehouseStats.totalBins}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Employee Type Distribution */}
        <AnalysisCard title="Employee Type Distribution">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.employeeType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.employeeType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnalysisCard>

        {/* Backorder Status */}
        <AnalysisCard title="Backorder Status Distribution">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.backorderStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.backorderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnalysisCard>
      </div>

      {/* Department and Part Types */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Department Distribution */}
        <AnalysisCard title="Employee Distribution by Department">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalysisCard>

        {/* Part Types */}
        <AnalysisCard title="Parts Distribution by Type">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.partTypes}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalysisCard>
      </div>

      {/* Warehouse and Inventory */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Warehouse Capacity */}
        <AnalysisCard title="Warehouse Capacity Analysis">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.warehouseCapacity} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Bar dataKey="used" fill="hsl(var(--destructive))" stackId="a" />
                <Bar dataKey="available" fill="hsl(var(--accent))" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalysisCard>

        {/* Inventory Health */}
        <AnalysisCard title="Top Parts by Stock Level">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.inventoryHealth} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="stock" fill="hsl(var(--primary)/0.3)" stroke="hsl(var(--primary))" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalysisCard>
      </div>

      {/* Detailed Statistics Table */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Employees:</span>
              <span className="font-semibold">{chartData.employeeStats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Managers:</span>
              <span className="font-semibold text-blue-600">{chartData.employeeStats.managers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Workers:</span>
              <span className="font-semibold text-green-600">{chartData.employeeStats.workers}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm text-muted-foreground">Avg per Dept:</span>
              <span className="font-semibold">{chartData.employeeStats.avgPerDept}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Parts:</span>
              <span className="font-semibold">{chartData.partStats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Stock:</span>
              <span className="font-semibold text-green-600">{chartData.partStats.totalStock}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Stock:</span>
              <span className="font-semibold">{chartData.partStats.avgStock}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-sm text-muted-foreground">Part Types:</span>
              <span className="font-semibold">{chartData.partStats.types}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Warehouse Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Warehouses:</span>
              <span className="font-semibold">{chartData.warehouseStats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Bins:</span>
              <span className="font-semibold text-blue-600">{chartData.warehouseStats.totalBins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Capacity:</span>
              <span className="font-semibold">{chartData.warehouseStats.avgCapacity}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analysis;
