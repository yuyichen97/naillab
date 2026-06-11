import React, { useState } from 'react';

const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  gray: '#f8f9fa'
};

export default function ShopDetail({ studioName, rules, portfolioImages, onBack, onSubmitBooking }) {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [showBookingModal, setShowBookingModal] = useState(false);

  // ================= 🛒 預約狀態機 (連動步驟核心) =================
  const [selectedService, setSelectedService] = useState(null); // 已選款式項目
  const [selectedDate, setSelectedDate] = useState('');         // 已選日期
  const [selectedTime, setSelectedTime] = useState('');         // 已選時間

  // 🌟 核心防呆變數：取得當下系統最新的實際日期與小時
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().slice(0, 10); // 格式如: "2026-06-08"
  const currentHour = todayObj.getHours();             // 取得目前小時 (數字，如 14)

  // 模擬美甲師在後台設定好、有開放預約的動態班表資料庫
  const availableSchedule = {
    '2026-06-04': ['09:00', '11:00', '14:00', '15:30', '19:00'],
    '2026-06-05': ['10:00', '13:00', '14:30', '16:00'],
    '2026-06-06': ['09:00', '11:00', '13:00', '15:00', '17:00', '20:00'],
    '2026-06-07': ['14:00', '15:00', '16:00'],
    // 6/8、6/10、6/11 為可測試與展示過期判斷的核心日期
    '2026-06-08': ['09:00', '11:00', '14:00', '16:30', '19:30', '21:00'],
    '2026-06-10': ['10:00', '14:00', '19:00'],
    '2026-06-11': ['13:00', '15:30']
  };

  // 點擊預約按鈕時的防呆檢查
  const handleOpenBooking = () => {
    if (!selectedService) {
      alert('請先在下方「服務項目價目表」中點擊選擇您想做的款式種類唷！');
      setActiveTab('services'); // 自動幫消費者切換到價目表分頁
      return;
    }
    setShowBookingModal(true);
    // 貼心聯動：開啟彈窗時，預設自動選取今天（防呆如果今天已經過期，則不預選）
    if (availableSchedule[todayStr]) {
      setSelectedDate(todayStr);
    }
  };

  // 處理最終提交
  const handleFinalSubmit = () => {
    if (!selectedDate || !selectedTime) {
      alert('請先選擇預約的日期與時間！');
      return;
    }
    setShowBookingModal(false);
    // 呼叫 App.jsx 的預約成功回呼
    onSubmitBooking({
      service: selectedService,
      date: selectedDate,
      time: selectedTime
    });
    // 重置選擇狀態
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  // 📅 簡單手寫一個 2026 年 6 月份的 RWD 日曆格子陣列
  const juneDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div style={{ width: '100%', padding: '10px 0', boxSizing: 'border-box' }}>
      
      {/* 🔮 注入 RWD 雙欄與極簡日曆、時間顆粒樣式 */}
      <style>{`
        .detail-container { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 30px rgba(86,10,12,0.05); margin-top: 16px; }
        .shop-header-banner { width: 100%; height: 260px; position: relative; background: #444; }
        .content-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px; }
        .full-width-layout { padding: 24px; }
        .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
        
        /* 服務款式項目卡片點選樣式 */
        .service-item-card {
          display: flex; justify-content: space-between; align-items: center; padding: 14px; 
          border: 2px solid #eee; border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s;
        }
        .service-item-card:hover { border-color: ${colors.accent}; background: #FFF9FA; }
        .service-item-card.selected { border-color: ${colors.primary}; background: #F9ECEE; }

        /* 📅 日曆網格樣式 */
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-top: 10px; }
        .calendar-day-header { text-align: center; font-size: 11px; font-weight: bold; color: #999; padding: 4px 0; }
        .calendar-day-cell {
          aspect-ratio: 1; border-radius: 8px; display: flex; flex-direction: column; align-items: center; 
          justify-content: center; font-size: 13px; font-weight: bold; cursor: pointer; border: 1px solid transparent; transition: all 0.2s;
        }
        .day-has-slots { background: #FFF0F2; color: ${colors.primary}; }
        .day-has-slots:hover { background: ${colors.accent}; color: #fff; }
        .day-no-slots { background: #f8f9fa; color: #ccc; cursor: not-allowed; font-weight: normal; opacity: 0.4; }
        .day-selected { background: ${colors.primary} !important; color: #fff !important; box-shadow: 0 4px 10px rgba(86,10,12,0.3); }

        /* ⏰ 時間按鈕顆粒樣式 */
        .time-slots-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px; }
        .time-chip {
          padding: 8px 4px; text-align: center; border-radius: 8px; border: 1px solid #ddd; background: #fff;
          font-size: 13px; font-weight: bold; color: #555; cursor: pointer; transition: all 0.15s;
        }
        .time-chip:hover { border-color: ${colors.primary}; color: ${colors.primary}; background: #FFF9FA; }
        .time-chip.selected { background: ${colors.primary}; color: #fff; border-color: ${colors.primary}; }
        
        /* 🚫 時間過期禁用狀態 */
        .time-chip-disabled {
          background: #e2e8f0 !important; color: #94a3b8 !important; border-color: #eee !important;
          cursor: not-allowed !important; text-decoration: line-through;
        }

        @media (max-width: 768px) {
          .shop-header-banner { height: 180px; }
          .content-layout { grid-template-columns: 1fr; gap: 16px; padding: 16px; }
          .full-width-layout { padding: 16px; }
          .portfolio-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .time-slots-container { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* 返回按鈕 */}
      <div style={{ textAlign: 'left' }}>
        <button onClick={onBack} style={{ background: '#fff', border: `1px solid ${colors.accent}`, padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', color: colors.primary, cursor: 'pointer' }}>
          ⬅️ 返回探索首頁
        </button>
      </div>

      <div className="detail-container">
        
        {/* 店鋪大門面大橫幅 */}
        <div className="shop-header-banner">
          <img src={portfolioImages[0] || "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800"} alt="封面" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.65))' }} />
          
          <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px', color: '#fff' }}>
            <span style={{ background: colors.secondary, fontSize: '12px', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', marginBottom: '8px', display: 'inline-block' }}>
              ⭐ 4.9 精選美甲沙龍
            </span>
            <h2 style={{ margin: '4px 0', fontSize: '28px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {studioName}
            </h2>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>📍 台北市大安區 ｜ ⏰ 採預約審核制</p>
          </div>
        </div>

        {/* 🧭 分頁分流導覽列 */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fff' }}>
          <button onClick={() => setActiveTab('portfolio')} style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', background: 'none', border: 'none', color: activeTab === 'portfolio' ? colors.primary : '#666', borderBottom: activeTab === 'portfolio' ? `3px solid ${colors.primary}` : 'none' }}>
            ✨ 作品精選 & 預約須知
          </button>
          <button onClick={() => setActiveTab('services')} style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', background: 'none', border: 'none', color: activeTab === 'services' ? colors.primary : '#666', borderBottom: activeTab === 'services' ? `3px solid ${colors.primary}` : 'none' }}>
            💅 步驟1：選擇服務項目 {selectedService ? '✅' : ''}
          </button>
        </div>

        {/* 內容區塊 */}
        {activeTab === 'portfolio' ? (
          <div className="content-layout">
            <div style={{ background: '#fcfcfc', padding: '20px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: colors.primary }}>📜 店家預約須知</h3>
              <div style={{ fontSize: '14px', color: '#444', whiteSpace: 'pre-line', lineHeight: '1.6' }}>{rules}</div>
            </div>

            <div style={{ background: '#fcfcfc', padding: '20px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: colors.primary }}>🖼️ 現場作品精選 ({portfolioImages.length} 張)</h3>
              <div className="portfolio-grid">
                {portfolioImages.map((url, idx) => (
                  <div key={idx} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={url} alt="作品" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 款式項目選擇清單 */
          <div className="full-width-layout">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ background: '#FFF0F2', color: colors.primary, padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
                💡 請先點選一個您今天想要預約做的款式，再點擊底部按鈕挑選日子時間唷！
              </div>
              
              {/* 款式項目一 */}
              <div 
                className={`service-item-card ${selectedService === '單色凝膠美甲' ? 'selected' : ''}`}
                onClick={() => setSelectedService('單色凝膠美甲')}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>
                    {selectedService === '單色凝膠美甲' ? '🎯 ' : ''}單色凝膠美甲
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>⏰ 所需時間：約 90 分鐘 ｜ 含基礎細緻指緣去皮與保養</div>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: colors.primary }}>$1,399</span>
              </div>

              {/* 款式項目二 */}
              <div 
                className={`service-item-card ${selectedService === '法式優雅彩繪' ? 'selected' : ''}`}
                onClick={() => setSelectedService('法式優雅彩繪')}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>
                    {selectedService === '法式優雅彩繪' ? '🎯 ' : ''}法式優雅彩繪
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>⏰ 所需時間：約 120 分鐘 ｜ 精緻經典拉線與晶亮建構增厚</div>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: colors.primary }}>$1,599</span>
              </div>

              {/* 顯示目前選擇提示 */}
              {selectedService && (
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', fontWeight: 'bold', color: colors.secondary }}>
                  已選擇項目：【{selectedService}】✨ 請點選下方按鈕繼續挑選時間
                </div>
              )}
            </div>
          </div>
        )}

        {/* 吸底功能確認列 */}
        <div style={{ background: '#F9ECEE', padding: '20px', textAlign: 'center', borderTop: '1px solid #eee' }}>
          <button 
            onClick={handleOpenBooking}
            style={{ 
              background: colors.primary, color: '#fff', border: 'none', padding: '14px 50px', borderRadius: '30px',
              fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(86,10,12,0.25)'
            }}
          >
            {selectedService ? `下一步：選擇【${selectedService}】的時間 🗓️` : '請先點選款式項目 💅'}
          </button>
        </div>

      </div>

      {/* ================= 🗓️ 核心升級：全新互動式 RWD 日曆彈出視窗 ================= */}
      {showBookingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '20px', maxWidth: '420px', width: '100%', boxSizing: 'border-box', boxShadow: '0 12px 36px rgba(0,0,0,0.2)' }}>
            
            {/* 彈窗標題與已選款式摘要 */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <h4 style={{ margin: '0 0 4px 0', color: colors.primary, fontSize: '18px', fontWeight: 'bold' }}>選擇預約日期與時間</h4>
              <span style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 10px', borderRadius: '10px', color: '#666' }}>
                項目：{selectedService}
              </span>
            </div>

            {/* 📅 1. 日曆介面卡片 */}
            <div style={{ border: '1px solid #eee', padding: '12px', borderRadius: '14px', background: '#fff' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: '#333', marginBottom: '10px' }}>
                ◀ 2026 年 6 月 ▶
              </div>
              
              <div className="calendar-grid">
                {/* 星期行 */}
                {['日', '一', '二', '三', '四', '五', '六'].map((w, idx) => (
                  <div key={idx} className="calendar-day-header">{w}</div>
                ))}
                
                {/* 補齊 2026/06/01 前面的空白格 */}
                <div className="calendar-day-cell day-no-slots"></div>

                {/* 動態渲染三十天 */}
                {juneDays.map((day) => {
                  const dateStr = `2026-06-${day < 10 ? '0' + day : day}`;
                  
                  // 🎯 防呆判斷 A：如果日期字串小於今天 (2026-06-08)，代表是過去的日期
                  const isPastDay = dateStr < todayStr;
                  
                  // 只有非過去日期且班表庫有開放，才算有診/有時段
                  const hasSlots = !isPastDay && !!availableSchedule[dateStr];
                  const isSelected = selectedDate === dateStr;

                  return (
                    <div 
                      key={day}
                      className={`calendar-cell-item calendar-day-cell ${hasSlots ? 'day-has-slots' : 'day-no-slots'} ${isSelected ? 'day-selected' : ''}`}
                      onClick={() => {
                        if (!hasSlots) return; // 過去的日期、或後台沒開班，完全禁用點擊
                        setSelectedDate(dateStr);
                        setSelectedTime(''); // 切換日期時重置已選時間
                      }}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ⏰ 2. 動態時段顆粒區塊 (選了日期才跳出來) */}
            <div style={{ marginTop: '16px', minHeight: '110px', textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                {selectedDate ? `📅 已選日期：${selectedDate} ｜ 請選擇時段：` : '👈 請先從上方日曆點選有粉底顏色的日期'}
              </div>

              {selectedDate && availableSchedule[selectedDate] && (
                <div className="time-slots-container">
                  {availableSchedule[selectedDate].map((time) => {
                    const slotHour = parseInt(time.split(':')[0]); // 轉成數字小時（如 "14:00" -> 14）
                    
                    // 🎯 防呆判斷 B：如果點選的是「今天」，且班表時段小時小於或等於當下系統小時，就判定過期
                    const isTimePast = (selectedDate === todayStr) && (slotHour <= currentHour);
                    const isTimeSelected = selectedTime === time;

                    return (
                      <button 
                        key={time}
                        disabled={isTimePast} // 原生 DOM 鎖定，防點擊
                        className={`time-chip ${isTimeSelected ? 'selected' : ''} ${isTimePast ? 'time-chip-disabled' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 底部按鈕 */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '14px' }}>
              <button 
                type="button"
                onClick={() => setShowBookingModal(false)} 
                style={{ flex: 1, padding: '11px', background: '#eee', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', color: '#555', fontSize: '14px' }}
              >
                返回修改款式
              </button>
              <button 
                type="button"
                onClick={handleFinalSubmit} 
                disabled={!selectedDate || !selectedTime}
                style={{ 
                  flex: 1, padding: '11px', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px',
                  background: (selectedDate && selectedTime) ? colors.primary : '#ccc',
                  color: '#fff',
                  cursor: (selectedDate && selectedTime) ? 'pointer' : 'not-allowed',
                  boxShadow: (selectedDate && selectedTime) ? '0 4px 10px rgba(86,10,12,0.15)' : 'none'
                }}
              >
                確認預約送出 🚀
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}