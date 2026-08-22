import { useState, useEffect } from 'react';
import { CalendarDays, Home, Settings, Store, Users } from 'lucide-react';

// 🎯 引入同目錄下的其他美甲師元件
import StylistServiceSetting from './ServiceSetting';
import StylistPortfolio from './Portfolio'; 
// 🌟 核心新對接：引入妳真正的預約請求審核組件！
import AppointmentRequests from './AppointmentRequests';
import ScheduleCalendar from './ScheduleCalendar';
import { BUSINESS_TIME_SLOTS, DEFAULT_PORTFOLIO_IMAGES, dateFromToday, fetchOwnedShop, filterBusinessTimeSlots, formatPrice, parsePrice, supabase } from '../../lib/supabase';

const demoAppointmentStorageKey = 'nail-lab-demo-appointments';

const colors = {
  primary: '#852936',
  secondary: '#E1AEBC',
  accent: '#C5D9E2',
  background: 'rgba(255, 255, 255, 0.42)',
  darkCard: '#852936',
  purpleNotice: '#852936',
  lightBlueCard: '#C5D9E2',
  textDark: '#111111',
  textMuted: '#8E929B',
  success: '#2b9348',
  danger: '#d90429',      // 警示紅（放鳥聯防用）
  white: 'rgba(255, 255, 255, 0.42)',
  gray: 'rgba(255, 255, 255, 0.28)'
};

function readDemoAppointments() {
  try {
    return JSON.parse(window.localStorage.getItem(demoAppointmentStorageKey) || '[]');
  } catch {
    return [];
  }
}

function saveDemoAppointments(records) {
  window.localStorage.setItem(demoAppointmentStorageKey, JSON.stringify(records));
  window.dispatchEvent(new Event('nail-lab-demo-appointments-updated'));
}

// ==========================================
// 核心組件 1：美甲師營運儀表板
// ==========================================
function StylistDashboard({ appointments = [], requestCount = 0, onGoToRequests, onUpdateStatus, studioName }) {
  const consumerReviews = [
    { id: 1, user: '王*婷', rating: 5, comment: '美甲師超細心，甘皮剪得很乾淨，大推！', date: '2026-06-03' },
    { id: 2, user: '林*軒', rating: 4.8, comment: '貓眼折射很美，工作室冷氣剛好，很舒服。', date: '2026-06-01' }
  ];

  const handleReportNoShow = async (id, name) => {
    const confirmReport = window.confirm(`確定要將顧客【${name}】標記為未到嗎？`);
    if (confirmReport) {
      await onUpdateStatus(id, 'no_show');
    }
  };

  return (
    <div className="stylist-overview" style={{ width: '100%', background: 'transparent', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', boxSizing: 'border-box' }}>
      <style>{`
        .dashboard-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
        .stats-group { display: flex; gap: 16px; margin-bottom: 16px; }
        .sub-card { background: rgba(255, 255, 255, 0.34); padding: 20px; border-radius: 24px; box-shadow: 0 14px 34px rgba(89, 39, 49, 0.08); border: 1px solid rgba(255, 255, 255, 0.42); backdrop-filter: blur(22px); }
        @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; gap: 16px; } }
      `}</style>

      <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'rgba(255, 255, 255, 0.34)', padding: '16px 24px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.42)', boxShadow: '0 14px 34px rgba(89, 39, 49, 0.08)', backdropFilter: 'blur(22px)' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#5f5557', letterSpacing: '2px', marginBottom: '4px' }}>MANAGEMENT SYSTEM</div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: colors.textDark }}>{studioName} · 營運儀表板</h2>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="頭像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>

        <div className="dashboard-grid">
          <div>
            <div className="stats-group">
              <div style={{ flex: 1.8, background: colors.darkCard, borderRadius: '24px', padding: '24px', color: '#fff', boxShadow: '0 10px 25px rgba(17,22,37,0.1)' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255, 248, 245, 0.82)', marginBottom: '8px' }}>今日預計營收</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>$3,300</div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 248, 245, 0.86)', marginTop: '6px' }}>較上週同一天增加 +15%</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(133, 41, 54, 0.88)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255, 255, 255, 0.34)', boxShadow: '0 10px 25px rgba(89, 39, 49, 0.16)' }}>
                <div style={{ background: 'rgba(255, 248, 245, 0.18)', color: '#fff8f5', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>5</div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 248, 245, 0.82)', fontWeight: 'bold' }}>消費者評分</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff8f5' }}>4.9</div>
                <div style={{ fontSize: '10px', color: 'rgba(255, 248, 245, 0.76)', marginTop: '2px' }}>來自 48 位顧客</div>
              </div>
            </div>

            <div onClick={onGoToRequests} style={{ background: colors.purpleNotice, borderRadius: '24px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', cursor: 'pointer', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>!</span>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{requestCount} 個預約待審核</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 248, 245, 0.84)' }}>點擊查看服務、日期與時段並進行確認</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px' }}>❯</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.34)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.42)', boxShadow: '0 14px 34px rgba(89, 39, 49, 0.08)', backdropFilter: 'blur(22px)' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', color: colors.textDark, fontWeight: 'bold' }}>💬 最新消費者評價回饋 (App 連動)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {consumerReviews.map(rev => (
                  <div key={rev.id} style={{ background: colors.gray, padding: '12px', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                      <span>{rev.user} <span style={{ color: '#ffb703' }}>★ {rev.rating}</span></span>
                      <span style={{ color: '#4f4547' }}>{rev.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.34)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.42)', boxShadow: '0 14px 34px rgba(89, 39, 49, 0.08)', backdropFilter: 'blur(22px)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textDark, margin: '0 0 4px 0' }}>已確認預約 ({appointments.length})</h3>
              <p style={{ fontSize: '11px', color: '#5f5557', margin: '0 0 16px 0' }}>💡 若遇惡意缺席，可在右側點擊進行放鳥通報</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointments.map((item, idx) => (
                  <div key={item.id || idx} style={{ background: item.isNoShow ? '#FFF0F2' : 'rgba(255, 255, 255, 0.30)', borderRadius: '18px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255, 255, 255, 0.38)', opacity: item.isNoShow ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: item.isNoShow ? '#FFE0E3' : '#F4F5F8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{item.isNoShow ? '!' : 'T'}</div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: item.isNoShow ? colors.danger : colors.textDark }}>{item.customerName} {item.isNoShow && '(已黑名單)'}</div>
                        <div style={{ fontSize: '12px', color: colors.textMuted }}>{item.time} · {item.service}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: colors.textDark, marginBottom: '4px' }}>{item.price}</div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => onUpdateStatus(item.id, 'completed')} style={{ background: 'rgba(255, 255, 255, 0.30)', border: `1px solid ${colors.success}`, color: colors.success, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>完成</button>
                        <button onClick={() => handleReportNoShow(item.id, item.customerName)} style={{ background: 'rgba(255, 255, 255, 0.30)', border: `1px solid ${colors.danger}`, color: colors.danger, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>未到</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.34)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.42)', boxShadow: '0 14px 34px rgba(89, 39, 49, 0.08)', backdropFilter: 'blur(22px)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textDark, margin: '0 0 16px 0' }}>熱門項目貢獻排行</h3>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}><span>貓眼晶石系列</span><span>45%</span></div>
                <div style={{ width: '100%', height: '6px', background: '#F0F2F5', borderRadius: '3px' }}><div style={{ width: '45%', height: '100%', background: colors.secondary, borderRadius: '3px' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 核心組件 2：美甲師季度班表設定
// ==========================================
function StylistCalendarSetting({ scheduleDatabase = {}, setScheduleDatabase = () => {}, onSaveSchedule }) {
  const now = new Date();
  const availableMonths = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() + index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthIndex, setMonthIndex] = useState(0);
  const currentMonth = availableMonths[monthIndex];
  const [selectedDate, setSelectedDate] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  );
  const timeSlots = BUSINESS_TIME_SLOTS;

  const year = parseInt(currentMonth.split('-')[0]);
  const month = parseInt(currentMonth.split('-')[1]);
  const totalDays = new Date(year, month, 0).getDate();
  const blankCells = new Date(year, month - 1, 1).getDay();

  const currentDayTimes = scheduleDatabase[selectedDate] || [];

  const toggleTimeSlot = (time) => {
    let updatedTimes = currentDayTimes.includes(time) ? currentDayTimes.filter(t => t !== time) : [...currentDayTimes, time];
    setScheduleDatabase({ ...scheduleDatabase, [selectedDate]: updatedTimes });
  };

  return (
    <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.34)', border: '1px solid rgba(255, 255, 255, 0.42)', boxShadow: '0 14px 34px rgba(89, 39, 49, 0.08)', backdropFilter: 'blur(22px)', borderRadius: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '15px', textAlign: 'left' }}>
        <span style={{ fontSize: '11px', color: colors.secondary, fontWeight: 'bold' }}>QUARTERLY SCHEDULE</span>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>季度班表設定</h2>
      </div>
      <div style={{ background: 'rgba(255, 255, 255, 0.30)', border: `1px solid ${colors.accent}`, borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button disabled={monthIndex === 0} onClick={() => { setMonthIndex(monthIndex - 1); setSelectedDate(`${availableMonths[monthIndex - 1]}-01`); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.primary, fontWeight: 'bold' }}>◀ 上個月</button>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: colors.primary }}>{year}年 {month}月</div>
          <button disabled={monthIndex === availableMonths.length - 1} onClick={() => { setMonthIndex(monthIndex + 1); setSelectedDate(`${availableMonths[monthIndex + 1]}-01`); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.primary, fontWeight: 'bold' }}>下個月 ▶</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '12px', color: '#aaa', marginBottom: '12px' }}>
          <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '10px', textAlign: 'center', fontSize: '14px' }}>
          {Array.from({ length: blankCells }).map((_, i) => <span key={i}></span>)}
          {Array.from({ length: totalDays }).map((_, i) => {
            const d = i + 1;
            const str = `${currentMonth}-${d < 10 ? '0' + d : d}`;
            const isSel = selectedDate === str;
            return (
              <div key={d} onClick={() => setSelectedDate(str)} style={{ cursor: 'pointer', margin: '0 auto', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: isSel ? colors.primary : 'transparent', color: isSel ? '#fff' : '#333', fontWeight: 'bold' }}>{d}</div>
            );
          })}
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: colors.primary }}>{selectedDate} 班表設定</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '10px' }}>
          {timeSlots.map(t => {
            const isSel = currentDayTimes.includes(t);
            return (
              <button key={t} onClick={() => toggleTimeSlot(t)} style={{ padding: '10px 0', borderRadius: '10px', border: isSel ? 'none' : '1px solid #eee', background: isSel ? colors.secondary : colors.gray, color: isSel ? '#fff' : '#333', fontSize: '12px', cursor: 'pointer' }}>{t}</button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={onSaveSchedule}
        style={{ width: '100%', marginTop: '22px', padding: '12px', border: 'none', borderRadius: '8px', background: colors.primary, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
      >
        儲存班表
      </button>
    </div>
  );
}

// ==========================================
// 🌟 總大腦控制台
// ==========================================
export default function StylistMainDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [isMainRailOpen, setIsMainRailOpen] = useState(false);
  const [scheduleDatabase, setScheduleDatabase] = useState({});
  const [studioName, setStudioName] = useState('預設美甲沙龍');
  const [rules, setRules] = useState(`1. 預約請遲到不超過 15 分鐘。\n2. 現場不開放陪同者。`);
  const [announcement, setAnnouncement] = useState('本月新客預約享保養折抵，歡迎提前傳款式參考圖。');
  const [cancellationPolicy, setCancellationPolicy] = useState('預約前 24 小時可取消並退還訂金；24 小時內取消訂金不退。');
  const [paymentMethods, setPaymentMethods] = useState('LINE Pay、轉帳、現金');
  const [address, setAddress] = useState(currentUser?.location || '台北市大安區');
  const [depositSettings, setDepositSettings] = useState({ enabled: true, type: 'percent', value: 30, refundHours: 24 });
  const [portfolioImages, setPortfolioImages] = useState(DEFAULT_PORTFOLIO_IMAGES);

  const [requestsList, setRequestsList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [allAppointmentsList, setAllAppointmentsList] = useState([]);
  const [shopId, setShopId] = useState(null);
  
  const [myShopData, setMyShopData] = useState({
    id: 'shop-1',
    name: currentUser?.studioName || currentUser?.name || '我的美甲沙龍',
    services: []
  });
  const isLocalDemo = Boolean(
    currentUser?.isLocalDemo ||
    (import.meta.env.DEV && [
      '8d02c359-38c4-4a6d-b4ba-7f9c44b32d2b',
      '53988bcc-0fd2-4b60-8af3-c51786275361'
    ].includes(currentUser?.id))
  );
  const demoStorageKey = `nail-lab-demo-stylist-${currentUser?.id || 'guest'}`;

  const readDemoStorage = () => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(window.localStorage.getItem(demoStorageKey) || '{}');
    } catch {
      return {};
    }
  };

  const saveDemoStorage = (patch) => {
    if (typeof window === 'undefined') return;
    const next = { ...readDemoStorage(), ...patch };
    window.localStorage.setItem(demoStorageKey, JSON.stringify(next));
  };

  const getCurrentUserId = async () => {
    if (currentUser?.id) return currentUser.id;

    const { data } = await supabase.auth.getUser();
    return data.user?.id;
  };

  const createDefaultShop = async (ownerId) => {
    const { data: shop, error } = await supabase
      .from('shops')
      .insert({
        owner_id: ownerId,
        studio_name: currentUser.studioName || currentUser.name || '我的美甲沙龍',
        location: currentUser.location || '台北市大安區',
        rules: '1. 預約請遲到不超過 15 分鐘，逾時自動取消。\n2. 現場操作不開放攜帶寵物與陪同者。\n3. 如需卸甲請於預約時提前備註。',
        tags: ['韓系', '貓眼'],
        image_text: ''
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('services').insert([
      { shop_id: shop.id, name: '經典單色美甲', price: 1200, duration: 60 },
      { shop_id: shop.id, name: '法式優雅彩繪', price: 1599, duration: 120 },
      { shop_id: shop.id, name: '精緻微奢晶石貓眼', price: 1600, duration: 90 }
    ]);

    await supabase.from('schedules').insert([
      { shop_id: shop.id, work_date: dateFromToday(1), time_slots: ['09:00', '10:00', '11:00'] },
      { shop_id: shop.id, work_date: dateFromToday(2), time_slots: ['14:00', '15:00'] },
      { shop_id: shop.id, work_date: dateFromToday(3), time_slots: ['10:00', '13:00', '16:00'] }
    ]);

    await supabase.from('portfolio_images').insert([
      { shop_id: shop.id, image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800', sort_order: 0 },
      { shop_id: shop.id, image_url: 'https://i0.wp.com/greenweddingshoes.com/wp-content/uploads/2025/07/3D-mermaid-beach-nail-ideas-for-2025-ocean-vacation.jpg?fit=1024%2C9999', sort_order: 1 }
    ]);

    return fetchOwnedShop(ownerId);
  };

  const ensureShop = async () => {
    if (shopId) return shopId;

    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      throw new Error('找不到目前登入的 Supabase 使用者 ID，請登出後重新登入。');
    }

    if (isLocalDemo) {
      const demoData = readDemoStorage();
      const demoShopId = demoData.shopId || `demo-shop-${ownerId}`;
      const demoServices = Array.isArray(demoData.services) && demoData.services.length > 0
        ? demoData.services
        : [
            { id: 'demo-service-1', name: '經典單色美甲', price: '1200', duration: '60' },
            { id: 'demo-service-2', name: '法式優雅彩繪', price: '1599', duration: '120' },
            { id: 'demo-service-3', name: '精緻微奢晶石貓眼', price: '1600', duration: '90' }
          ];
      const demoSchedule = demoData.schedule && typeof demoData.schedule === 'object'
        ? demoData.schedule
        : {};
      const demoPortfolioImages = Array.isArray(demoData.portfolioImages) && demoData.portfolioImages.length > 0
        ? demoData.portfolioImages
        : DEFAULT_PORTFOLIO_IMAGES;
      const demoStudioName = demoData.studioName || currentUser?.studioName || currentUser?.name || 'yyc nail';

      setShopId(demoShopId);
      setStudioName(demoStudioName);
      setRules(demoData.rules || '1. 預約請遲到不超過 15 分鐘，逾時自動取消。\n2. 現場操作不開放攜帶寵物與陪同者。\n3. 如需卸甲請於預約時提前備註。');
      setAnnouncement(demoData.announcement || '本月新客預約享保養折抵，歡迎提前傳款式參考圖。');
      setCancellationPolicy(demoData.cancellationPolicy || '預約前 24 小時可取消並退還訂金；24 小時內取消訂金不退。');
      setPaymentMethods(demoData.paymentMethods || 'LINE Pay、轉帳、現金');
      setAddress(demoData.address || currentUser?.location || '台北市大安區');
      setDepositSettings(demoData.depositSettings || { enabled: true, type: 'percent', value: 30, refundHours: 24 });
      setPortfolioImages(demoPortfolioImages);
      setScheduleDatabase(demoSchedule);
      setMyShopData({ id: demoShopId, name: demoStudioName, services: demoServices });
      saveDemoStorage({ shopId: demoShopId, services: demoServices, portfolioImages: demoPortfolioImages });

      return demoShopId;
    }

    let shop = await fetchOwnedShop(ownerId);
    if (!shop) {
      shop = await createDefaultShop(ownerId);
    }
    if (!shop?.id) {
      throw new Error('找不到工作室資料，請確認 shops 表有這位美甲師的工作室。');
    }

    const demoData = isLocalDemo ? readDemoStorage() : {};
    const demoServices = Array.isArray(demoData.services) ? demoData.services : null;
    const demoSchedule = demoData.schedule && typeof demoData.schedule === 'object' ? demoData.schedule : null;

    setShopId(shop.id);
    setStudioName(demoData.studioName || shop.studioName || shop.name || '我的美甲沙龍');
    setRules(demoData.rules || shop.rules || '');
    setAnnouncement(demoData.announcement || '本月新客預約享保養折抵，歡迎提前傳款式參考圖。');
    setCancellationPolicy(demoData.cancellationPolicy || '預約前 24 小時可取消並退還訂金；24 小時內取消訂金不退。');
    setPaymentMethods(demoData.paymentMethods || 'LINE Pay、轉帳、現金');
    setAddress(demoData.address || shop.location || currentUser?.location || '台北市大安區');
    setDepositSettings(demoData.depositSettings || { enabled: true, type: 'percent', value: 30, refundHours: 24 });
    const demoPortfolioImages = Array.isArray(demoData.portfolioImages) && demoData.portfolioImages.length > 0
      ? demoData.portfolioImages
      : null;
    setPortfolioImages(demoPortfolioImages || shop.portfolioImages || DEFAULT_PORTFOLIO_IMAGES);
    setScheduleDatabase(demoSchedule || shop.schedule || {});
    setMyShopData({ id: shop.id, name: demoData.studioName || shop.name, services: demoServices || shop.services || [] });

    return shop.id;
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      const loadedShopId = await ensureShop();

      if (isLocalDemo) {
        const formatted = readDemoAppointments()
          .filter(item => item.shop_id === loadedShopId)
          .map(item => ({
            id: item.id,
            time: item.appointment_time,
            date: item.appointment_date,
            customerName: item.customer_name,
            service: item.service_name,
            price: formatPrice(item.price),
            depositAmount: item.deposit_amount ? formatPrice(item.deposit_amount) : '',
            remainingAmount: item.remaining_amount ? formatPrice(item.remaining_amount) : '',
            styleRequest: item.style_request || '',
            customerNote: item.customer_note || '',
            contactInfo: item.contact_info || '',
            needsRemoval: Boolean(item.needs_removal),
            allergyNote: item.allergy_note || '',
            status: item.status
          }));

        setRequestsList(formatted.filter(item => item.status === 'pending' || item.status === 'paid'));
        setAppointmentsList(formatted.filter(item => item.status === 'approved'));
        setAllAppointmentsList(formatted);
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('shop_id', loadedShopId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map(item => ({
        id: item.id,
        time: item.appointment_time,
        date: item.appointment_date,
        customerName: item.customer_name,
        service: item.service_name,
        price: formatPrice(item.price),
        depositAmount: item.status === 'paid' ? '已付訂金' : '',
        styleRequest: item.style_request || '',
        customerNote: item.customer_note || '',
        contactInfo: item.contact_info || '',
        needsRemoval: Boolean(item.needs_removal),
        allergyNote: item.allergy_note || '',
        status: item.status
      }));

      setRequestsList(formatted.filter(item => item.status === 'pending' || item.status === 'paid'));
      setAppointmentsList(formatted.filter(item => item.status === 'approved'));
      setAllAppointmentsList(formatted);
    };

    loadDashboardData().catch(err => {
      console.error('Failed to fetch stylist data:', err);
      if (!isLocalDemo) {
        alert(`載入美甲師資料失敗：${err.message || '請稍後再試。'}`);
      }
    });
  }, [currentUser]);

  const updateScheduleDatabase = (newSchedule) => {
    setScheduleDatabase(prev => {
      const updated = typeof newSchedule === 'function' ? newSchedule(prev) : newSchedule;
      return updated;
    });
  };

  const saveScheduleSnapshot = async (scheduleSnapshot, successMessage) => {
    try {
      if (isLocalDemo) {
        setScheduleDatabase(scheduleSnapshot);
        saveDemoStorage({ schedule: scheduleSnapshot });
        alert(`${successMessage}\n\n目前是本機展示模式，資料已先存在這台電腦。`);
        return;
      }

      const targetShopId = await ensureShop();
      const rows = Object.entries(scheduleSnapshot)
        .filter(([work_date]) => work_date)
        .map(([work_date, time_slots]) => ({
          shop_id: targetShopId,
          work_date,
          time_slots: filterBusinessTimeSlots(Array.isArray(time_slots) ? time_slots : [])
        }));

      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('shop_id', targetShopId);
      if (deleteError) throw deleteError;

      if (rows.length > 0) {
        const { error: insertError } = await supabase.from('schedules').insert(rows);
        if (insertError) throw insertError;
      }

      alert(successMessage);
    } catch (err) {
      console.error('Failed to save schedule:', err);
      alert(`儲存班表失敗：${err.message || '請重試。'}`);
    }
  };

  const handleSaveSchedule = async () => {
    await saveScheduleSnapshot(scheduleDatabase, '班表已儲存，消費者預約頁會看到最新可預約時間。');
  };

  const handleCreateRestDates = async (dates = []) => {
    const nextSchedule = { ...scheduleDatabase };
    dates.forEach(date => {
      nextSchedule[date] = [];
    });
    setScheduleDatabase(nextSchedule);
    await saveScheduleSnapshot(nextSchedule, `已新增 ${dates.length} 天休息時段。`);
  };

  const handleUpdateServices = async (id, updatedServices) => {
    try {
      if (isLocalDemo) {
        const cleanServices = updatedServices
          .filter(service => service.name?.trim())
          .map((service, index) => ({
            id: service.id || `demo-service-${Date.now()}-${index}`,
            name: service.name.trim(),
            price: String(parsePrice(service.price)),
            duration: String(Number(service.duration || 60))
          }));

        setMyShopData(prev => ({ ...prev, services: cleanServices }));
        saveDemoStorage({ services: cleanServices });
        alert('已儲存服務項目。\n\n目前是本機展示模式，資料已先存在這台電腦。');
        return;
      }

      const targetShopId = await ensureShop();
      const { error: deleteError } = await supabase.from('services').delete().eq('shop_id', targetShopId);
      if (deleteError) throw deleteError;

      const cleanServices = updatedServices
        .filter(service => service.name?.trim())
        .map(service => ({
          shop_id: targetShopId,
          name: service.name.trim(),
          price: parsePrice(service.price),
          duration: Number(service.duration || 60)
        }));

      let savedServices = [];
      if (cleanServices.length > 0) {
        const { data, error } = await supabase.from('services').insert(cleanServices).select();
        if (error) throw error;
        savedServices = data || [];
      }

      setMyShopData(prev => ({
        ...prev,
        services: savedServices.map(service => ({
          id: service.id,
          name: service.name,
          price: String(service.price),
          duration: String(service.duration)
        }))
      }));
      alert('已儲存服務項目，消費者將可在工作室頁面看到最新項目。');
    } catch (err) {
      console.error('Failed to save services:', err);
      alert(`儲存服務項目失敗：${err.message || '請重試。'}`);
    }
  };

  const handleSaveShop = async () => {
    try {
      if (isLocalDemo) {
        saveDemoStorage({
          studioName,
          rules,
          announcement,
          cancellationPolicy,
          paymentMethods,
          address,
          depositSettings,
          portfolioImages
        });
        setMyShopData(prev => ({ ...prev, name: studioName }));
        alert('店鋪設定已儲存。\n\n目前是本機展示模式，資料已先存在這台電腦。');
        return;
      }

      const targetShopId = await ensureShop();

      const { error: shopError } = await supabase
        .from('shops')
        .update({ studio_name: studioName, rules })
        .eq('id', targetShopId);
      if (shopError) throw shopError;

      await supabase.from('portfolio_images').delete().eq('shop_id', targetShopId);
      if (portfolioImages.length > 0) {
        const { error: imagesError } = await supabase.from('portfolio_images').insert(
          portfolioImages.map((image_url, sort_order) => ({ shop_id: targetShopId, image_url, sort_order }))
        );
        if (imagesError) throw imagesError;
      }
      setMyShopData(prev => ({ ...prev, id: targetShopId, name: studioName }));
      alert('店鋪設定已成功儲存至 Supabase！');
    } catch (err) {
      console.error('Failed to save shop settings:', err);
      alert(`儲存店鋪設定失敗：${err.message || '請重試。'}`);
    }
  };

  // 🌟 處理核准按鈕：向後端發送請求，更新狀態並跳回首頁
  const handleApproveRequest = async (id) => {
    try {
      if (isLocalDemo) {
        const updatedRecords = readDemoAppointments().map(item => (
          item.id === id ? { ...item, status: 'approved' } : item
        ));
        saveDemoAppointments(updatedRecords);

        const approved = allAppointmentsList.find(item => item.id === id);
        if (approved) {
          setRequestsList(prev => prev.filter(item => item.id !== id));
          setAppointmentsList(prev => [{ ...approved, status: 'approved' }, ...prev]);
          setAllAppointmentsList(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
        }
        alert('已接受預約，訂金狀態已保留。');
        setActiveTab('schedule');
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      const approved = {
        id: data.id,
        time: data.appointment_time,
        date: data.appointment_date,
        customerName: data.customer_name,
        service: data.service_name,
        price: formatPrice(data.price),
        status: data.status
      };

      setRequestsList(prev => prev.filter(item => item.id !== id));
      setAppointmentsList(prev => [approved, ...prev]);
      setAllAppointmentsList(prev => prev.map(item => item.id === id ? approved : item));
      alert('已接受預約，訂金狀態已保留。');
      setActiveTab('schedule');
    } catch (err) {
      console.error('Failed to approve request:', err);
      alert(`接受預約失敗：${err.message || '請稍後再試。'}`);
    }
  };

  // 🌟 處理婉拒按鈕：向後端發送請求，更新狀態並跳回首頁
  const handleRejectRequest = async (id) => {
    try {
      if (isLocalDemo) {
        const currentRequest = allAppointmentsList.find(item => item.id === id);
        const updatedRecords = readDemoAppointments().map(item => (
          item.id === id ? { ...item, status: currentRequest?.status === 'paid' ? 'refunding' : 'rejected' } : item
        ));
        saveDemoAppointments(updatedRecords);
        setRequestsList(prev => prev.filter(item => item.id !== id));
        setAllAppointmentsList(prev => prev.map(item => item.id === id ? { ...item, status: currentRequest?.status === 'paid' ? 'refunding' : 'rejected' } : item));
        alert(currentRequest?.status === 'paid' ? '已婉拒，這筆訂金已進入退款處理中。' : '已安全婉拒，時段已釋出。');
        setActiveTab('schedule');
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (error) throw error;

      setRequestsList(prev => prev.filter(item => item.id !== id));
      setAllAppointmentsList(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
      alert('已安全婉拒，系統將代為發送客氣的取消通知');
      setActiveTab('schedule');
    } catch (err) {
      console.error('Failed to reject request:', err);
      alert(`婉拒預約失敗：${err.message || '請稍後再試。'}`);
    }
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      if (isLocalDemo) {
        const updatedRecords = readDemoAppointments().map(item => (
          item.id === id ? { ...item, status } : item
        ));
        saveDemoAppointments(updatedRecords);
        setAppointmentsList(prev => status === 'completed' || status === 'no_show'
          ? prev.filter(item => item.id !== id)
          : prev.map(item => item.id === id ? { ...item, status } : item));
        setAllAppointmentsList(prev => prev.map(item => item.id === id ? { ...item, status } : item));
        alert(status === 'completed' ? '已將預約標記為完成。' : status === 'refunded' ? '已標記為已退款。' : '預約狀態已更新。');
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw error;

      setAppointmentsList(prev => prev.filter(item => item.id !== id));
      setAllAppointmentsList(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      alert(status === 'completed' ? '已將預約標記為完成。' : '已將預約標記為未到。');
    } catch (err) {
      console.error('Failed to update appointment status:', err);
      alert(`更新預約狀態失敗：${err.message || '請稍後再試。'}`);
    }
  };

  const handleRescheduleAppointment = async (id, date, time) => {
    if (!date || !time) return;
    try {
      if (isLocalDemo) {
        const updatedRecords = readDemoAppointments().map(item => (
          item.id === id ? { ...item, appointment_date: date, appointment_time: time } : item
        ));
        saveDemoAppointments(updatedRecords);
        setAllAppointmentsList(prev => prev.map(item => item.id === id ? { ...item, date, time } : item));
        setAppointmentsList(prev => prev.map(item => item.id === id ? { ...item, date, time } : item));
        alert('已完成改期。');
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .update({ appointment_date: date, appointment_time: time })
        .eq('id', id);
      if (error) throw error;

      setAllAppointmentsList(prev => prev.map(item => item.id === id ? { ...item, date, time } : item));
      setAppointmentsList(prev => prev.map(item => item.id === id ? { ...item, date, time } : item));
      alert('已完成改期。');
    } catch (err) {
      console.error('Failed to reschedule appointment:', err);
      alert(`改期失敗：${err.message || '請稍後再試。'}`);
    }
  };

  const navItems = [
    { id: 'dashboard', label: '今日' },
    { id: 'schedule', label: '日曆' },
    { id: 'requests', label: '預約', badge: requestsList.length },
    { id: 'customers', label: '顧客' },
    { id: 'services', label: '商店' },
    { id: 'portfolio', label: '設定' }
  ];

  const mobileNavItems = [
    { id: 'dashboard', label: '今日', icon: Home },
    { id: 'schedule', label: '日曆', icon: CalendarDays },
    { id: 'customers', label: '客戶', icon: Users },
    { id: 'services', label: '商店', icon: Store },
    { id: 'portfolio', label: '設定', icon: Settings }
  ];

  const handleMainNav = (target) => {
    setActiveTab(target);
    setIsMainRailOpen(false);
  };

  return (
    <div className="stylist-dashboard-shell" style={{ minHeight: '100vh' }}>
      <style>{`
        .stylist-dashboard-shell {
          width: 100vw;
          margin-left: calc(50% - 50vw);
          background:
            linear-gradient(145deg, rgba(234, 212, 214, 0.42), rgba(197, 217, 226, 0.34) 46%, rgba(164, 93, 101, 0.24)),
            url('/login-tools-background.png') center / cover fixed;
        }
        .stylist-workspace {
          display: grid;
          grid-template-columns: 56px minmax(0, 1fr);
          gap: 18px;
          min-height: 100vh;
          padding: 28px 24px 40px;
          transition: grid-template-columns 420ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .stylist-workspace.rail-open {
          grid-template-columns: 180px minmax(0, 1fr);
        }
        .stylist-workspace > .calendar-rail {
          position: sticky;
          top: 20px;
          height: calc(100vh - 40px);
          min-height: 560px;
        }
        .stylist-workspace-content {
          min-width: 0;
        }
        .stylist-workspace .calendar-rail-nav button.active {
          background: rgba(255, 248, 242, 0.14);
          color: #fff8f2;
        }
        .stylist-workspace .stylist-nav-badge {
          float: right;
          margin-top: 1px;
          background: rgba(255, 248, 242, 0.18);
          color: #fff8f2;
        }
        .stylist-customer-placeholder {
          display: grid;
          gap: 8px;
          min-height: 280px;
          place-content: center;
          border: 1px solid rgba(234, 212, 214, 0.42);
          border-radius: 24px;
          background: rgba(255, 248, 245, 0.16);
          color: #4c4042;
          font-weight: 700;
          text-align: center;
          box-shadow: 0 18px 48px rgba(86, 10, 12, 0.12);
          backdrop-filter: blur(18px);
        }
        .stylist-customer-placeholder h2 {
          margin: 0;
          color: #560a0c;
          font-size: 26px;
        }
        .stylist-topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 26px;
          min-height: 74px;
          padding: 0 26px;
          border-bottom: 1px solid #ead4d6;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(14px);
        }
        .stylist-brand {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border: 0;
          background: transparent;
          color: ${colors.primary};
          font-size: 17px;
          font-weight: 850;
          white-space: nowrap;
        }
        .stylist-logout-button {
          justify-self: end;
          min-height: 34px;
          padding: 0 12px;
          border: 1px solid #ead4d6;
          border-radius: 999px;
          background: #fff7f8;
          color: ${colors.primary};
          font-size: 13px;
          font-weight: 850;
          white-space: nowrap;
        }
        .stylist-logout-button:hover {
          border-color: ${colors.secondary};
          background: #f9ecee;
        }
        .stylist-brand-mark {
          color: ${colors.primary};
          font-size: 15px;
        }
        .stylist-main-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          min-width: 0;
          overflow-x: auto;
        }
        .stylist-main-nav button {
          position: relative;
          min-height: 74px;
          padding: 0 0 2px;
          border: 0;
          border-bottom: 3px solid transparent;
          background: transparent;
          color: #666;
          font-size: 15px;
          font-weight: 800;
          white-space: nowrap;
        }
        .stylist-main-nav button.active {
          border-bottom-color: ${colors.secondary};
          color: ${colors.primary};
        }
        .stylist-nav-badge {
          display: inline-grid;
          min-width: 18px;
          height: 18px;
          margin-left: 5px;
          place-items: center;
          border-radius: 999px;
          background: ${colors.secondary};
          color: white;
          font-size: 11px;
        }
        @media (max-width: 900px) {
          .stylist-workspace {
            gap: 12px;
            padding: 16px 14px 28px;
          }
          .stylist-topbar {
            grid-template-columns: auto 1fr auto;
            gap: 8px;
            padding: 12px 16px;
          }
          .stylist-brand {
            grid-column: 1;
          }
          .stylist-logout-button {
            grid-column: 3;
            grid-row: 1;
          }
          .stylist-main-nav {
            grid-column: 1 / -1;
            grid-row: 2;
            justify-content: flex-start;
          }
          .stylist-main-nav button {
            min-height: 42px;
          }
        }
        @media (max-width: 760px) {
          .stylist-workspace,
          .stylist-workspace.rail-open {
            display: block;
            min-height: 100vh;
            padding: 14px 12px 112px;
          }
          .stylist-workspace > .calendar-rail {
            display: none;
          }
        }
      `}</style>

      <div className={`stylist-workspace${isMainRailOpen ? ' rail-open' : ''}`}>
        <aside className={`calendar-rail${isMainRailOpen ? ' open' : ' collapsed'}`} aria-label="美甲師後台選單">
          <div className="calendar-rail-header">
            <button
              type="button"
              className="calendar-rail-toggle"
              aria-label={isMainRailOpen ? '收合選單' : '展開選單'}
              aria-expanded={isMainRailOpen}
              onClick={() => setIsMainRailOpen(prev => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
            <div className="calendar-rail-brand">
              <img src="/nail-lab-logo.png" alt="" />
              <span>Nail Lab</span>
            </div>
          </div>
          <nav className="calendar-rail-nav">
            <span className="muted">管理</span>
            {navItems.map(item => (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? 'active' : ''}
                onClick={() => handleMainNav(item.id)}
              >
                {item.label}
                {item.badge > 0 && <span className="stylist-nav-badge">{item.badge}</span>}
              </button>
            ))}
            <button type="button" className="stylist-rail-logout" onClick={onLogout}>登出</button>
          </nav>
        </aside>

        <main className="stylist-workspace-content">
        {activeTab === 'schedule' && (
          <ScheduleCalendar
            appointments={allAppointmentsList}
            scheduleDatabase={scheduleDatabase}
            studioName={studioName}
            onGoToRequests={() => setActiveTab('requests')}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onReschedule={handleRescheduleAppointment}
          />
        )}

        {activeTab === 'dashboard' && (
          <StylistDashboard 
            appointments={appointmentsList} 
            requestCount={requestsList.length} 
            onGoToRequests={() => setActiveTab('requests')} 
            onUpdateStatus={handleUpdateAppointmentStatus}
            studioName={studioName} 
          />
        )}

        {activeTab === 'customers' && (
          <section className="stylist-customer-placeholder">
            <h2>顧客</h2>
            <p>顧客資料會依預約紀錄整理在這裡。</p>
          </section>
        )}

        {activeTab === 'calendar' && (
          <StylistCalendarSetting
            scheduleDatabase={scheduleDatabase}
            setScheduleDatabase={updateScheduleDatabase}
            onSaveSchedule={handleSaveSchedule}
          />
        )}

        {activeTab === 'services' && (
          <StylistServiceSetting 
            shop={myShopData} 
            onUpdateServices={handleUpdateServices} 
            onBack={() => setActiveTab('schedule')} 
          />
        )}

        {/* 🌟 核心新對接：在這裡正式呼叫妳精緻的 AppointmentRequests 元件！ */}
        {activeTab === 'requests' && (
          <AppointmentRequests 
            requests={requestsList} 
            handleApprove={handleApproveRequest} 
            handleReject={handleRejectRequest} 
            onBack={() => setActiveTab('schedule')} 
          />
        )}

        {activeTab === 'portfolio' && (
          <StylistPortfolio 
            currentUser={currentUser} studioName={studioName} setStudioName={setStudioName}
            rules={rules} setRules={setRules} portfolioImages={portfolioImages} setPortfolioImages={setPortfolioImages}
            announcement={announcement} setAnnouncement={setAnnouncement}
            cancellationPolicy={cancellationPolicy} setCancellationPolicy={setCancellationPolicy}
            paymentMethods={paymentMethods} setPaymentMethods={setPaymentMethods}
            address={address} setAddress={setAddress}
            depositSettings={depositSettings} setDepositSettings={setDepositSettings}
            onSaveShop={handleSaveShop}
            onCreateRestDates={handleCreateRestDates}
          />
        )}
        </main>
      </div>

      <nav className="stylist-mobile-nav mobile-dock-nav" aria-label="美甲師手機導覽">
        {mobileNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (activeTab === 'requests' && item.id === 'dashboard');
          return (
            <button
              key={item.id}
              type="button"
              className={isActive ? 'active' : ''}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handleMainNav(item.id)}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
