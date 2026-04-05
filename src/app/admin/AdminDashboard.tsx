"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingBag,
  BarChart3,
  Users,
  Star,
  Clock,
  Package,
  RefreshCw,
  ChevronRight,
  Activity,
  Utensils,
  Home,
  Store,
  Wallet,
  Plus,
  Trash2,
  Filter,
  CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
interface DailyStat {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
}
interface Product {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
}
interface Branch {
  id: string;
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
  avgOrderValue: number;
  rating: number;
}
interface HourlyData {
  hour: string;
  orders: number;
}
interface RecentOrder {
  id: string;
  branch: string;
  items: number;
  total: number;
  status: string;
  time: string;
}
interface Summary {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  avgOrderValue: number;
  profitMargin: number;
  activeProducts: number;
  activeBranches: number;
}
interface ReportData {
  summary: Summary;
  daily: DailyStat[];
  topProducts: Product[];
  branches: Branch[];
  hourly: HourlyData[];
  recentOrders: RecentOrder[];
}

// ─── Expense Types ────────────────────────────────────────────
interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  branchId: string;
  branch: { name: string };
  paymentMethod: string;
}

const EXPENSE_CATEGORIES = [
  "Raw Materials",
  "Salaries",
  "Utilities",
  "Rent",
  "Equipment",
  "Marketing",
  "Maintenance",
  "Packaging",
  "Transport",
  "Other",
];

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "UPI", "Credit Card", "Cheque"];

const BRANCHES_LIST = [
  "Main Branch – Ahmedabad",
  "West Branch – Surat",
  "City Center – Vadodara",
  "All Branches",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Raw Materials": "bg-indigo-500",
  "Salaries": "bg-violet-500",
  "Utilities": "bg-amber-500",
  "Rent": "bg-rose-500",
  "Equipment": "bg-sky-500",
  "Marketing": "bg-pink-500",
  "Maintenance": "bg-orange-500",
  "Packaging": "bg-teal-500",
  "Transport": "bg-lime-500",
  "Other": "bg-gray-400",
};

const CATEGORY_TEXT: Record<string, string> = {
  "Raw Materials": "text-indigo-600 bg-indigo-50",
  "Salaries": "text-violet-600 bg-violet-50",
  "Utilities": "text-amber-600 bg-amber-50",
  "Rent": "text-rose-600 bg-rose-50",
  "Equipment": "text-sky-600 bg-sky-50",
  "Marketing": "text-pink-600 bg-pink-50",
  "Maintenance": "text-orange-600 bg-orange-50",
  "Packaging": "text-teal-600 bg-teal-50",
  "Transport": "text-lime-700 bg-lime-50",
  "Other": "text-gray-600 bg-gray-100",
};



// ─── Helpers ──────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const statusColors: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PREPARING: "bg-amber-100 text-amber-700",
  READY: "bg-blue-100 text-blue-700",
  PENDING: "bg-gray-100 text-gray-600",
};

// ─── SVG Line Chart ───────────────────────────────────────────
function LineChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const W = 560;
  const H = 120;
  const pad = 8;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = [
    `${pad},${H - pad}`,
    ...data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      return `${x},${y}`;
    }),
    `${W - pad},${H - pad}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${label})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────
function BarChart({ data }: { data: HourlyData[] }) {
  const W = 640;
  const H = 140;
  const padX = 4;
  const padY = 10;
  const max = Math.max(...data.map((d) => d.orders));
  const barW = (W - padX * 2) / data.length - 3;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
      {data.map((d, i) => {
        const bH = ((d.orders / max) * (H - padY - 20));
        const x = padX + i * ((W - padX * 2) / data.length);
        const y = H - padY - bH;
        const isPeak = d.orders === max;
        return (
          <g key={d.hour}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={bH}
              rx={4}
              fill={isPeak ? "#6366f1" : "#818cf8"}
              opacity={0.85}
            />
            {i % 3 === 0 && (
              <text x={x + barW / 2} y={H - 2} textAnchor="middle" fontSize={9} fill="#94a3b8">
                {d.hour.slice(0, 2)}h
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────
function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500 tracking-wide uppercase">{title}</span>
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </span>
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <div className="flex items-center gap-1 mt-1.5">
          {trend === "up" && <TrendingUp size={13} className="text-emerald-500" />}
          {trend === "down" && <TrendingDown size={13} className="text-red-400" />}
          <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-gray-500"}`}>{sub}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────
const ALL_TABS = [
  { id: "overview", label: "Overview", icon: BarChart3, roles: ["SUPER_ADMIN", "BRANCH_ADMIN"] },
  { id: "sales", label: "Sales & Profit", icon: TrendingUp, roles: ["SUPER_ADMIN", "BRANCH_ADMIN"] },
  { id: "branches", label: "Branch Reports", icon: Store, roles: ["SUPER_ADMIN"] },
  { id: "products", label: "Top Products", icon: Package, roles: ["SUPER_ADMIN", "BRANCH_ADMIN"] },
  { id: "orders", label: "Recent Orders", icon: ShoppingBag, roles: ["SUPER_ADMIN", "BRANCH_ADMIN"] },
  { id: "menu-items", label: "Menu Items", icon: Utensils, roles: ["SUPER_ADMIN", "BRANCH_ADMIN"] },
  { id: "expenses", label: "Expenses", icon: Wallet, roles: ["SUPER_ADMIN", "BRANCH_ADMIN"] },
];

// ─── Main Component ───────────────────────────────────────────
const EMPTY_FORM = {
  category: EXPENSE_CATEGORIES[0],
  description: "",
  amount: "",
  branch: BRANCHES_LIST[0],
  paymentMethod: PAYMENT_METHODS[0],
  date: new Date().toISOString().split("T")[0],
};

interface MenuProduct {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  category: { id: string; name: string };
  branchId: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userBranchId, setUserBranchId] = useState<string | null>(null);
  const [userBranchName, setUserBranchName] = useState<string | null>(null);

  // ── Expense state ──
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseForm, setExpenseForm] = useState(EMPTY_FORM);
  const [filterCategory, setFilterCategory] = useState("All");
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Menu Items state ──
  const [menuProducts, setMenuProducts] = useState<MenuProduct[]>([]);
  const [menuForm, setMenuForm] = useState({ name: "", price: "", categoryId: "" });
  const [menuCategories, setMenuCategories] = useState<{ id: string; name: string }[]>([]);
  const [menuFormError, setMenuFormError] = useState("");
  const [menuFormSuccess, setMenuFormSuccess] = useState(false);

  // ── Fetch user role ──
  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setUserRole(data.role);
          setUserBranchId(data.branchId);
          setUserBranchName(data.branchName);
          // KITCHEN users shouldn't be here
          if (data.role === "KITCHEN") {
            window.location.href = "/kitchen";
          }
        } else {
          // If there's an error (e.g. Not authenticated), redirect to login
          window.location.href = "/login";
        }
      })
      .catch((err) => {
        console.error(err);
        window.location.href = "/login";
      });
  }, []);

  const visibleTabs = ALL_TABS.filter((tab) => !userRole || tab.roles.includes(userRole));

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/reports");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch("/api/expenses");
      const json = await res.json();
      if (Array.isArray(json)) setExpenses(json);
    } catch (e) {
      console.error("Failed to fetch expenses:", e);
    }
  }, []);

  const fetchMenuProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (Array.isArray(json)) setMenuProducts(json);
    } catch (e) {
      console.error("Failed to fetch menu products:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchExpenses();
    fetchMenuProducts();
    // Fetch categories for the menu items form
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats) => { if (Array.isArray(cats)) setMenuCategories(cats); })
      .catch(console.error);
  }, [fetchData, fetchExpenses, fetchMenuProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center animate-pulse">
            <Activity size={28} className="text-white" />
          </div>
          <p className="text-slate-600 font-semibold text-lg">Loading Dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;
  if ((data as any).error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-semibold border border-red-100 flex items-center gap-3">
          Error loading dashboard: {(data as any).error}
        </div>
      </div>
    );
  }

  const {
    summary,
    daily = [],
    topProducts = [],
    branches = [],
    hourly = [],
    recentOrders = [],
  } = (data as unknown) as ReportData;

  const revenueData = daily.map((d) => d.revenue);
  const profitData = daily.map((d) => d.profit);
  const ordersData = daily.map((d) => d.orders);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Utensils size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 leading-none">
                Resto<span className="text-indigo-600">Pos</span>
              </h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
              <Clock size={12} />
              Last 30 days
            </span>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <a
              href="/"
              className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors"
            >
              <Home size={14} />
              POS
            </a>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-1 no-scrollbar">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ======= OVERVIEW ======= */}
        {activeTab === "overview" && (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard title="Total Revenue" value={fmt(summary.totalRevenue)} sub="+12.4% vs last month" icon={IndianRupee} trend="up" color="bg-indigo-100 text-indigo-600" />
              <KPICard title="Net Profit" value={fmt(summary.totalProfit)} sub={`${summary.profitMargin}% margin`} icon={TrendingUp} trend="up" color="bg-emerald-100 text-emerald-600" />
              <KPICard title="Total Orders" value={summary.totalOrders.toLocaleString("en-IN")} sub="+8.1% vs last month" icon={ShoppingBag} trend="up" color="bg-amber-100 text-amber-600" />
              <KPICard title="Avg Order Value" value={fmt(summary.avgOrderValue)} sub="Per transaction" icon={BarChart3} trend="neutral" color="bg-rose-100 text-rose-600" />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-black text-indigo-600">{summary.activeBranches}</p>
                <p className="text-sm text-gray-500 font-semibold mt-1">Active Branches</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-black text-emerald-600">{summary.activeProducts}</p>
                <p className="text-sm text-gray-500 font-semibold mt-1">Menu Items</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                <p className="text-3xl font-black text-amber-600">{summary.profitMargin}%</p>
                <p className="text-sm text-gray-500 font-semibold mt-1">Profit Margin</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-black text-gray-800 text-base">Revenue Trend (30d)</h2>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">↑ 12.4%</span>
                </div>
                <div className="h-32 mt-2">
                  <LineChart data={revenueData} color="#6366f1" label="revenue" />
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-black text-gray-800 text-base">Profit Trend (30d)</h2>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">↑ 9.8%</span>
                </div>
                <div className="h-32 mt-2">
                  <LineChart data={profitData} color="#10b981" label="profit" />
                </div>
              </div>
            </div>

            {/* Hourly orders */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-black text-gray-800 text-base mb-1">Orders by Hour (Today)</h2>
              <p className="text-xs text-gray-400 mb-4">Peak lunch & dinner service hours highlighted</p>
              <BarChart data={hourly} />
            </div>

            {/* Branch quick summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-black text-gray-800 text-base">Branch Performance</h2>
                <button onClick={() => setActiveTab("branches")} className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                  View All <ChevronRight size={14} />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {branches.map((b) => (
                  <div key={b.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{b.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{b.orders} orders · avg {fmt(b.avgOrderValue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">{fmt(b.revenue)}</p>
                      <p className="text-xs text-emerald-600 font-semibold">{fmt(b.profit)} profit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ======= SALES & PROFIT ======= */}
        {activeTab === "sales" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard title="Total Revenue" value={fmt(summary.totalRevenue)} sub="Last 30 days" icon={IndianRupee} trend="up" color="bg-indigo-100 text-indigo-600" />
              <KPICard title="Total Cost" value={fmt(summary.totalRevenue - summary.totalProfit)} sub="COGS + Ops" icon={TrendingDown} trend="neutral" color="bg-rose-100 text-rose-600" />
              <KPICard title="Net Profit" value={fmt(summary.totalProfit)} sub={`${summary.profitMargin}% margin`} icon={TrendingUp} trend="up" color="bg-emerald-100 text-emerald-600" />
              <KPICard title="Orders" value={summary.totalOrders.toLocaleString()} sub="Completed" icon={ShoppingBag} trend="up" color="bg-amber-100 text-amber-600" />
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-black text-gray-800 mb-1">Revenue & Profit (30 days)</h2>
              <p className="text-xs text-gray-400 mb-5">Daily breakdown — indigo = revenue, green = profit</p>
              <div className="h-36 mb-2">
                <LineChart data={revenueData} color="#6366f1" label="rev2" />
              </div>
              <div className="h-28">
                <LineChart data={profitData} color="#10b981" label="prof2" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-black text-gray-800 mb-1">Order Volume (30 days)</h2>
              <p className="text-xs text-gray-400 mb-4">Daily order count trend</p>
              <div className="h-32">
                <LineChart data={ordersData} color="#f59e0b" label="orders2" />
              </div>
            </div>

            {/* Daily table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-800">Daily Sales Report</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold text-xs uppercase tracking-wide">
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-right">Revenue</th>
                      <th className="px-6 py-3 text-right">Cost</th>
                      <th className="px-6 py-3 text-right">Profit</th>
                      <th className="px-6 py-3 text-right">Orders</th>
                      <th className="px-6 py-3 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...daily].reverse().map((d) => (
                      <tr key={d.date} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-gray-700">{new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-gray-900">{fmt(d.revenue)}</td>
                        <td className="px-6 py-3.5 text-right text-gray-500">{fmt(d.cost)}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-emerald-600">{fmt(d.profit)}</td>
                        <td className="px-6 py-3.5 text-right text-gray-700">{d.orders}</td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {Math.round((d.profit / d.revenue) * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ======= BRANCHES ======= */}
        {activeTab === "branches" && (
          <>
            <div className="grid gap-6">
              {branches.map((b, idx) => {
                const margin = Math.round((b.profit / b.revenue) * 100);
                return (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 pt-6 pb-4 border-b border-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base ${["bg-indigo-500", "bg-emerald-500", "bg-amber-500"][idx % 3]}`}>
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <h2 className="font-black text-gray-900 text-base">{b.name}</h2>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-gray-500">{b.rating} rating</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">{margin}% margin</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                      {[
                        { label: "Revenue", value: fmt(b.revenue), color: "text-gray-900" },
                        { label: "Cost", value: fmt(b.cost), color: "text-gray-500" },
                        { label: "Net Profit", value: fmt(b.profit), color: "text-emerald-600" },
                        { label: "Orders", value: b.orders.toLocaleString("en-IN"), color: "text-indigo-600" },
                      ].map((stat) => (
                        <div key={stat.label} className="px-6 py-5">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{stat.label}</p>
                          <p className={`text-xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-3 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-semibold">Avg Order Value</span>
                      <span className="text-sm font-black text-gray-700">{fmt(b.avgOrderValue)}</span>
                    </div>
                    {/* Revenue bar */}
                    <div className="px-6 pb-5 pt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Revenue vs Profit split</span>
                        <span>{margin}% profit</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" style={{ width: `${margin}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-800">Branch Comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold text-xs uppercase tracking-wide">
                      <th className="px-6 py-3 text-left">Branch</th>
                      <th className="px-6 py-3 text-right">Revenue</th>
                      <th className="px-6 py-3 text-right">Profit</th>
                      <th className="px-6 py-3 text-right">Orders</th>
                      <th className="px-6 py-3 text-right">Avg Value</th>
                      <th className="px-6 py-3 text-right">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {branches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-800">{b.name}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">{fmt(b.revenue)}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">{fmt(b.profit)}</td>
                        <td className="px-6 py-4 text-right text-gray-700">{b.orders}</td>
                        <td className="px-6 py-4 text-right text-gray-700">{fmt(b.avgOrderValue)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="flex items-center justify-end gap-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="font-bold">{b.rating}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ======= TOP PRODUCTS ======= */}
        {activeTab === "products" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <KPICard title="Menu Items" value={summary.activeProducts.toString()} sub="Active products" icon={Package} trend="neutral" color="bg-indigo-100 text-indigo-600" />
              <KPICard title="Top Earner" value={topProducts[0]?.name.split(" ").slice(0, 2).join(" ") || "—"} sub={fmt(topProducts[0]?.revenue || 0)} icon={Star} trend="up" color="bg-amber-100 text-amber-600" />
              <KPICard title="Total Units Sold" value={topProducts.reduce((s, p) => s + p.unitsSold, 0).toLocaleString("en-IN")} sub="All products combined" icon={Users} trend="up" color="bg-emerald-100 text-emerald-600" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-800">Top Products by Revenue</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {topProducts.map((p, i) => {
                  const maxRev = topProducts[0].revenue;
                  const pct = Math.round((p.revenue / maxRev) * 100);
                  return (
                    <div key={p.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"}`}>
                            #{i + 1}
                          </span>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.unitsSold.toLocaleString("en-IN")} units sold</p>
                          </div>
                        </div>
                        <span className="font-black text-gray-900">{fmt(p.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${i === 0 ? "bg-indigo-500" : i <= 2 ? "bg-indigo-400" : "bg-indigo-300"}`}
                          style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ======= RECENT ORDERS ======= */}
        {activeTab === "orders" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard title="Today's Orders" value={recentOrders.length.toString()} sub="Shown here" icon={ShoppingBag} trend="neutral" color="bg-indigo-100 text-indigo-600" />
              <KPICard title="Avg Value" value={fmt(Math.round(recentOrders.reduce((s, o) => s + o.total, 0) / recentOrders.length))} sub="Per order today" icon={IndianRupee} trend="up" color="bg-emerald-100 text-emerald-600" />
              <KPICard title="Completed" value={recentOrders.filter((o) => o.status === "COMPLETED").length.toString()} sub="Successful" icon={TrendingUp} trend="up" color="bg-amber-100 text-amber-600" />
              <KPICard title="In Progress" value={recentOrders.filter((o) => o.status !== "COMPLETED").length.toString()} sub="Pending/Preparing" icon={Activity} trend="neutral" color="bg-rose-100 text-rose-600" />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-black text-gray-800">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-gray-500 font-bold text-xs uppercase tracking-wide">
                      <th className="px-6 py-3 text-left">Order ID</th>
                      <th className="px-6 py-3 text-left">Branch</th>
                      <th className="px-6 py-3 text-right">Items</th>
                      <th className="px-6 py-3 text-right">Total</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-black text-indigo-600 font-mono">{o.id}</td>
                        <td className="px-6 py-4 text-gray-700 font-medium">{o.branch.split("–")[0].trim()}</td>
                        <td className="px-6 py-4 text-right text-gray-700">{o.items}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">{fmt(o.total)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[o.status]}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 font-semibold">{o.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ======= EXPENSES ======= */}
        {activeTab === "expenses" && (() => {
          const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
          const thisMonth = expenses
            .filter((e) => e.date.startsWith(new Date().toISOString().slice(0, 7)))
            .reduce((s, e) => s + e.amount, 0);

          // Category totals
          const catTotals = EXPENSE_CATEGORIES.map((cat) => ({
            cat,
            total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
          })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
          const maxCat = catTotals[0]?.total || 1;

          const filtered = filterCategory === "All"
            ? expenses
            : expenses.filter((e) => e.category === filterCategory);

          const handleAddExpense = async (ev: React.FormEvent) => {
            ev.preventDefault();
            setFormError("");
            if (!expenseForm.description.trim()) { setFormError("Description is required."); return; }
            const amt = parseFloat(expenseForm.amount);
            if (!amt || amt <= 0) { setFormError("Enter a valid amount."); return; }

            try {
              // Find branchId from branches data
              const matchBranch = data?.branches?.find((b: any) => b.name === expenseForm.branch);
              const branchId = matchBranch?.id || data?.branches?.[0]?.id;

              const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  date: expenseForm.date,
                  category: expenseForm.category,
                  description: expenseForm.description.trim(),
                  amount: amt,
                  branchId,
                  paymentMethod: expenseForm.paymentMethod,
                }),
              });

              if (res.ok) {
                const created = await res.json();
                setExpenses((prev) => [created, ...prev]);
                setExpenseForm(EMPTY_FORM);
                setFormSuccess(true);
                setTimeout(() => setFormSuccess(false), 3000);
              } else {
                const errData = await res.json();
                setFormError(errData.error || "Failed to add expense");
              }
            } catch {
              setFormError("Network error. Please try again.");
            }
          };

          const handleDelete = async (id: string) => {
            try {
              await fetch(`/api/expenses/${id}`, { method: "DELETE" });
              setExpenses((prev) => prev.filter((e) => e.id !== id));
            } catch (err) {
              console.error("Failed to delete expense:", err);
            }
          };

          return (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard title="Total Expenses" value={fmt(totalExpenses)} sub="All recorded" icon={Wallet} trend="down" color="bg-rose-100 text-rose-600" />
                <KPICard title="This Month" value={fmt(thisMonth)} sub={new Date().toLocaleString("en-IN", { month: "long" })} icon={IndianRupee} trend="neutral" color="bg-amber-100 text-amber-600" />
                <KPICard title="Top Category" value={catTotals[0]?.cat || "—"} sub={fmt(catTotals[0]?.total || 0)} icon={BarChart3} trend="neutral" color="bg-indigo-100 text-indigo-600" />
                <KPICard title="Entries" value={expenses.length.toString()} sub="Expense records" icon={Package} trend="neutral" color="bg-slate-100 text-slate-600" />
              </div>

              {/* Two-column layout: Form + Category breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* ── Add Expense Form ── */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Plus size={16} className="text-indigo-600" />
                    <h2 className="font-black text-gray-800">Add New Expense</h2>
                  </div>
                  <form onSubmit={handleAddExpense} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Category */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                        <select
                          value={expenseForm.category}
                          onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                        >
                          {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      {/* Amount */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Amount (₹)</label>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="e.g. 5000"
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Monthly vegetable purchase"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Branch */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Branch</label>
                        <select
                          value={expenseForm.branch}
                          onChange={(e) => setExpenseForm((f) => ({ ...f, branch: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                        >
                          {BRANCHES_LIST.map((b) => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      {/* Payment Method */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Payment Method</label>
                        <select
                          value={expenseForm.paymentMethod}
                          onChange={(e) => setExpenseForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                        >
                          {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                      <input
                        type="date"
                        value={expenseForm.date}
                        onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                      />
                    </div>

                    {/* Error */}
                    {formError && (
                      <p className="text-sm text-rose-600 font-semibold bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200">{formError}</p>
                    )}

                    {/* Success */}
                    {formSuccess && (
                      <div className="flex items-center gap-2 text-sm text-emerald-700 font-bold bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 size={16} />
                        Expense added successfully!
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add Expense
                    </button>
                  </form>
                </div>

                {/* ── Category Breakdown ── */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-black text-gray-800">By Category</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Spending distribution</p>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    {catTotals.map(({ cat, total }) => (
                      <div key={cat}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_TEXT[cat] || "text-gray-600 bg-gray-100"}`}>{cat}</span>
                          <span className="text-sm font-black text-gray-800">{fmt(total)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${CATEGORY_COLORS[cat] || "bg-gray-400"}`}
                            style={{ width: `${Math.round((total / maxCat) * 100)}%`, transition: "width 0.5s ease" }}
                          />
                        </div>
                      </div>
                    ))}
                    {catTotals.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-6">No expenses yet</p>
                    )}
                  </div>
                  <div className="px-6 py-3 bg-slate-50 border-t border-gray-100 flex justify-between">
                    <span className="text-xs text-gray-400 font-semibold">Grand Total</span>
                    <span className="text-sm font-black text-rose-600">{fmt(totalExpenses)}</span>
                  </div>
                </div>
              </div>

              {/* ── Expenses Table ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-black text-gray-800">Expense Records</h2>
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-400" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="text-sm font-bold text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    >
                      <option value="All">All Categories</option>
                      {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 font-bold text-xs uppercase tracking-wide">
                        <th className="px-6 py-3 text-left">ID</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Category</th>
                        <th className="px-6 py-3 text-left">Description</th>
                        <th className="px-6 py-3 text-left">Branch</th>
                        <th className="px-6 py-3 text-left">Payment</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-400 font-semibold">
                            No expenses found{filterCategory !== "All" ? ` for "${filterCategory}"` : ""}.
                          </td>
                        </tr>
                      )}
                      {filtered.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-3.5 font-mono font-bold text-gray-400 text-xs">{e.id}</td>
                          <td className="px-6 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                            {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_TEXT[e.category] || "text-gray-600 bg-gray-100"}`}>
                              {e.category}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-gray-800 font-medium max-w-[200px] truncate">{e.description}</td>
                          <td className="px-6 py-3.5 text-gray-500 text-xs font-semibold whitespace-nowrap">{typeof e.branch === 'object' ? e.branch.name.split("–")[0].trim() : String(e.branch).split("–")[0].trim()}</td>
                          <td className="px-6 py-3.5">
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{e.paymentMethod}</span>
                          </td>
                          <td className="px-6 py-3.5 text-right font-black text-rose-600">{fmt(e.amount)}</td>
                          <td className="px-6 py-3.5 text-center">
                            <button
                              onClick={() => handleDelete(e.id)}
                              className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all mx-auto"
                              title="Delete expense"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {filtered.length > 0 && (
                      <tfoot>
                        <tr className="bg-slate-50 border-t-2 border-gray-200">
                          <td colSpan={6} className="px-6 py-3.5 font-black text-gray-700 text-sm">Total ({filtered.length} entries)</td>
                          <td className="px-6 py-3.5 text-right font-black text-rose-600">{fmt(filtered.reduce((s, e) => s + e.amount, 0))}</td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </>
          );
        })()}

        {/* ======= MENU ITEMS ======= */}
        {activeTab === "menu-items" && (() => {
          // Filter products for BRANCH_ADMIN (own branch only)
          const branchFiltered = userRole === "BRANCH_ADMIN" && userBranchId
            ? menuProducts.filter((p) => p.branchId === userBranchId)
            : menuProducts;

          const handleAddProduct = async (ev: React.FormEvent) => {
            ev.preventDefault();
            setMenuFormError("");
            if (!menuForm.name.trim()) { setMenuFormError("Name is required."); return; }
            const price = parseFloat(menuForm.price);
            if (!price || price <= 0) { setMenuFormError("Enter a valid price."); return; }
            if (!menuForm.categoryId) { setMenuFormError("Select a category."); return; }

            try {
              // Determine branchId — for BRANCH_ADMIN use their branch, for SUPER_ADMIN use first branch
              const branchId = userBranchId || data?.branches?.[0]?.id;
              const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: menuForm.name.trim(),
                  price,
                  categoryId: menuForm.categoryId,
                  branchId,
                }),
              });
              if (res.ok) {
                setMenuForm({ name: "", price: "", categoryId: "" });
                setMenuFormSuccess(true);
                setTimeout(() => setMenuFormSuccess(false), 3000);
                fetchMenuProducts();
              } else {
                const err = await res.json();
                setMenuFormError(err.error || "Failed to add product");
              }
            } catch {
              setMenuFormError("Network error. Please try again.");
            }
          };

          const handleToggleActive = async (id: string, isActive: boolean) => {
            await fetch(`/api/products/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isActive: !isActive }),
            });
            fetchMenuProducts();
          };

          const handleDeleteProduct = async (id: string) => {
            await fetch(`/api/products/${id}`, { method: "DELETE" });
            fetchMenuProducts();
          };

          return (
            <>
              {/* Add Product Form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-black text-gray-800 text-base">Add Menu Item</h2>
                  {userBranchName && (
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{userBranchName}</span>
                  )}
                </div>
                <form onSubmit={handleAddProduct} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Name</label>
                      <input
                        value={menuForm.name}
                        onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Item name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Price (₹)</label>
                      <input
                        type="number"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="299"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                      <select
                        value={menuForm.categoryId}
                        onChange={(e) => setMenuForm({ ...menuForm, categoryId: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      >
                        <option value="">Select category</option>
                        {menuCategories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Add Item
                      </button>
                    </div>
                  </div>
                  {menuFormError && <p className="text-red-600 text-sm font-semibold">{menuFormError}</p>}
                  {menuFormSuccess && <p className="text-emerald-600 text-sm font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Item added!</p>}
                </form>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-black text-gray-800 text-base">Menu Items ({branchFiltered.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 font-bold text-xs uppercase tracking-wide">
                        <th className="px-6 py-3 text-left">Item</th>
                        <th className="px-6 py-3 text-left">Category</th>
                        <th className="px-6 py-3 text-right">Price</th>
                        <th className="px-6 py-3 text-center">Status</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {branchFiltered.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-3.5 font-bold text-gray-800">{p.name}</td>
                          <td className="px-6 py-3.5">
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                              {typeof p.category === 'object' ? p.category.name : p.category}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right font-black text-gray-900">{fmt(p.price)}</td>
                          <td className="px-6 py-3.5 text-center">
                            <button
                              onClick={() => handleToggleActive(p.id, p.isActive)}
                              className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                                p.isActive
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {p.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all mx-auto"
                              title="Delete item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {branchFiltered.length === 0 && (
                  <div className="p-8 text-center text-gray-400 font-medium">
                    No menu items found. Add your first item above.
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </main>
    </div>
  );
}
