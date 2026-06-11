import React, { useState, useEffect } from 'react';

// 🎯 引入同目錄下的其他美甲師元件
import StylistServiceSetting from './ServiceSetting';
import StylistPortfolio from './Portfolio'; 
// 🌟 核心新對接：引入妳真正的預約請求審核組件！
import AppointmentRequests from './AppointmentRequests';

const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  darkCard: '#111625',    // 深色質感營收卡片底色
  purpleNotice: '#633BF3',// 亮紫色待處理通知條
  lightBlueCard: '#F0F3F8',// 淺藍灰評分卡片底色
  textDark: '#111111',
  textMuted: '#8E929B',
  success: '#2b9348',
  danger: '#d90429',      // 警示紅（放鳥聯防用）
  white: '#ffffff',
  gray: '#f8f9fa'
};

// ==========================================
// 核心組件 1：美甲師營運儀表板
// ==========================================
function StylistDashboard({ requestCount = 1, onGoToRequests, studioName }) {
  const [localAppointments, setLocalAppointments] = useState([
    { id: 1, customerName: '陳圓圓', time: '11:00', service: '單色美甲', price: '$1,500', isNoShow: false },
    { id: 2, customerName: '李佳佳', time: '14:30', service: '法式漸層 + 貓眼', price: '$1,599', isNoShow: false }
  ]);

  const consumerReviews = [
    { id: 1, user: '王*婷', rating: 5, comment: '美甲師超細心，甘皮剪得很乾淨，大推！❤️', date: '2026-06-03' },
    { id: 2, user: '林*軒', rating: 4.8, comment: '貓眼折射很美，工作室冷氣剛好，很舒服。', date: '2026-06-01' }
  ];

  const handleReportNoShow = (id, name) => {
    const confirmReport = window.confirm(`確定要將顧客【${name}】標記為「惡意放鳥未到」並回報至聯防系統嗎？`);
    if (confirmReport) {
      setLocalAppointments(prev =>
        prev.map(item => item.id === id ? { ...item, isNoShow: true } : item)
      );
      alert(`🚨 舉發成功！【${name}】的放鳥紀錄已即時上傳至全台美甲誠信共享資料庫。`);
    }
  };

  return (
    <div style={{ width: '100%', background: '#f8f9fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', boxSizing: 'border-box' }}>
      <style>{`
        .dashboard-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
        .stats-group { display: flex; gap: 16px; margin-bottom: 16px; }
        .sub-card { background: #fff; padding: 20px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid #F5F6F8; }
        @media (max-width: 900px) { .dashboard-grid { grid-template-columns: 1fr; gap: 16px; } }
      `}</style>

      <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: '#fff', padding: '16px 24px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#B3B7C1', letterSpacing: '2px', marginBottom: '4px' }}>MANAGEMENT SYSTEM</div>
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
                <div style={{ fontSize: '12px', color: '#7E8494', marginBottom: '8px' }}>今日預計營收</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>$3,300</div>
                <div style={{ fontSize: '11px', color: colors.accent, marginTop: '6px' }}>較上週同一天增加 +15% 📈</div>
              </div>
              <div style={{ flex: 1, background: colors.lightBlueCard, borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid #E2E8F0' }}>
                <div style={{ background: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>⭐</div>
                <div style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 'bold' }}>消費者評分</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: colors.primary }}>4.9</div>
                <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>來自 48 位顧客</div>
              </div>
            </div>

            <div onClick={onGoToRequests} style={{ background: colors.purpleNotice, borderRadius: '24px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', cursor: 'pointer', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🚨</span>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{requestCount} 個預約待審核（已啟動全台放鳥聯防偵測）</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>點擊進入查看顧客在其他美甲店的歷史誠信紀錄</div>
                  </div>
                </div>
                <div style={{ fontSize: '14px' }}>❯</div>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '24px', border: '1px solid #F5F6F8' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', color: colors.textDark, fontWeight: 'bold' }}>💬 最新消費者評價回饋 (App 連動)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {consumerReviews.map(rev => (
                  <div key={rev.id} style={{ background: colors.gray, padding: '12px', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                      <span>{rev.user} <span style={{ color: '#ffb703' }}>★ {rev.rating}</span></span>
                      <span style={{ color: '#aaa' }}>{rev.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#444' }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #F5F6F8' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textDark, margin: '0 0 4px 0' }}>⏰ 今日預約安排 ({localAppointments.length})</h3>
              <p style={{ fontSize: '11px', color: colors.textMuted, margin: '0 0 16px 0' }}>💡 若遇惡意缺席，可在右側點擊進行放鳥通報</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {localAppointments.map((item, idx) => (
                  <div key={item.id || idx} style={{ background: '#ffffff', borderRadius: '18px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #F5F6F8', backgroundColor: item.isNoShow ? '#FFF0F2' : '#ffffff', opacity: item.isNoShow ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: item.isNoShow ? '#FFE0E3' : '#F4F5F8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{item.isNoShow ? '❌' : '⏰'}</div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: item.isNoShow ? colors.danger : colors.textDark }}>{item.customerName} {item.isNoShow && '(已黑名單)'}</div>
                        <div style={{ fontSize: '12px', color: colors.textMuted }}>{item.time} · {item.service}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: colors.textDark, marginBottom: '4px' }}>{item.price}</div>
                      {!item.isNoShow ? (
                        <button onClick={() => handleReportNoShow(item.id, item.customerName)} style={{ background: 'none', border: `1px solid ${colors.danger}`, color: colors.danger, padding: '2px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>🕊️ 通報放鳥</button>
                      ) : (
                        <span style={{ fontSize: '11px', color: colors.danger, fontWeight: 'bold' }}>已同步資料庫</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '24px', border: '1px solid #F5F6F8' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: colors.textDark, margin: '0 0 16px 0' }}>💅 熱門項目貢獻排行</h3>
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
function StylistCalendarSetting({ scheduleDatabase = {}, setScheduleDatabase = () => {} }) {
  const availableMonths = ['2026-06', '2026-07', '2026-08'];
  const [monthIndex, setMonthIndex] = useState(0);
  const currentMonth = availableMonths[monthIndex];
  const [selectedDate, setSelectedDate] = useState('2026-06-04');
  const timeSlots = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

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
    <div style={{ padding: '24px', background: '#fff', borderRadius: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '15px', textAlign: 'left' }}>
        <span style={{ fontSize: '11px', color: colors.secondary, fontWeight: 'bold' }}>QUARTERLY SCHEDULE</span>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>季度班表設定</h2>
      </div>
      <div style={{ background: '#fff', border: `1px solid ${colors.accent}`, borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button disabled={monthIndex === 0} onClick={() => setMonthIndex(monthIndex - 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.primary, fontWeight: 'bold' }}>◀ 上個月</button>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: colors.primary }}>{year}年 {month}月 📅</div>
          <button disabled={monthIndex === availableMonths.length - 1} onClick={() => setMonthIndex(monthIndex + 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.primary, fontWeight: 'bold' }}>下個月 ▶</button>
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
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: colors.primary }}>📍 {selectedDate} 班表設定</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '10px' }}>
          {timeSlots.map(t => {
            const isSel = currentDayTimes.includes(t);
            return (
              <button key={t} onClick={() => toggleTimeSlot(t)} style={{ padding: '10px 0', borderRadius: '10px', border: isSel ? 'none' : '1px solid #eee', background: isSel ? colors.secondary : colors.gray, color: isSel ? '#fff' : '#333', fontSize: '12px', cursor: 'pointer' }}>{t}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🌟 總大腦控制台
// ==========================================
export default function StylistMainDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scheduleDatabase, setScheduleDatabase] = useState({ '2026-06-04': ['11:00', '12:00'] });
  const [studioName, setStudioName] = useState('預設美甲沙龍');
  const [rules, setRules] = useState(`1. 預約請遲到不超過 15 分鐘。\n2. 現場不開放陪同者。`);
  const [portfolioImages, setPortfolioImages] = useState(["https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800"]);

  // 🌟 核心新對接：將預約名單資料交給 State 管理
  const [requestsList, setRequestsList] = useState([
    {
      id: 'req-1',
      customerName: '陳圓圓',
      phone: '0912-***-456',
      date: '2026-06-05',
      time: '11:00',
      price: '$1,500',
      service: '單色美甲'
    }
  ]);

  // 🌟 處理核准按鈕：從陣列剔除並跳回首頁
  const handleApproveRequest = (id) => {
    alert('🎉 已接受預約，建議發送預收訂金簡訊！');
    setRequestsList(prev => prev.filter(req => req.id !== id));
    setActiveTab('dashboard');
  };

  // 🌟 處理婉拒按鈕：從陣列剔除並跳回首頁
  const handleRejectRequest = (id) => {
    alert('❌ 已安全婉拒，系統將代為發送客氣的取消通知');
    setRequestsList(prev => prev.filter(req => req.id !== id));
    setActiveTab('dashboard');
  };

  const [myShopData, setMyShopData] = useState({
    id: 'shop-1',
    name: currentUser?.studioName || currentUser?.name || '我的美甲沙龍',
    services: [{ id: 's1', name: '經典單色美甲', price: '1200', duration: '60' }]
  });

  return (
    <div style={{ minHeight: '100vh', background: '#FFF0F2' }}>
      <div style={{ background: colors.primary, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>⭐ Nail Lab <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '6px' }}>後台管理</span></div>
        <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}>🚪 登出系統</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', background: '#fff', padding: '14px', borderBottom: '1px solid #f0f0f0', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ fontSize: '15px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'dashboard' ? colors.primary : '#666', borderBottom: activeTab === 'dashboard' ? `2px solid ${colors.primary}` : '2px solid transparent' }}>📈 營運分析</button>
        <button onClick={() => setActiveTab('calendar')} style={{ fontSize: '15px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'calendar' ? colors.primary : '#666', borderBottom: activeTab === 'calendar' ? `2px solid ${colors.primary}` : '2px solid transparent' }}>⏰ 班表設定</button>
        <button onClick={() => setActiveTab('services')} style={{ fontSize: '15px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'services' ? colors.primary : '#666', borderBottom: activeTab === 'services' ? `2px solid ${colors.primary}` : '2px solid transparent' }}>💅 服務管理</button>
        <button onClick={() => setActiveTab('requests')} style={{ fontSize: '15px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'requests' ? colors.primary : '#666', borderBottom: activeTab === 'requests' ? `2px solid ${colors.primary}` : '2px solid transparent' }}>
          💬 預約審核 {requestsList.length > 0 && <span style={{ background: colors.primary, color: '#fff', fontSize: '11px', padding: '2px 7px', borderRadius: '10px' }}>{requestsList.length}</span>}
        </button>
        <button onClick={() => setActiveTab('portfolio')} style={{ fontSize: '15px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', color: activeTab === 'portfolio' ? colors.primary : '#666', borderBottom: activeTab === 'portfolio' ? `2px solid ${colors.primary}` : '2px solid transparent' }}>🎨 版面設定</button>
      </div>

      <div style={{ padding: '0 24px 40px 24px' }}>
        {activeTab === 'dashboard' && (
          <StylistDashboard requestCount={requestsList.length} onGoToRequests={() => setActiveTab('requests')} studioName={studioName} />
        )}

        {activeTab === 'calendar' && (
          <StylistCalendarSetting scheduleDatabase={scheduleDatabase} setScheduleDatabase={setScheduleDatabase} />
        )}

        {activeTab === 'services' && <StylistServiceSetting shop={myShopData} onUpdateServices={(id, s) => setMyShopData({ ...myShopData, services: s })} onBack={() => setActiveTab('dashboard')} />}

        {/* 🌟 核心新對接：在這裡正式呼叫妳精緻的 AppointmentRequests 元件！ */}
        {activeTab === 'requests' && (
          <AppointmentRequests 
            requests={requestsList} 
            handleApprove={handleApproveRequest} 
            handleReject={handleRejectRequest} 
            onBack={() => setActiveTab('dashboard')} 
          />
        )}

        {activeTab === 'portfolio' && (
          <StylistPortfolio 
            currentUser={currentUser} studioName={studioName} setStudioName={setStudioName}
            rules={rules} setRules={setRules} portfolioImages={portfolioImages} setPortfolioImages={setPortfolioImages}
          />
        )}
      </div>
    </div>
  );
}