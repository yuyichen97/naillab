import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUSINESS_TIME_SLOTS = Array.from({ length: 29 }, (_, index) => {
  const totalMinutes = (8 * 60) + (index * 30);
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
});

export const DEFAULT_PORTFOLIO_IMAGES = [
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop',
  'https://i0.wp.com/greenweddingshoes.com/wp-content/uploads/2025/07/3D-mermaid-beach-nail-ideas-for-2025-ocean-vacation.jpg?fit=1024%2C9999'
];

export function filterBusinessTimeSlots(timeSlots = []) {
  const allowedSlots = new Set(BUSINESS_TIME_SLOTS);
  return timeSlots.filter(time => allowedSlots.has(time)).sort();
}

export function formatPrice(price) {
  return `$${Number(price || 0).toLocaleString()}`;
}

export function parsePrice(price) {
  if (typeof price === 'number') return price;
  return Number(String(price || '0').replace(/[^\d]/g, '')) || 0;
}

export function dateFromToday(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getStudioDisplayName(name) {
  return name === '暮色美甲沙龍' ? 'yyc nail' : name;
}

export function normalizeShop(shop) {
  const portfolioImages = (shop.portfolio_images || [])
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(image => image.image_url);

  const schedule = {};
  (shop.schedules || []).forEach(item => {
    schedule[item.work_date] = filterBusinessTimeSlots(item.time_slots || []);
  });

  return {
    id: shop.id,
    ownerId: shop.owner_id,
    name: getStudioDisplayName(shop.studio_name),
    studioName: getStudioDisplayName(shop.studio_name),
    rating: String(shop.rating || '4.9'),
    location: shop.location || '台北市大安區',
    tags: shop.tags || [],
    imageText: shop.image_text || '',
    rules: shop.rules || '',
    portfolioImages: portfolioImages.length > 0 ? portfolioImages : DEFAULT_PORTFOLIO_IMAGES,
    services: (shop.services || []).map(service => ({
      id: service.id,
      name: service.name,
      price: String(service.price),
      duration: String(service.duration)
    })),
    schedule
  };
}

function fallbackShops() {
  return [
    {
      id: 'demo-yyc-nail',
      ownerId: '8d02c359-38c4-4a6d-b4ba-7f9c44b32d2b',
      name: 'yyc nail',
      studioName: 'yyc nail',
      rating: '4.9',
      location: '台北市大安區',
      tags: ['韓系', '貓眼', '簡約'],
      imageText: '',
      rules: '1. 預約請遲到不超過 15 分鐘，逾時自動取消。\n2. 現場操作不開放攜帶寵物與陪同者。\n3. 如需卸甲請於預約時提前備註。',
      announcement: '本月新客預約享保養折抵，歡迎提前傳款式參考圖。',
      cancellationPolicy: '預約前 24 小時可取消並退還訂金；24 小時內取消訂金不退。',
      paymentMethods: 'LINE Pay、轉帳、現金',
      address: '台北市大安區',
      depositSettings: {
        enabled: true,
        type: 'percentage',
        value: 30,
        refundHours: 24
      },
      portfolioImages: DEFAULT_PORTFOLIO_IMAGES,
      services: [
        { id: 'demo-service-1', name: '經典單色美甲', price: '1200', duration: '60' },
        { id: 'demo-service-2', name: '法式優雅彩繪', price: '1599', duration: '120' },
        { id: 'demo-service-3', name: '精緻微奢晶石貓眼', price: '1600', duration: '90' }
      ],
      schedule: {
        [dateFromToday(1)]: ['10:00', '11:00', '14:00', '15:30'],
        [dateFromToday(2)]: ['09:30', '13:00', '16:00'],
        [dateFromToday(3)]: ['10:30', '12:00', '17:30']
      }
    }
  ];
}

export async function fetchShops() {
  const { data, error } = await supabase
    .from('shops')
    .select(`
      id,
      owner_id,
      studio_name,
      rules,
      location,
      rating,
      tags,
      image_text,
      services(id, name, price, duration),
      schedules(id, work_date, time_slots),
      portfolio_images(id, image_url, sort_order)
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Using fallback shops because Supabase shops could not be loaded:', error.message || error);
    return fallbackShops();
  }

  const shops = (data || []).map(normalizeShop);
  return shops.length > 0 ? shops : fallbackShops();
}

export async function fetchOwnedShop(ownerId) {
  const { data, error } = await supabase
    .from('shops')
    .select(`
      id,
      owner_id,
      studio_name,
      rules,
      location,
      rating,
      tags,
      image_text,
      services(id, name, price, duration),
      schedules(id, work_date, time_slots),
      portfolio_images(id, image_url, sort_order)
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) throw error;
  return data?.[0] ? normalizeShop(data[0]) : null;
}
