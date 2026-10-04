import React, { useState, useRef } from 'react';
import { Printer, Share2, Copy, Check, X, Calendar, Clock, QrCode, Download, Send, Loader2, CheckCircle2, Wallet } from 'lucide-react';
import { toPng } from 'html-to-image';
import { OrderRecord, TransactionStatus } from '../types';
import { formatIDR, formatDisplayDate, createWhatsAppTextForAdmin, getAdminWhatsAppUrl } from '../utils/pricing';
import { ADMIN_WHATSAPP, PERCETAKAN_NAME, PERCETAKAN_ADDRESS } from '../data/uinMaduraData';

interface InvoiceModalProps {
  order: OrderRecord;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: OrderRecord['status'], transactionStatus: TransactionStatus, adminConfirmed: boolean, adminConfirmedBy?: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose, onUpdateStatus }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  const [currentTransStatus, setCurrentTransStatus] = useState<TransactionStatus>(order.transactionStatus);
  const [currentOrderStatus, setCurrentOrderStatus] = useState<OrderRecord['status']>(order.status);
  const [isAdminConfirmed, setIsAdminConfirmed] = useState<boolean>(order.adminConfirmed);
  const [adminName] = useState<string>(order.adminConfirmedBy || 'Admin ZAIN.NET');

  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2, skipFonts: true, fontEmbedCSS: '' });
      const cleanName = order.studentName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Mahasiswa';
      const link = document.createElement('a');
      link.download = `Struk_${PERCETAKAN_NAME}_${order.orderId}_${cleanName}.png`;
      link.href = dataUrl;
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) { window.print(); } finally { setIsDownloading(false); }
  };

  const handlePrint = () => window.print();

  const handleCopyText = () => {
    const text = createWhatsAppTextForAdmin({ ...order, transactionStatus: currentTransStatus, status: currentOrderStatus, adminConfirmed: isAdminConfirmed, adminConfirmedBy: adminName });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToAdminWhatsApp = () => {
    const waUrl = getAdminWhatsAppUrl({ ...order, transactionStatus: currentTransStatus, status: currentOrderStatus, adminConfirmed: isAdminConfirmed, adminConfirmedBy: adminName });
    window.open(waUrl, '_blank');
  };

  const handleConfirmAdmin = (confirm: boolean, newTrans?: TransactionStatus) => {
    const updatedTrans = newTrans || currentTransStatus;
    setIsAdminConfirmed(confirm);
    if (newTrans) setCurrentTransStatus(newTrans);
    onUpdateStatus?.(order.orderId, currentOrderStatus, updatedTrans, confirm, confirm ? adminName : undefined);
  };

  const handleOrderStatusChange = (newStatus: OrderRecord['status']) => {
    setCurrentOrderStatus(newStatus);
    onUpdateStatus?.(order.orderId, newStatus, currentTransStatus, isAdminConfirmed, isAdminConfirmed ? adminName : undefined);
  };

  const isSoftCover = order.coverType === 'soft_cover';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-indigo-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col border border-indigo-100">
        <div className="no-print bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="font-black text-lg">{PERCETAKAN_NAME}</div>
          <button onClick={onClose} className="text-indigo-100 hover:text-white"><X className="w-6 h-6" /></button>
        </div>

        <div className="overflow-y-auto p-6 bg-indigo-50 flex-1">
          <div ref={receiptRef} className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 mx-auto max-w-lg">
            <div className="text-center pb-4 border-b border-indigo-100 mb-6">
              <h2 className="text-2xl font-black text-indigo-950 uppercase tracking-tight">{PERCETAKAN_NAME}</h2>
              <p className="text-xs text-indigo-600 mt-1">{PERCETAKAN_ADDRESS}</p>
            </div>

            <div className="space-y-2 text-sm text-indigo-900 mb-6">
              <div className="flex justify-between"><span>No. Nota:</span><span className="font-bold">{order.orderId}</span></div>
              <div className="flex justify-between"><span>Mahasiswa:</span><span className="font-bold">{order.studentName}</span></div>
              <div className="flex justify-between"><span>Jilid:</span><span className="font-bold">{isSoftCover ? 'Soft Cover' : `Hard Cover (${order.coverColor})`}</span></div>
              <div className="flex justify-between"><span>Status Bayar:</span><span className="font-bold">{currentTransStatus}</span></div>
            </div>

            <table className="w-full text-sm mb-6">
              <thead className="border-b-2 border-indigo-100 text-indigo-500 text-left">
                <tr><th className="py-2">Item</th><th className="py-2 text-right">Harga</th></tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                <tr><td className="py-2">{isSoftCover ? 'Soft Cover' : 'Hard Cover'}</td><td className="py-2 text-right">{formatIDR(order.coversSubtotal)}</td></tr>
                {order.servicesBreakdown.map(s => <tr key={s.id}><td className="py-2">{s.label}</td><td className="py-2 text-right">{formatIDR(s.price)}</td></tr>)}
                <tr><td className="py-2">Biaya Print</td><td className="py-2 text-right">{formatIDR(order.printCost)}</td></tr>
              </tbody>
              <tfoot className="border-t-2 border-indigo-950 font-black text-lg">
                <tr><td className="py-2">TOTAL</td><td className="py-2 text-right">{formatIDR(order.totalCost + order.printCost)}</td></tr>
              </tfoot>
            </table>

            <div className="text-center text-xs text-indigo-400 mt-6">
              <p className="font-semibold text-indigo-900">PENGAMBILAN:</p>
              <p className="text-indigo-900">{formatDisplayDate(order.pickupDate)}</p>
              <p className="mt-2 font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                MOHON TUNJUKKAN NOTA INI SAAT PENGAMBILAN
              </p>
              <p className="mt-3">Terima kasih telah memesan di {PERCETAKAN_NAME}</p>
            </div>
          </div>
        </div>

        <div className="no-print bg-white p-5 border-t border-indigo-100 flex justify-end gap-3">
          <button onClick={handleDownloadImage} className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-sm"><Download className="w-4 h-4" /> Unduh</button>
          <button onClick={handleSendToAdminWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm"><Send className="w-4 h-4" /> WA Admin</button>
        </div>
      </div>
    </div>
  );
};
