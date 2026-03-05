
import React, { useState, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Menu,
  FileText,
  Filter,
  UserPlus,
  RefreshCcw,
  Download,
  Loader2,
  Star,
  Trash2,
  X,
  Plus,
  Calendar,
  Layers,
  PlusCircle,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet
} from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { StatCard } from './components/StatCard';
import { MOCK_SALES, MOCK_PRODUCTS, MOCK_CUSTOMERS, REVENUE_CHART_DATA } from './constants';
import { generateBusinessInsights } from './geminiService';
import { Customer, Product, SaleRecord } from './types';

const COLORS = ['#059669', '#d97706', '#0ea5e9', '#f43f5e', '#8b5cf6'];

const OverviewView = ({ totalDaily, totalWeekly, totalMonthly, completedOrders, pendingOrders, cancelledOrders, lowStockCount, sales }: any) => (
  <div id="overview-report" className="space-y-6 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="إجمالي المبيعات (اليوم)" value={`${totalDaily.toLocaleString()} ريال`} trend={totalDaily > 0 ? { value: 0, isUp: true } : undefined} icon={<TrendingUp size={24} />} color="bg-emerald-600" />
      <StatCard title="المبيعات الأسبوعية" value={`${totalWeekly.toLocaleString()} ريال`} icon={<ShoppingBag size={24} />} color="bg-amber-600" />
      <StatCard title="المبيعات الشهرية" value={`${totalMonthly.toLocaleString()} ريال`} icon={<Calendar size={24} />} color="bg-sky-600" />
      <StatCard title="تنبيهات المخزون" value={lowStockCount} icon={<AlertTriangle size={24} />} color="bg-rose-500" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg mb-6 text-slate-700">تحليل الإيرادات</h3>
        <div className="h-[300px] w-full">
          {sales.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_CHART_DATA}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="current" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 border-2 border-dashed border-slate-50 rounded-3xl">
              <TrendingUp size={48} strokeWidth={1} />
              <p className="text-sm font-medium">لا توجد بيانات مبيعات للعرض حالياً</p>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg mb-6 text-slate-700">حالة الطلبات</h3>
        <div className="h-[250px] w-full">
          {sales.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'مكتملة', value: completedOrders }, 
                    { name: 'معلقة', value: pendingOrders }, 
                    { name: 'ملغاة', value: cancelledOrders }
                  ]} 
                  cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value"
                >
                  {[0, 1, 2].map((index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 border-2 border-dashed border-slate-50 rounded-3xl">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="text-sm font-medium">أضف طلباتك الأولى للتحليل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const InventoryView = ({ products, onAddProduct, onDeleteProduct }: { 
  products: Product[], 
  onAddProduct: (p: Omit<Product, 'id' | 'soldCount'>) => void,
  onDeleteProduct: (id: string) => void
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: 0, stock: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(newProduct);
    setNewProduct({ name: '', category: '', price: 0, stock: 0 });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">المستودع والمخزون</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-xl text-sm font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all active:scale-95"
        >
          <Plus size={18} />
          إضافة منتج جديد
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 transition-all group hover:shadow-xl hover:-translate-y-1 relative">
            <button 
              onClick={() => onDeleteProduct(product.id)}
              className="absolute top-4 left-4 p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex items-center justify-between mb-4">
               <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{product.category}</span>
               <div className={`w-3 h-3 rounded-full ${product.stock < 5 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            </div>
            <h4 className="font-black text-slate-800 mb-1 group-hover:text-emerald-700 text-lg">{product.name}</h4>
            <div className="flex items-center justify-between mt-6 bg-slate-50 p-4 rounded-2xl text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">المخزون</span>
                <span className={`font-black ${product.stock < 5 ? 'text-rose-600' : 'text-slate-700'}`}>{product.stock} قطعة</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">السعر</span>
                <span className="font-black text-emerald-700">{product.price} ريال</span>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50">
            <div className="flex flex-col items-center gap-4 text-slate-300">
              <Package size={64} strokeWidth={1} />
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-400">المستودع فارغ</p>
                <p className="text-sm">ابدأ بإضافة أول منتج لمتجرك الآن</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-3 bg-emerald-50 text-emerald-700 font-black rounded-2xl hover:bg-emerald-100 transition-colors flex items-center gap-2"
              >
                <PlusCircle size={20} />
                أضف منتجك الأول
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800">بيانات المنتج الجديد</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 mr-1">اسم المنتج</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" placeholder="مثلاً: آيفون 15 برو" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 mr-1">الفئة</label>
                <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold appearance-none">
                  <option value="">اختر الفئة...</option>
                  <option value="إلكترونيات">إلكترونيات</option>
                  <option value="إكسسوارات">إكسسوارات</option>
                  <option value="حواسيب">حواسيب</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 mr-1">السعر (ريال)</label>
                  <input required type="number" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 mr-1">الكمية</label>
                  <input required type="number" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" placeholder="0" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2">
                <Plus size={20} />
                تأكيد إضافة المنتج
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomersView = ({ customers, loyaltyRatio, onAddCustomer, onDeleteCustomer }: { 
  customers: Customer[], 
  loyaltyRatio: number,
  onAddCustomer: (c: Omit<Customer, 'id' | 'totalSpent' | 'joinDate'>) => void,
  onDeleteCustomer: (id: string) => void
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCustomer(newCustomer);
    setNewCustomer({ name: '', email: '', phone: '' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">إدارة العملاء</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-xl text-sm font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          إضافة عميل جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="إجمالي العملاء" value={customers.length} icon={<Users size={24} />} color="bg-emerald-600" />
        <StatCard title="نسبة الولاء (العائدين)" value={`${loyaltyRatio}%`} icon={<RefreshCcw size={24} />} color="bg-sky-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-bold text-lg text-slate-700">قائمة العملاء الحالية</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-4">الاسم</th>
                <th className="p-4">التواصل</th>
                <th className="p-4">تاريخ الانضمام</th>
                <th className="p-4">إجمالي المشتريات</th>
                <th className="p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-all group animate-in slide-in-from-right-2">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-black text-sm border border-emerald-100">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{customer.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-slate-600 font-medium">{customer.email}</p>
                      <p className="text-slate-400 text-xs">{customer.phone}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{customer.joinDate}</td>
                  <td className="p-4 font-black text-emerald-700">{customer.totalSpent.toLocaleString()} ريال</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => onDeleteCustomer(customer.id)}
                      className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-75 shadow-sm hover:shadow-md"
                    >
                      <Trash2 size={22} />
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-200">
                      <Users size={64} strokeWidth={1} />
                      <p className="text-lg font-bold text-slate-300">لا يوجد عملاء مضافين حالياً</p>
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="mt-2 px-6 py-3 bg-slate-50 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-colors"
                      >
                        إضافة أول عميل
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800">بيانات العميل الجديد</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 mr-1">الاسم الكامل</label>
                <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" placeholder="محمد السبيعي" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 mr-1">البريد الإلكتروني</label>
                <input required type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" placeholder="user@domain.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 mr-1">رقم الجوال</label>
                <input required type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" placeholder="05XXXXXXXX" />
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 transition-all mt-4">
                تأكيد الإضافة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SalesView = ({ sales, onExportPDF, onExportExcel, isExporting, isExportingExcel, onAddSale }: any) => {
  const [showAddSale, setShowAddSale] = useState(false);
  const [newSale, setNewSale] = useState({ customerName: '', amount: 0, status: 'completed', city: 'الرياض' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSale(newSale);
    setNewSale({ customerName: '', amount: 0, status: 'completed', city: 'الرياض' });
    setShowAddSale(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">سجل المبيعات</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddSale(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-100 rounded-xl text-sm font-bold text-emerald-700 hover:bg-emerald-200 active:scale-95 transition-all"
          >
            <Plus size={16} />
            إضافة عملية بيع
          </button>
          <button onClick={onExportExcel} disabled={isExportingExcel || sales.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 rounded-xl text-sm font-bold text-white hover:bg-sky-700 shadow-lg shadow-sky-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isExportingExcel ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            تصدير Excel
          </button>
          <button onClick={onExportPDF} disabled={isExporting || sales.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 rounded-xl text-sm font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            تصدير PDF
          </button>
        </div>
      </div>
      <div id="report-content" className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-5">رقم الطلب</th>
              <th className="p-5">العميل</th>
              <th className="p-5">التاريخ</th>
              <th className="p-5">المبلغ</th>
              <th className="p-5">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sales.map((sale: SaleRecord) => (
              <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 font-mono text-xs text-slate-400">#{sale.id}</td>
                <td className="p-5 font-bold text-slate-700">{sale.customerName}</td>
                <td className="p-5 text-slate-500 text-sm">{sale.date}</td>
                <td className="p-5 font-black text-emerald-700">{sale.amount.toLocaleString()} ريال</td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                    sale.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                    sale.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {sale.status === 'completed' ? 'مكتمل' : sale.status === 'pending' ? 'معلق' : 'ملغى'}
                  </span>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={5} className="p-24 text-center">
                  <div className="flex flex-col items-center gap-4 text-slate-200">
                    <FileText size={64} strokeWidth={1} />
                    <p className="text-lg font-bold text-slate-300">لا توجد عمليات مبيعات مسجلة</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddSale && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800">إضافة مبيعات جديدة</h3>
              <button onClick={() => setShowAddSale(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 mr-1">اسم العميل</label>
                <input required type="text" value={newSale.customerName} onChange={e => setNewSale({...newSale, customerName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" placeholder="اسم العميل..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 mr-1">المبلغ (ريال)</label>
                <input required type="number" value={newSale.amount || ''} onChange={e => setNewSale({...newSale, amount: Number(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold" placeholder="0" />
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all mt-4">
                تسجيل العملية
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [insights, setInsights] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  
  const [customersState, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [sales, setSales] = useState<SaleRecord[]>(MOCK_SALES);

  const customers = useMemo(() => {
    return customersState.map(customer => {
      const customerTotalSpent = sales
        .filter(sale => sale.customerName === customer.name && sale.status === 'completed')
        .reduce((sum, sale) => sum + sale.amount, 0);
      
      return { ...customer, totalSpent: customerTotalSpent };
    });
  }, [customersState, sales]);

  const todayStr = new Date().toISOString().split('T')[0];
  
  const totalDaily = useMemo(() => 
    sales.filter(s => s.date === todayStr && s.status !== 'cancelled')
         .reduce((acc, curr) => acc + curr.amount, 0)
  , [sales, todayStr]);

  const totalWeekly = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sales.filter(s => new Date(s.date) >= weekAgo && s.status !== 'cancelled')
                .reduce((acc, curr) => acc + curr.amount, 0);
  }, [sales]);

  const totalMonthly = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return sales.filter(s => new Date(s.date) >= monthAgo && s.status !== 'cancelled')
                .reduce((acc, curr) => acc + curr.amount, 0);
  }, [sales]);

  const completedOrders = useMemo(() => sales.filter(s => s.status === 'completed').length, [sales]);
  const pendingOrders = useMemo(() => sales.filter(s => s.status === 'pending').length, [sales]);
  const cancelledOrders = useMemo(() => sales.filter(s => s.status === 'cancelled').length, [sales]);
  
  const lowStockCount = useMemo(() => products.filter(p => p.stock < 5).length, [products]);
  
  const loyaltyRatio = useMemo(() => {
    if (sales.length === 0) return 0;
    const returningSales = sales.filter(s => !s.isNewCustomer).length;
    return Math.round((returningSales / sales.length) * 100);
  }, [sales]);

  const handleGenerateInsights = async () => {
    if (sales.length === 0) {
      setInsights("لا توجد بيانات كافية للتحليل حالياً. أضف بعض المبيعات أولاً.");
      return;
    }
    setIsAnalyzing(true);
    const summary = { daily: totalDaily, weekly: totalWeekly, monthly: totalMonthly, lowStock: lowStockCount, totalCustomers: customers.length, salesCount: sales.length };
    const result = await generateBusinessInsights(summary);
    setInsights(result);
    setIsAnalyzing(false);
  };

  const handleDeleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleAddCustomer = (data: Omit<Customer, 'id' | 'totalSpent' | 'joinDate'>) => {
    const newEntry: Customer = {
      id: 'c' + Date.now() + Math.floor(Math.random() * 100),
      ...data,
      joinDate: new Date().toISOString().split('T')[0],
      totalSpent: 0
    };
    setCustomers(prev => [newEntry, ...prev]);
  };

  const handleAddProduct = (data: Omit<Product, 'id' | 'soldCount'>) => {
    const newEntry: Product = {
      id: 'p' + Date.now(),
      ...data,
      soldCount: 0
    };
    setProducts(prev => [newEntry, ...prev]);
  };

  const handleDeleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleAddSale = (data: any) => {
    const newSale: SaleRecord = {
      id: String(sales.length + 1),
      date: todayStr,
      amount: data.amount,
      status: data.status,
      city: data.city,
      customerName: data.customerName,
      isNewCustomer: !customers.some(c => c.name === data.customerName)
    };
    setSales(prev => [newSale, ...prev]);
  };

  const handleExportPDF = useCallback(() => {
    setIsExporting(true);
    const element = document.getElementById('report-content');
    if (!element) {
        setIsExporting(false);
        return;
    }
    const options = {
      margin: 10,
      filename: `تقرير_المبيعات_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // @ts-ignore
    html2pdf().set(options).from(element).save().then(() => setIsExporting(false));
  }, []);

  const handleExportExcel = useCallback(() => {
    setIsExportingExcel(true);
    try {
      const dataToExport = sales.map((sale: SaleRecord) => ({
        'رقم الطلب': sale.id,
        'اسم العميل': sale.customerName,
        'التاريخ': sale.date,
        'المبلغ (ريال)': sale.amount,
        'الحالة': sale.status === 'completed' ? 'مكتمل' : sale.status === 'pending' ? 'معلق' : 'ملغى',
        'المدينة': sale.city
      }));

      const worksheet = utils.json_to_sheet(dataToExport);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'المبيعات');
      
      writeFile(workbook, `سجل_المبيعات_${Date.now()}.xlsx`);
    } catch (error) {
      console.error('Excel export error:', error);
    } finally {
      setIsExportingExcel(false);
    }
  }, [sales]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return (
        <OverviewView 
          totalDaily={totalDaily} 
          totalWeekly={totalWeekly} 
          totalMonthly={totalMonthly} 
          completedOrders={completedOrders} 
          pendingOrders={pendingOrders}
          cancelledOrders={cancelledOrders}
          lowStockCount={lowStockCount} 
          sales={sales}
        />
      );
      case 'sales': return (
        <SalesView 
          sales={sales} 
          onExportPDF={handleExportPDF} 
          onExportExcel={handleExportExcel}
          isExporting={isExporting} 
          isExportingExcel={isExportingExcel}
          onAddSale={handleAddSale} 
        />
      );
      case 'customers': return <CustomersView customers={customers} loyaltyRatio={loyaltyRatio} onAddCustomer={handleAddCustomer} onDeleteCustomer={handleDeleteCustomer} />;
      case 'inventory': return <InventoryView products={products} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#fcfdfe] text-slate-800 overflow-hidden" dir="rtl">
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[40] lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 right-0 z-[50] w-72 bg-white border-l border-slate-100 transition-all duration-300 ease-in-out transform
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-full lg:w-0'}
          lg:relative lg:translate-x-0 ${!isSidebarOpen && 'lg:hidden'}
        `}
      >
        <div className="flex flex-col h-full p-6 w-72">
          <div className="flex items-center justify-between mb-10 px-2">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                 <TrendingUp size={24} />
               </div>
               <h1 className="text-xl font-black text-slate-800 tracking-tight">نظام المبيعات</h1>
             </div>
             {/* Close button inside sidebar for mobile */}
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-emerald-600 transition-colors">
               <X size={20} />
             </button>
          </div>

          <nav className="flex-1 space-y-2">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'الرئيسية' },
              { id: 'sales', icon: ShoppingBag, label: 'المبيعات' },
              { id: 'customers', icon: Users, label: 'العملاء' },
              { id: 'inventory', icon: Package, label: 'المستودع' },
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }} 
                className={`flex items-center w-full px-5 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:bg-slate-50 hover:text-emerald-700'}`}
              >
                <item.icon className="ml-4" size={20} />
                <span className="font-black text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-50 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">إصدار 1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300">
        <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-slate-50 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className={`p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-emerald-50 hover:text-emerald-700 transition-all active:scale-90 shadow-sm`}
              title={isSidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
            >
              {isSidebarOpen ? <ChevronRight size={22} /> : <Menu size={22} />}
            </button>
            <div className="hidden sm:block">
              <h2 className="font-black text-slate-800 text-lg">لوحة التحكم</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">أهلاً بك مجدداً</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
              <div className="text-left hidden xs:block">
                <p className="text-sm font-black text-slate-800">عامر ابراهيم</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-left">مسؤول النظام</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-black shadow-inner">ع ا</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          {renderContent()}

          <div className="mt-20 bg-slate-900 rounded-[3rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
             <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="space-y-4 text-right">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">ذكاء اصطناعي</div>
                  <h2 className="text-3xl lg:text-4xl font-black leading-tight">كيف تبدو أرقامك اليوم؟</h2>
                  <p className="text-slate-400 max-w-md text-base lg:text-lg font-medium">دع محرك الذكاء الاصطناعي يحلل بياناتك ويعطيك نصائح لزيادة أرباحك بناءً على سلوك العملاء.</p>
                </div>
                <button onClick={handleGenerateInsights} disabled={isAnalyzing} className="w-full lg:w-auto px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20">
                  {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  توليد تقرير ذكي
                </button>
             </div>
             {insights && (
                <div className="mt-10 p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 animate-in slide-in-from-bottom-5 duration-500">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap text-slate-200">{insights}</p>
                  </div>
                </div>
             )}
          </div>
          
          <footer className="mt-10 py-6 text-center text-slate-300 text-xs font-bold uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} نظام إدارة المبيعات المتكامل
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;

