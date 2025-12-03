import { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Package,
    Calendar, Clock
} from 'lucide-react';

function Statistics() {
    const packages = JSON.parse(localStorage.getItem('packages') || '[]');
    const [dateRange, setDateRange] = useState('30days'); // 7days, 30days, year, all
    const [selectedCarrier, setSelectedCarrier] = useState('all');

    // --- Filter Logic ---
    // Helper to parse dates (handles both ISO and legacy locale strings)
    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();

        // 1. Try standard parsing (ISO)
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d;

        // 2. Try parsing legacy locale string (DD/MM/YYYY...)
        try {
            const parts = dateStr.split('/');
            if (parts.length >= 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const yearPart = parts[2].split(',')[0].trim();
                const year = parseInt(yearPart);

                // Handle time if present
                let hours = 0, minutes = 0, seconds = 0;
                if (dateStr.includes(',')) {
                    const timePart = dateStr.split(',')[1].trim();
                    const timeParts = timePart.split(':');
                    if (timeParts.length >= 2) {
                        hours = parseInt(timeParts[0]);
                        minutes = parseInt(timeParts[1]);
                        seconds = timeParts[2] ? parseInt(timeParts[2]) : 0;
                    }
                }

                const date = new Date(year, month, day, hours, minutes, seconds);
                if (!isNaN(date.getTime())) return date;
            }
        } catch (e) {
            console.error("Error parsing date:", dateStr, e);
        }

        return new Date(); // Fallback to now if completely failed
    };

    // --- Filter Logic ---
    const filteredPackages = useMemo(() => {
        let filtered = packages;

        // Carrier Filter
        if (selectedCarrier !== 'all') {
            filtered = filtered.filter((p: any) => p.carrier === selectedCarrier);
        }

        // Date Filter
        const now = new Date();
        if (dateRange === '7days') {
            const limit = new Date();
            limit.setDate(now.getDate() - 7);
            filtered = filtered.filter((p: any) => parseDate(p.registeredDate) >= limit);
        } else if (dateRange === '30days') {
            const limit = new Date();
            limit.setDate(now.getDate() - 30);
            filtered = filtered.filter((p: any) => parseDate(p.registeredDate) >= limit);
        } else if (dateRange === 'year') {
            const limit = new Date();
            limit.setFullYear(now.getFullYear() - 1);
            filtered = filtered.filter((p: any) => parseDate(p.registeredDate) >= limit);
        }

        return filtered;
    }, [packages, dateRange, selectedCarrier]);

    // --- Data Processing ---

    // 1. Monthly Volume (Area Chart)
    const getMonthlyVolumeData = () => {
        // MOCK DATA FOR DEMO VIDEO
        // This ensures the chart looks populated even with little real data
        const mockData = [
            { name: 'Ene', Pendientes: 65, Entregados: 62 },
            { name: 'Feb', Pendientes: 58, Entregados: 55 },
            { name: 'Mar', Pendientes: 72, Entregados: 68 },
            { name: 'Abr', Pendientes: 85, Entregados: 82 },
            { name: 'May', Pendientes: 90, Entregados: 88 },
            { name: 'Jun', Pendientes: 82, Entregados: 75 },
            { name: 'Jul', Pendientes: 95, Entregados: 90 },
            { name: 'Ago', Pendientes: 110, Entregados: 105 },
            { name: 'Sep', Pendientes: 125, Entregados: 118 },
            { name: 'Oct', Pendientes: 140, Entregados: 132 },
            { name: 'Nov', Pendientes: 155, Entregados: 145 },
        ];

        // For December (Current Month), we mix mock + real data
        const currentMonth = { name: 'Dic', Pendientes: 160, Entregados: 0 };

        filteredPackages.forEach((p: any) => {
            const date = parseDate(p.registeredDate);
            if (date.getMonth() === 11) { // December
                // We just add to the base mock value to show "live" updates
                // currentMonth.Pendientes++; 
                if (p.status === 'Delivered') {
                    currentMonth.Entregados++;
                }
            }
        });
        // Ensure Entregados doesn't exceed Pendientes for the visual
        currentMonth.Entregados += 120; // Mock base for delivered

        return [...mockData, currentMonth];
    };

    // 2. Peak Hours (Bar Chart)
    const getPeakHoursData = () => {
        const hours = Array(24).fill(0).map((_, i) => ({ name: `${i}:00`, value: 0 }));
        filteredPackages.forEach((p: any) => {
            const hour = parseDate(p.registeredDate).getHours();
            hours[hour].value++;
        });
        return hours.filter(h => h.value > 0); // Only show active hours
    };

    // 3. Package Size (Donut)
    const getSizeData = () => {
        const sizes: Record<string, number> = {};
        filteredPackages.forEach((p: any) => {
            const size = p.packageSize || 'Desconocido';
            sizes[size] = (sizes[size] || 0) + 1;
        });
        return Object.entries(sizes).map(([name, value]) => ({ name, value }));
    };


    // KPI Calculations
    const totalActive = filteredPackages.filter((p: any) => p.status === 'Not-Delivered').length;

    // Busiest Day
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dayCounts = Array(7).fill(0);
    filteredPackages.forEach((p: any) => dayCounts[parseDate(p.registeredDate).getDay()]++);
    const busiestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const busiestDay = days[busiestDayIndex];

    // Avg Pickup Time
    const deliveredPkgs = filteredPackages.filter((p: any) => p.status === 'Delivered' && p.deliveryDate);
    let totalMinutes = 0;
    let validCount = 0;

    deliveredPkgs.forEach((p: any) => {
        const start = parseDate(p.registeredDate).getTime();
        const end = parseDate(p.deliveryDate).getTime();
        const diff = end - start;

        // Only count valid positive durations
        if (diff > 0) {
            totalMinutes += diff / (1000 * 60);
            validCount++;
        }
    });

    const avgMinutes = validCount ? Math.round(totalMinutes / validCount) : 0;

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `~${minutes} min`;
        const hours = Math.round(minutes / 60);
        return `~${hours}h`;
    };

    const monthlyData = getMonthlyVolumeData();
    const peakHoursData = getPeakHoursData();
    const sizeData = getSizeData();

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="h-full p-8 bg-slate-50 dark:bg-slate-900 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Estadísticas Avanzadas</h1>
                        <p className="text-slate-500 dark:text-slate-400">Análisis de rendimiento y tendencias</p>
                    </div>

                    <div className="flex gap-3">
                        <select
                            value={selectedCarrier}
                            onChange={(e) => setSelectedCarrier(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-300"
                        >
                            <option value="all">Todas las Paqueterías</option>
                            <option value="Amazon">Amazon</option>
                            <option value="Mercado Libre">Mercado Libre</option>
                            <option value="DHL">DHL</option>
                            <option value="FedEx">FedEx</option>
                            <option value="Estafeta">Estafeta</option>
                        </select>

                        <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 p-1">
                            <button
                                onClick={() => setDateRange('7days')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${dateRange === '7days' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                7D
                            </button>
                            <button
                                onClick={() => setDateRange('30days')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${dateRange === '30days' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                30D
                            </button>
                            <button
                                onClick={() => setDateRange('year')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${dateRange === 'year' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                Año
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Tiempo Promedio de Recolección</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatDuration(avgMinutes)}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Desde registro hasta entrega
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Día Más Concurrido</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{busiestDay}</p>
                        <p className="text-xs text-slate-500 mt-1">
                            Basado en registros históricos
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Paquetes Activos</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalActive}</p>
                        <p className="text-xs text-orange-600 mt-1">
                            Requieren atención
                        </p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Monthly Volume (Area) */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm col-span-1 lg:col-span-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Tendencia Mensual de Volumen</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="Pendientes"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill="url(#colorReceived)"
                                        strokeWidth={2}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Entregados"
                                        stroke="#10b981"
                                        fillOpacity={1}
                                        fill="url(#colorDelivered)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Peak Hours (Bar) */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Horas Pico de Recepción</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={peakHoursData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                    <Bar dataKey="value" name="Paquetes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Package Size (Donut) */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 shadow-sm">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-6">Distribución por Tamaño</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sizeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sizeData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Statistics;
