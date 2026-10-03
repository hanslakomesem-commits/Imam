/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OrderForm } from './components/OrderForm';
import { InvoiceModal } from './components/InvoiceModal';
import { DatabaseSchemaModal } from './components/DatabaseSchemaModal';
import { OrderHistory } from './components/OrderHistory';
import { OrderRecord, TransactionStatus } from './types';
import { formatDateToCustom, computePickupDate } from './utils/pricing';

const STORAGE_KEY = 'uin_madura_skripsi_orders_v2';

const createSampleOrder = (): OrderRecord => {
  const now = new Date();
  const orderDate = formatDateToCustom(now);
  const pickupDate = computePickupDate(now, 1);

  return {
    orderId: 'NOT-20261003-882',
    studentName: 'Achmad Zaini Fawaid',
    fakultas: 'Fakultas Tarbiyah (FATAR)',
    prodi: 'Pendidikan Agama Islam (PAI)',
    coverColor: 'Hijau',
    whatsapp: '81234567890',
    coverCount: 3,
    durationKey: '1_day',
    durationLabel: '1 Hari Jadi',
    durationDays: 1,
    pricePerCover: 50000,
    coversSubtotal: 150000,
    selectedServices: ['cd', 'skek', 'pisah_perpus'],
    servicesBreakdown: [
      {
        id: 'cd',
        label: 'CD',
        price: 10000,
      },
      {
        id: 'skek',
        label: 'Buku SKEK',
        price: 5000,
      },
      {
        id: 'pisah_perpus',
        label: 'Pisah-pisah file untuk Perpus',
        price: 10000,
      },
    ],
    servicesSubtotal: 25000,
    totalCost: 175000,
    orderDate: orderDate,
    pickupDate: pickupDate,
    uploadedFiles: [
      {
        name: 'Skripsi_Lengkap_Achmad_Zaini.pdf',
        size: 3840210,
        type: 'application/pdf',
        uploadedAt: orderDate,
        serviceCategory: 'Perpustakaan & Repositori',
      },
    ],
    status: 'Siap Diambil',
    transactionStatus: 'DP',
    dpAmount: 88000,
    remainingAmount: 87000,
    adminConfirmed: true,
    adminConfirmedAt: orderDate,
    adminConfirmedBy: 'Admin Loket Percetakan',
    createdAt: Date.now() - 3600000 * 18,
  };
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'order' | 'history' | 'schema'>('order');
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [createSampleOrder()];
  });

  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<OrderRecord | null>(null);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  const handleOrderCreated = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    setActiveInvoiceOrder(newOrder);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    if (activeInvoiceOrder?.orderId === orderId) {
      setActiveInvoiceOrder(null);
    }
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    status: OrderRecord['status'],
    transactionStatus: TransactionStatus,
    adminConfirmed: boolean,
    adminConfirmedBy?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId !== orderId) return o;
        return {
          ...o,
          status,
          transactionStatus,
          adminConfirmed,
          adminConfirmedBy: adminConfirmed ? (adminConfirmedBy || 'Admin Loket') : undefined,
          adminConfirmedAt: adminConfirmed ? formatDateToCustom(new Date()) : undefined,
        };
      })
    );

    if (activeInvoiceOrder?.orderId === orderId) {
      setActiveInvoiceOrder((prev) =>
        prev
          ? {
              ...prev,
              status,
              transactionStatus,
              adminConfirmed,
              adminConfirmedBy: adminConfirmed ? (adminConfirmedBy || 'Admin Loket') : undefined,
              adminConfirmedAt: adminConfirmed ? formatDateToCustom(new Date()) : undefined,
            }
          : null
      );
    }
  };

  const handleToggleAdminConfirm = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId !== orderId) return o;
        const nextConfirm = !o.adminConfirmed;
        return {
          ...o,
          adminConfirmed: nextConfirm,
          adminConfirmedBy: nextConfirm ? 'Admin Loket Percetakan' : undefined,
          adminConfirmedAt: nextConfirm ? formatDateToCustom(new Date()) : undefined,
        };
      })
    );

    if (activeInvoiceOrder?.orderId === orderId) {
      setActiveInvoiceOrder((prev) =>
        prev
          ? {
              ...prev,
              adminConfirmed: !prev.adminConfirmed,
              adminConfirmedBy: !prev.adminConfirmed ? 'Admin Loket Percetakan' : undefined,
              adminConfirmedAt: !prev.adminConfirmed ? formatDateToCustom(new Date()) : undefined,
            }
          : null
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        orderCount={orders.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'order' && (
          <OrderForm onOrderCreated={handleOrderCreated} />
        )}

        {currentTab === 'history' && (
          <OrderHistory
            orders={orders}
            onSelectOrder={(ord) => setActiveInvoiceOrder(ord)}
            onDeleteOrder={handleDeleteOrder}
            onCreateNew={() => setCurrentTab('order')}
            onToggleAdminConfirm={handleToggleAdminConfirm}
          />
        )}

        {currentTab === 'schema' && (
          <DatabaseSchemaModal
            currentOrder={activeInvoiceOrder || orders[0] || null}
            onClose={() => setCurrentTab('order')}
          />
        )}
      </main>

      {/* Modal Nota / Invoice */}
      {activeInvoiceOrder && (
        <InvoiceModal
          order={activeInvoiceOrder}
          onClose={() => setActiveInvoiceOrder(null)}
          onViewSchema={() => {
            setActiveInvoiceOrder(null);
            setCurrentTab('schema');
          }}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">
              Sistem Nota & Jilid Hard Cover Skripsi UIN Madura
            </span>
            <span>•</span>
            <span>Verifikasi Transaksi DP & LUNAS oleh Admin</span>
          </div>
          <div>
            Format Resmi Fakultas &bull; FATAR (Hijau) &bull; FEBI (Kuning) &bull; USULUDDIN (Biru) &bull; FASYA (Merah/Marron)
          </div>
        </div>
      </footer>
    </div>
  );
}
