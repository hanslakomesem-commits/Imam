import React, { useState, useRef } from 'react';
import {
  Printer,
  Share2,
  Copy,
  Check,
  X,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Download,
  Image as ImageIcon,
  BadgeCheck,
  Banknote,
  Send,
  Loader2
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { OrderRecord, TransactionStatus } from '../types';
import {
  formatIDR,
  formatDisplayDate,
  createWhatsAppTextForAdmin,
  getAdminWhatsAppUrl
} from '../utils/pricing';
import { ADMIN_WHATSAPP } from '../data/uinMaduraData';

interface InvoiceModalProps {
  order: OrderRecord;
  onClose: () => void;
  onViewSchema?: () => void;
  onUpdateStatus?: (
    orderId: string,
    status: OrderRecord['status'],
    transactionStatus: TransactionStatus,
    adminConfirmed: boolean,
    adminConfirmedBy?: string
  ) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  onClose,
  onViewSchema,
  onUpdateStatus
}) => {
  const [copied, setCopied] = useState(false);
  const [printLayout, setPrintLayout] = useState<'a4' | 'thermal'>('a4');
  
  // Local state synced with order
  const [currentTransStatus, setCurrentTransStatus] = useState<TransactionStatus>(order.transactionStatus);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<OrderRecord['status']>(order.status);
  const [isAdminConfirmed, setIsAdminConfirmed] = useState<boolean>(order.adminConfirmed);
  const [adminName] = useState<string>(order.adminConfirmedBy || 'Admin Loket Percetakan');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = createWhatsAppTextForAdmin({
      ...order,
      transactionStatus: currentTransStatus,
      status: currentOrderStatus,
      adminConfirmed: isAdminConfirmed,
      adminConfirmedBy: adminName,
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToAdminWhatsApp = () => {
    const activeOrder: OrderRecord = {
      ...order,
      transactionStatus: currentTransStatus,
      status: currentOrderStatus,
      adminConfirmed: isAdminConfirmed,
      adminConfirmedBy: adminName,
    };

    const waUrl = getAdminWhatsAppUrl(activeOrder);
    window.open(waUrl, '_blank');
  };

  const handleConfirmAdmin = (confirm: boolean, newTrans?: TransactionStatus) => {
    const updatedTrans = newTrans || currentTransStatus;
    setIsAdminConfirmed(confirm);
    if (newTrans) setCurrentTransStatus(newTrans);

    if (onUpdateStatus) {
      onUpdateStatus(
        order.orderId,
        currentOrderStatus,
        updatedTrans,
        confirm,
        confirm ? adminName : undefined
      );
    }
  };

  const handleOrderStatusChange = (newStatus: OrderRecord['status']) => {
    setCurrentOrderStatus(newStatus);
    if (onUpdateStatus) {
      onUpdateStatus(
        order.orderId,
        newStatus,
        currentTransStatus,
        isAdminConfirmed,
        isAdminConfirmed ? adminName : undefined
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        
        {/* Top Control Bar */}
        <div className="no-print bg-slate-950 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-sm">Nota Pemesanan Jilid Hard Cover</span>
            <span className="text-xs bg-emerald-900 text-emerald-200 px-2.5 py-0.5 rounded-md font-mono font-bold">
              {order.orderId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs font-medium">
              <button
                onClick={() => setPrintLayout('a4')}
                className={`px-2.5 py-1 rounded-md transition ${
                  printLayout === 'a4' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Layout A4
              </button>
              <button
                onClick={() => setPrintLayout('thermal')}
                className={`px-2.5 py-1 rounded-md transition ${
                  printLayout === 'thermal' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Struk Thermal
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Content */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 flex-1">
          
          {/* NOTICE BANNER: AUTOMATIC DISPATCH TO WA ADMIN */}
          <div className="no-print max-w-2xl mx-auto mb-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 rounded-2xl shadow-sm border border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Kirim Otomatis ke WA Admin
                </div>
                <div className="text-sm font-extrabold text-white">
                  Nomor Admin: {ADMIN_WHATSAPP}
                </div>
                <div className="text-[11px] text-emerald-200">
                  Lengkap dengan status bayar ({currentTransStatus}), jadwal pengambilan & unduhan file JPG.
                </div>
              </div>
            </div>

            <button
              onClick={handleSendToAdminWhatsApp}
              disabled={isGeneratingJpg}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              {isGeneratingJpg ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Membuat JPG...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Kirim ke WA Admin ({ADMIN_WHATSAPP})</span>
                </>
              )}
            </button>
          </div>

          {/* ADMIN VERIFICATION PANEL (HIDDEN ON PRINT) */}
          <div className="no-print max-w-2xl mx-auto mb-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Panel Verifikasi Pembayaran Admin Loket:
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Status <strong>DP</strong> dan <strong>LUNAS</strong> harus dikonfirmasi langsung oleh admin.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isAdminConfirmed ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1">
                      <BadgeCheck className="w-4 h-4 text-emerald-600" />
                      Terkonfirmasi Admin
                    </span>
                    <button
                      onClick={() => handleConfirmAdmin(false)}
                      className="text-[11px] text-rose-600 hover:underline px-2 py-1 cursor-pointer"
                    >
                      Batalkan
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {currentTransStatus === 'DP' ? (
                      <button
                        onClick={() => handleConfirmAdmin(true, 'DP')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Konfirmasi DP Masuk</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConfirmAdmin(true, 'LUNAS')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Konfirmasi LUNAS</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* THE PRINTABLE / JPG TARGET NOTA CARD */}
          <div
            id="printable-nota"
            className={`printable-invoice bg-white mx-auto shadow-md border border-slate-300 transition-all ${
              printLayout === 'thermal'
                ? 'max-w-sm p-4 font-mono text-xs rounded-none border-dashed'
                : 'max-w-2xl p-6 sm:p-8 rounded-2xl'
            }`}
          >
            {/* KOP NOTA PERCETAKAN */}
            <div className="text-center pb-4 border-b-2 border-slate-800 mb-5">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-black">
                  🎓
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">
                  Percetakan & Penjilidan Kampus UIN Madura
                </h2>
              </div>
              <p className="text-xs text-slate-600">
                Pusat Layanan Hard Cover Skripsi, Tesis, Jurnal & Repositori Perpustakaan
              </p>
              <p className="text-[11px] text-slate-500">
                Jl. Raya Panglegur KM. 3.5, Pamekasan, Madura | Layanan WA Admin: {ADMIN_WHATSAPP}
              </p>
            </div>

            {/* NOTA HEADER INFO */}
            <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-slate-200 text-xs">
              <div>
                <div className="text-slate-500 font-medium">Nomor Nota:</div>
                <div className="text-base font-black text-slate-900 font-mono tracking-wider">
                  {order.orderId}
                </div>
                <div className="text-slate-500 mt-1 font-medium">Tanggal Masuk:</div>
                <div className="font-semibold text-slate-800">
                  {order.orderDate} WIB
                </div>
              </div>

              <div className="text-right">
                <div className="text-slate-500 font-medium">Status Pengerjaan:</div>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {currentOrderStatus}
                </span>

                <div className="text-slate-500 mt-1.5 font-medium">Status Transaksi:</div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentTransStatus === 'LUNAS'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : currentTransStatus === 'DP'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}>
                    {currentTransStatus}
                  </span>
                </div>

                <div className="mt-1 text-[11px]">
                  {isAdminConfirmed ? (
                    <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                      Dikonfirmasi Admin ({adminName})
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center justify-end gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 inline" />
                      Menunggu Konfirmasi Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* DATA MAHASISWA PEMESAN (NIM SUDAH DIHAPUS) */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 mb-5 text-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Rincian Mahasiswa Pemesan:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500">Nama Mahasiswa:</span>{' '}
                  <strong className="text-slate-900 text-sm">{order.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">No. WhatsApp:</span>{' '}
                  <strong className="text-slate-900 font-mono">+62 {order.whatsapp}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Fakultas:</span>{' '}
                  <span className="text-slate-800 font-semibold">{order.fakultas}</span>
                </div>
                <div>
                  <span className="text-slate-500">Program Studi:</span>{' '}
                  <span className="text-slate-800 font-semibold">{order.prodi}</span>
                </div>
                <div className="sm:col-span-2 pt-1 border-t border-slate-200/80 flex items-center gap-2">
                  <span className="text-slate-500">Standar Warna Sampul:</span>
                  <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-300">
                    {order.coverColor}
                  </span>
                </div>
              </div>
            </div>

            {/* HIGHLIGHT BOX: TANGGAL DAN JAM PENGAMBILAN */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-xl p-4 sm:p-5 mb-5 shadow-inner border-2 border-amber-400">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>TANGGAL DAN JAM PENGAMBILAN (PASTI):</span>
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-200 tracking-tight">
                {formatDisplayDate(order.pickupDate)}
              </div>
              <div className="text-xs text-emerald-100 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>
                  Hasil jilid siap diambil di loket percetakan. Harap menunjukkan nota ini.
                </span>
              </div>
            </div>

            {/* TABEL RINCIAN PESANAN & BIAYA */}
            <div className="mb-5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Rincian Pesanan & Biaya:
              </div>
              
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-600 bg-slate-50">
                    <th className="py-2 px-2 text-left font-bold">Deskripsi Item</th>
                    <th className="py-2 px-2 text-center font-bold">Qty</th>
                    <th className="py-2 px-2 text-right font-bold">Tarif Satuan</th>
                    <th className="py-2 px-2 text-right font-bold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="font-bold text-slate-900">
                        Hard Cover Skripsi Emboss Emas
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Paket: {order.durationLabel} ({order.durationDays} hari) &bull; Sampul {order.coverColor}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold">
                      {order.coverCount}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono">
                      {formatIDR(order.pricePerCover)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                      {formatIDR(order.coversSubtotal)}
                    </td>
                  </tr>

                  {order.servicesBreakdown.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2 px-2">
                        <div className="font-bold text-slate-800">
                          {s.label}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Layanan Tambahan Wisuda UIN Madura
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center text-slate-500">
                        1 paket
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600">
                        {formatIDR(s.price)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-semibold text-slate-900">
                        {formatIDR(s.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="border-t-2 border-slate-800 bg-slate-50 font-bold text-sm">
                    <td colSpan={3} className="py-3 px-2 text-right text-slate-800 font-extrabold uppercase">
                      TOTAL HARGA:
                    </td>
                    <td className="py-3 px-2 text-right font-black text-emerald-800 font-mono text-base">
                      {formatIDR(order.totalCost)}
                    </td>
                  </tr>

                  {currentTransStatus === 'DP' && (
                    <>
                      <tr className="bg-amber-50 text-xs font-semibold border-t border-amber-200">
                        <td colSpan={3} className="py-2 px-2 text-right text-amber-900">
                          Uang Muka (DP 50%):
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-amber-900 font-mono">
                          {formatIDR(order.dpAmount)}
                        </td>
                      </tr>
                      <tr className="bg-amber-50 text-xs font-bold border-t border-amber-200">
                        <td colSpan={3} className="py-2 px-2 text-right text-amber-950 uppercase">
                          Sisa Tagihan Saat Pengambilan:
                        </td>
                        <td className="py-2 px-2 text-right font-black text-amber-950 font-mono text-sm">
                          {formatIDR(order.remainingAmount)}
                        </td>
                      </tr>
                    </>
                  )}
                </tfoot>
              </table>
            </div>

            {/* BERKAS TERLAMPIR JIKA ADA */}
            {order.uploadedFiles?.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-5 space-y-1">
                <span className="font-bold text-slate-700">Berkas Naskah Skripsi Terlampir:</span>{' '}
                <span className="text-slate-600">
                  {order.uploadedFiles.map((f) => f.name).join(', ')}
                </span>
              </div>
            )}

            {/* STEMPEL RESMI VERIFIKASI ADMIN */}
            <div className="my-4 p-3 rounded-xl border-2 border-dashed flex items-center justify-between gap-3 text-xs bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-700" />
                <div>
                  <div className="font-bold text-slate-900">
                    Status Verifikasi: <span className="uppercase font-black">{currentTransStatus}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isAdminConfirmed
                      ? `Telah diverifikasi sah oleh admin loket (${adminName})`
                      : 'Menunggu konfirmasi admin setelah verifikasi pembayaran'}
                  </div>
                </div>
              </div>

              {isAdminConfirmed ? (
                <div className="border-2 border-emerald-600 text-emerald-700 font-black text-xs px-3 py-1 rounded uppercase tracking-wider transform -rotate-2">
                  LUNAS / TERKONFIRMASI
                </div>
              ) : (
                <div className="border-2 border-amber-500 text-amber-700 font-black text-xs px-3 py-1 rounded uppercase tracking-wider transform -rotate-2">
                  MENUNGGU ADMIN
                </div>
              )}
            </div>

            {/* FOOTER NOTA & TANDA TANGAN */}
            <div className="pt-4 border-t border-dashed border-slate-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded flex items-center justify-center p-1">
                  <QrCode className="w-12 h-12 text-slate-800" />
                </div>
                <div className="text-[11px] text-slate-500">
                  <div className="font-bold text-slate-700">Verifikasi Loket Cetak</div>
                  <div>Pindai kode QR untuk konfirmasi naskah</div>
                  <div className="font-mono text-[10px] text-slate-400">{order.orderId}</div>
                </div>
              </div>

              <div className="text-center sm:text-right text-[11px]">
                <div className="text-slate-500 mb-8">Petugas Loket Percetakan,</div>
                <div className="font-bold text-slate-800 underline">
                  ( {isAdminConfirmed ? adminName : 'Bagian Percetakan UIN Madura'} )
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-400 text-center italic">
              Harap bawa bukti nota fisik / gambar JPG ini saat pengambilan hasil jilid hard cover.
            </div>
          </div>

          {/* ADMIN STATUS CONTROLS (HIDDEN ON PRINT) */}
          <div className="no-print max-w-2xl mx-auto mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Status Pengerjaan:</span>
              <select
                value={currentOrderStatus}
                onChange={(e) => handleOrderStatusChange(e.target.value as OrderRecord['status'])}
                className="px-2.5 py-1 rounded-lg border border-slate-300 font-semibold bg-white"
              >
                <option value="Menunggu">Menunggu</option>
                <option value="Proses Jilid">Proses Jilid</option>
                <option value="Siap Diambil">Siap Diambil</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Ubah Transaksi:</span>
              <select
                value={currentTransStatus}
                onChange={(e) => {
                  const val = e.target.value as TransactionStatus;
                  setCurrentTransStatus(val);
                  if (onUpdateStatus) {
                    onUpdateStatus(order.orderId, currentOrderStatus, val, isAdminConfirmed, adminName);
                  }
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-300 font-semibold bg-white"
              >
                <option value="Bayar Sekarang">Bayar Sekarang</option>
                <option value="DP">DP (Uang Muka 50%)</option>
                <option value="LUNAS">LUNAS</option>
              </select>
            </div>
          </div>

        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="no-print bg-white p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks Nota</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak (Print)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* DOWNLOAD JPG BUTTON */}
            <button
              onClick={handleDownloadJpg}
              disabled={isGeneratingJpg}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition cursor-pointer"
            >
              {isGeneratingJpg ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : jpgSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>{jpgSuccess ? 'JPG Tersimpan!' : 'Unduh Gambar (JPG)'}</span>
            </button>

            {/* SEND TO ADMIN WA BUTTON */}
            <button
              onClick={handleSendToAdminWhatsApp}
              disabled={isGeneratingJpg}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-emerald-950 bg-amber-400 hover:bg-amber-500 shadow-md transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-950" />
              <span>Kirim Nota ke WA Admin ({ADMIN_WHATSAPP})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
