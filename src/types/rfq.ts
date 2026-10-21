/**
 * Tipe data RFQ (Request for Quotation) sesuai spesifikasi bab 6.
 */

export type RfqStatus =
  | "submitted"
  | "under_review"
  | "needs_information"
  | "quoted"
  | "negotiation"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted_to_order";

export type QuotationStatus =
  | "draft"
  | "issued"
  | "accepted"
  | "rejected"
  | "expired"
  | "superseded";

export interface Rfq {
  id: string;
  rfq_number: string;
  organization_name: string;
  contact_name: string;
  business_email: string;
  delivery_location: string;
  required_date: string;
  status: RfqStatus;
  created_by: string | null;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RfqItem {
  id: string;
  rfq_id: string;
  product_id: string | null;
  product_name: string;
  product_details: string;
  quantity: number;
  unit: string;
  created_at: string;
}

export interface RfqStatusHistory {
  id: string;
  rfq_id: string;
  old_status: RfqStatus | null;
  new_status: RfqStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface Quotation {
  id: string;
  rfq_id: string;
  quotation_number: string;
  version: number;
  created_by: string | null;
  valid_until: string;
  status: QuotationStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  terms: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  rfq_item_id: string | null;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  created_at: string;
}

/** Payload pembuatan RFQ dari formulir frontend */
export interface CreateRfqInput {
  organizationName: string;
  contactName: string;
  businessEmail: string;
  deliveryLocation: string;
  requiredDate: string;
  items: Array<{
    productName: string;
    productDetails: string;
    quantity: number;
    unit: string;
  }>;
}

/** Label tampilan untuk status RFQ (UI Bahasa Indonesia) */
export const RFQ_STATUS_LABELS: Record<RfqStatus, string> = {
  submitted: "Diajukan",
  under_review: "Sedang ditinjau",
  needs_information: "Perlu informasi tambahan",
  quoted: "Penawaran dikirim",
  negotiation: "Negosiasi",
  accepted: "Disetujui",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
  converted_to_order: "Menjadi pesanan",
};

/**
 * Tipe data pesanan (order) B2C.
 */

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_proof_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/** Label tampilan untuk status pesanan (UI Bahasa Indonesia) */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Menunggu pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Disiapkan",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan dana",
};
