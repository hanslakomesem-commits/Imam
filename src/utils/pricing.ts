import { DurationKey, OrderRecord, TransactionStatus, CoverType } from '../types';
import { DURATION_OPTIONS, EXTRA_SERVICES, ADMIN_WHATSAPP_INTL, ADMIN_WHATSAPP } from '../data/uinMaduraData';

export const formatIDR = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

export const padZero = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const formatDateToCustom = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = padZero(date.getMonth() + 1);
  const dd = padZero(date.getDate());
  const hh = padZero(date.getHours());
  const min = padZero(date.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

export const formatDisplayDate = (dateStr: string): string => {
  try {
    const [datePart, timePart] = dateStr.split(' ');
    const [y, m, d] = datePart.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayName = dayNames[dateObj.getDay()];
    const monthName = monthNames[dateObj.getMonth()];
    return `${dayName}, ${parseInt(d)} ${monthName} ${y} pukul ${timePart || '08:00'} WIB`;
  } catch {
    return dateStr;
  }
};

export const computePickupDate = (baseDate: Date, durationDays: number): string => {
  const pickup = new Date(baseDate.getTime());
  pickup.setDate(pickup.getDate() + durationDays);
  // Set to 08:00 AM
  pickup.setHours(8, 0, 0, 0);
  return formatDateToCustom(pickup);
};

export const generateOrderCode = (date: Date = new Date()): string => {
  const yyyy = date.getFullYear();
  const mm = padZero(date.getMonth() + 1);
  const dd = padZero(date.getDate());
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `NOT-${yyyy}${mm}${dd}-${randomSuffix}`;
};

export const calculateOrderPricing = (
  coverCount: number,
  durationKey: DurationKey,
  selectedServiceIds: string[],
  pageCount: number = 0,
  coverType: CoverType = 'hard_cover'
) => {
  const durationOpt = DURATION_OPTIONS.find((d) => d.key === durationKey) || DURATION_OPTIONS[2];
  const count = Math.max(1, Math.floor(coverCount || 1));
  
  // Soft cover: Rp 15.000 / jilid; Hard cover: based on duration
  const pricePerCover = coverType === 'soft_cover' ? 15000 : durationOpt.pricePerCover;
  const coversSubtotal = pricePerCover * count;

  const servicesBreakdown = selectedServiceIds
    .map((id) => {
      const item = EXTRA_SERVICES.find((s) => s.id === id);
      if (!item) return null;

      let price = item.price;

      // Special dynamic pricing logic
      if (item.id === 'dummy_book' && pageCount > 0) {
        if (pageCount >= 80 && pageCount <= 110) price = 50000;
        else if (pageCount >= 111 && pageCount <= 130) price = 65000;
        else if (pageCount >= 131 && pageCount <= 160) price = 70000;
        else if (pageCount >= 161 && pageCount <= 180) price = 75000;
      } else if (item.id === 'cetak_a5_ipa' && pageCount > 0) {
        if (pageCount >= 80 && pageCount <= 100) price = 23000;
        else if (pageCount >= 101 && pageCount <= 130) price = 24000;
        else if (pageCount >= 131 && pageCount <= 160) price = 25000;
        else if (pageCount >= 161 && pageCount <= 180) price = 27000;
      }

      return { id: item.id, label: item.label, price };
    })
    .filter(Boolean) as Array<{ id: string; label: string; price: number }>;

  const servicesSubtotal = servicesBreakdown.reduce((sum, item) => sum + item.price, 0);
  const totalCost = coversSubtotal + servicesSubtotal;

  const standardDp = Math.ceil((totalCost * 0.5) / 1000) * 1000;

  return {
    count,
    coverType,
    pricePerCover,
    durationOpt,
    coversSubtotal,
    servicesBreakdown,
    servicesSubtotal,
    totalCost,
    standardDp,
  };
};

export const createWhatsAppTextForAdmin = (order: OrderRecord): string => {
  const servicesList =
    order.servicesBreakdown.length > 0
      ? order.servicesBreakdown.map((s) => `  • ${s.label}: ${formatIDR(s.price)}`).join('\n')
      : '  (Tidak ada layanan tambahan)';

  const fileCount = order.uploadedFiles?.length || 0;
  const fileText =
    fileCount > 0
      ? `\n*Lampiran Berkas:* ${fileCount} file (${order.uploadedFiles.map((f) => f.name).join(', ')})`
      : '';

  let paymentDetail = `*Status Transaksi:* [ ${order.transactionStatus} ]`;
  paymentDetail += `\n*Biaya Print:* ${formatIDR(order.printCost)}`;
  if (order.transactionStatus === 'DP') {
    paymentDetail += `\n*Uang Muka (DP):* ${formatIDR(order.dpAmount)}\n*Sisa Tagihan Saat Ambil:* ${formatIDR(order.remainingAmount)}`;
  } else if (order.transactionStatus === 'LUNAS') {
    paymentDetail += `\n*Nominal Lunas:* ${formatIDR(order.totalCost + order.printCost)} (Sudah Dibayar)`;
  } else if (order.transactionStatus === 'Bayar Nanti') {
    paymentDetail += `\n*Metode:* Bayar Nanti di Loket Saat Pengambilan\n*Total Bayar:* ${formatIDR(order.totalCost + order.printCost)}`;
  } else {
    paymentDetail += `\n*Tagihan Loket / Transfer:* ${formatIDR(order.totalCost + order.printCost)}`;
  }

  const adminValidation = order.adminConfirmed
    ? `\n✅ *Status Validasi Admin:* SUDAH DIKONFIRMASI (${order.adminConfirmedBy || 'Admin'})`
    : `\n⏳ *Status Validasi Admin:* MENUNGGU KONFIRMASI ADMIN LOKET`;

  const coverLabel = order.coverType === 'soft_cover' ? 'Soft Cover' : `Hard Cover (${order.coverColor})`;

  return `*STRUK PEMBAYARAN & NOTA PESANAN - ZAIN.NET*
================================
*ZAIN.NET*
Alamat: Utaranya Indomaret Uin Madura , barat jalan ,samping nya BRI Link
WA Admin: ${ADMIN_WHATSAPP}
================================
*No. Nota:* ${order.orderId}
*Tanggal Masuk:* ${order.orderDate} WIB

*DATA PEMESAN:*
• Nama Mahasiswa: ${order.studentName}
• Fakultas: ${order.fakultas}
• Prodi: ${order.prodi}
• Jenis Jilid: *${coverLabel}*
• No. WhatsApp: https://wa.me/62${order.whatsapp.replace(/\D/g, '')}

*RINCIAN ORDER:*
• Jumlah Buku: ${order.coverCount} eksemplar
• Jenis Jilid: ${order.coverType === 'soft_cover' ? 'Soft Cover' : 'Hard Cover'} (${formatIDR(order.pricePerCover)}/buku)
• Subtotal Jilid: ${formatIDR(order.coversSubtotal)}

*LAYANAN TAMBAHAN:*
${servicesList}
• Subtotal Layanan: ${formatIDR(order.servicesSubtotal)}
--------------------------------
*TOTAL BIAYA: ${formatIDR(order.totalCost + order.printCost)}*
${paymentDetail}${adminValidation}
================================
*JADWAL PENGAMBILAN (PASTI):*
📅 *${formatDisplayDate(order.pickupDate)}*
(Pukul 08:00 WIB di ZAIN.NET)
================================
*Tunjukkan bukti struk ini saat mengambil naskah di ZAIN.NET.*`;
};

export const getAdminWhatsAppUrl = (order: OrderRecord): string => {
  const text = encodeURIComponent(createWhatsAppTextForAdmin(order));
  return `https://wa.me/${ADMIN_WHATSAPP_INTL}?text=${text}`;
};

export const createWhatsAppText = (order: OrderRecord): string => {
  return createWhatsAppTextForAdmin(order);
};

export const getFirestoreSchemaSnippet = () => {
  return {
    collection: "orders",
    document_id: "NOT-20261003-782",
    admin_notification: {
      targetWhatsAppAdmin: ADMIN_WHATSAPP,
      autoSent: true,
      exportFormat: "JPG & WhatsApp Payload"
    },
    schema_fields: {
      orderId: "string (e.g. NOT-20261003-782)",
      studentName: "string (e.g. Achmad Farhan)",
      fakultas: "string (e.g. Fakultas Tarbiyah (FATAR))",
      prodi: "string (e.g. Pendidikan Islam Anak Usia Dini (PIAUD))",
      coverColor: "string (FATAR: Hijau, FEBI: Kuning, FAUD: Biru, FASYA HKI: Merah, FASYA HES/HTN: Marron)",
      whatsapp: "string (e.g. 81234567890)",
      coverCount: "number (e.g. 3)",
      durationKey: "string ('1_day' | '2_day' | '3_day')",
      durationLabel: "string (e.g. 1 Hari Jadi)",
      durationDays: "number (e.g. 1)",
      pricePerCover: "number (e.g. 50000)",
      coversSubtotal: "number (e.g. 150000)",
      selectedServices: ["artikel", "cd", "skek", "pisah_perpus", "dummy_book", "cetak_a5_ipa"],
      servicesBreakdown: [
        { "id": "skek", "label": "Buku SKEK", "price": 5000 },
        { "id": "dummy_book", "label": "DUMMY BOOK (Khusus PIAUD)", "price": 20000 }
      ],
      servicesSubtotal: "number (e.g. 25000)",
      totalCost: "number (e.g. 175000)",
      orderDate: "string (ISO format 'YYYY-MM-DD HH:mm')",
      pickupDate: "string (calculated 'orderDate + durationDays')",
      status: "string ('Menunggu' | 'Proses Jilid' | 'Siap Diambil' | 'Selesai')",
      transactionStatus: "string ('Bayar Sekarang' | 'DP' | 'LUNAS')",
      dpAmount: "number (e.g. 88000)",
      remainingAmount: "number (e.g. 87000)",
      adminConfirmed: "boolean (true if confirmed by admin)",
      adminConfirmedAt: "string | null",
      adminConfirmedBy: "string | null",
      createdAt: "number (unix epoch milliseconds)"
    }
  };
};
