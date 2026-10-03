import React, { useState } from 'react';
import {
  Search,
  FileText,
  Calendar,
  Clock,
  Printer,
  Trash2,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Phone,
  ShieldCheck,
  BadgeCheck,
  CreditCard
} from 'lucide-react';
import { OrderRecord, TransactionStatus } from '../types';
import { formatIDR, formatDisplayDate } from '../utils/pricing';

interface OrderHistoryProps {
  orders: OrderRecord[];
  onSelectOrder: (order: OrderRecord) => void;
  onDeleteOrder: (orderId: string) => void;
  onCreateNew: () => void;
  onToggleAdminConfirm?: (orderId: string) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  onSelectOrder,
  onDeleteOrder,
  onCreateNew,
  onToggleAdminConfirm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [transFilter, setTransFilter] = useState<string>('all');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.prodi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.whatsapp.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    const matchesTrans =
      transFilter === 'all' || order.transactionStatus === transFilter;

    return matchesSearch && matchesStatus && matchesTrans;
  });

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(orders, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riwayat-pesanan-jilid-uin-madura-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4 text-emerald-600" />
              Sistem Manajemen Loket UIN Madura
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Daftar Nota & Riwayat Transaksi Jilid Skripsi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Total {orders.length} pesanan tercatat. Admin dapat memverifikasi pembayaran DP/Lunas dan memantau jadwal pengambilan.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {orders.length > 0 && (
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor JSON</span>
              </button>
            )}

            <button
              onClick={onCreateNew}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black text-emerald-950 bg-amber-400 hover:bg-amber-500 shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Pesanan Baru</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama mahasiswa, no. nota, atau prodi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-700"
            >
              <option value="all">Semua Status Pengerjaan</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Proses Jilid">Proses Jilid</option>
              <option value="Siap Diambil">Siap Diambil</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={transFilter}
              onChange={(e) => setTransFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-700"
            >
              <option value="all">Semua Status Transaksi</option>
              <option value="Bayar Sekarang">Bayar Sekarang</option>
              <option value="DP">DP (Uang Muka 50%)</option>
              <option value="LUNAS">LUNAS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table or Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchTerm || statusFilter !== 'all' || transFilter !== 'all'
              ? 'Tidak ada pesanan yang sesuai dengan filter'
              : 'Belum ada nota pesanan yang tersimpan'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Silakan buat pesanan baru untuk mencetak nota otomatis dan menguji kalkulator harga.
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mulai Buat Pesanan Jilid</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">No. Nota</th>
                  <th className="py-3.5 px-4">Mahasiswa & Fakultas</th>
                  <th className="py-3.5 px-4">Paket & Sampul</th>
                  <th className="py-3.5 px-4">Jadwal Pengambilan</th>
                  <th className="py-3.5 px-4">Total Biaya</th>
                  <th className="py-3.5 px-4">Transaksi & Konfirmasi Admin</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  return (
                    <tr
                      key={order.orderId}
                      className="hover:bg-slate-50/70 transition"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        <div className="text-emerald-700">{order.orderId}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {order.orderDate} WIB
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {order.studentName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {order.prodi}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-medium">
                          +62 {order.whatsapp}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">
                          {order.coverCount} Eksemplar ({order.coverColor})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {order.durationLabel}
                        </div>
                        {order.selectedServices.length > 0 && (
                          <div className="text-[10px] text-amber-700 font-medium">
                            +{order.selectedServices.length} Layanan Tambahan
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                          {formatDisplayDate(order.pickupDate)}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-slate-900 text-sm">
                        {formatIDR(order.totalCost)}
                        {order.transactionStatus === 'DP' && (
                          <div className="text-[10px] font-semibold text-amber-800">
                            DP: {formatIDR(order.dpAmount)}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              order.transactionStatus === 'LUNAS'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : order.transactionStatus === 'DP'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-300'
                            }`}
                          >
                            {order.transactionStatus}
                          </span>

                          <div>
                            {order.adminConfirmed ? (
                              <button
                                onClick={() => onToggleAdminConfirm && onToggleAdminConfirm(order.orderId)}
                                className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
                                title="Klik untuk membatalkan konfirmasi admin"
                              >
                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                                Terkonfirmasi Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => onToggleAdminConfirm && onToggleAdminConfirm(order.orderId)}
                                className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300 inline-flex items-center gap-1 cursor-pointer"
                                title="Klik untuk mengonfirmasi pembayaran DP/Lunas sekarang"
                              >
                                <ShieldCheck className="w-3 h-3 text-amber-600" />
                                Konfirmasi Admin
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            order.status === 'Siap Diambil'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : order.status === 'Proses Jilid'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : order.status === 'Selesai'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition"
                            title="Buka / Cetak Nota"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Hapus nota pesanan ${order.orderId}?`)) {
                                onDeleteOrder(order.orderId);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                            title="Hapus Nota"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
