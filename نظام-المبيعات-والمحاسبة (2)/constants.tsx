
import { SaleRecord, Product, Customer } from './types';

//  تفريغ البيانات عشان يبدأ النظام من الصفر
export const MOCK_SALES: SaleRecord[] = [];

export const MOCK_CUSTOMERS: Customer[] = [];

export const MOCK_PRODUCTS: Product[] = [];

// بيانات الرسم البياني تبدأ فاضية أو بأصفار للشهر الحالي
export const REVENUE_CHART_DATA = [
  { name: 'يناير', current: 0, previous: 0 },
  { name: 'فبراير', current: 0, previous: 0 },
  { name: 'مارس', current: 0, previous: 0 },
  { name: 'أبريل', current: 0, previous: 0 },
  { name: 'مايو', current: 0, previous: 0 },
  { name: 'يونيو', current: 0, previous: 0 },
];
