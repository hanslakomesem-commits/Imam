export interface FacultyData {
  id: string;
  name: string;
  code: string;
  defaultCoverColor: string;
  prodis: string[];
}

export type DurationKey = '1_day' | '2_day' | '3_day';

export interface DurationOption {
  key: DurationKey;
  label: string;
  days: number;
  pricePerCover: number;
  tag: string;
  description: string;
}

export interface ExtraServiceOption {
  id: string;
  label: string;
  price: number;
  requiresFile: boolean;
  description: string;
  badge?: string;
  promoTag?: string;
  // Specific prodi filters
  allowedProdiKeywords?: string[];
  specialProdiNote?: string;
}

export interface UploadedFileInfo {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  serviceCategory: string;
  dataUrl?: string;
}

export type TransactionStatus = 'Bayar Sekarang' | 'DP' | 'LUNAS';

export interface OrderRecord {
  orderId: string;
  studentName: string;
  fakultas: string;
  prodi: string;
  coverColor: string;
  whatsapp: string;
  coverCount: number;
  durationKey: DurationKey;
  durationLabel: string;
  durationDays: number;
  pricePerCover: number;
  coversSubtotal: number;
  selectedServices: string[];
  servicesBreakdown: Array<{
    id: string;
    label: string;
    price: number;
  }>;
  servicesSubtotal: number;
  totalCost: number;
  orderDate: string; // YYYY-MM-DD HH:mm
  pickupDate: string; // YYYY-MM-DD HH:mm
  uploadedFiles: UploadedFileInfo[];
  status: 'Menunggu' | 'Proses Jilid' | 'Siap Diambil' | 'Selesai';
  // Transaction and Payment specifications
  transactionStatus: TransactionStatus;
  dpAmount: number;
  remainingAmount: number;
  adminConfirmed: boolean;
  adminConfirmedAt?: string;
  adminConfirmedBy?: string;
  createdAt: number;
}
