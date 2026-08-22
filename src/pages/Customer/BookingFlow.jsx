import React, { useState } from 'react';

const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  gray: '#f8f9fa'
};

function CustomerBookingFlow({ stylistSchedule = {}, onSubmitBooking, onBack }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingDate, setBookingDate] = useState('2026-06-04');
  const [bookingTime, setBookingTime] = useState('');

  const menuItems = [
    { id: 's1', name: '精緻微奢晶石貓眼', price: 1600, duration: 90 },
    { id: 's2', name: '法式經典線條設計', price: 1500, duration: 90 },
    { id: 's3', name: '他店安全溫和卸甲', price:  400, duration: 30 }
  ];

  const availableTimes = stylistSchedule[bookingDate] || ['09:00', '14:00', '20:00'];

  const toggleService = (item) => {
    if (selectedServices.some(s => s.id === item.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== item.id));
    } else {
      setSelectedServices([...selectedServices, item]);
    }
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  // 🎯 核心修正：點擊送出預約申請
  const handleSend = () => {
    if (selectedServices.length === 0) return alert('請至少選擇一項服務！');
    if (!bookingTime) return alert('請選擇預約時間段！');

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `B${todayStr}${randomNum}`;

    // 建立新資料物件
    const newBookingItem = {
      id: generatedId,
      studio: 'yyc nail',
      service: selectedServices.map(s => s.name).join(' + '),
      price: `$${totalPrice.toLocaleString()}`,
      date: bookingDate,
      time: bookingTime,
      status: '店家審核中'
    };

    if (onSubmitBooking) {
      onSubmitBooking(newBookingItem);
    }

    alert(`預約申請提交成功！\n單號：${generatedId}\n請至「我的帳戶」查看排程狀態。`);
    
    if (onBack) {
      onBack(); // 點完彈窗後自動切換回原本帳戶或首頁
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', background: 'transparent', minHeight: '100vh', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: colors.primary }}>
          ‹
        </button>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' }}>線上預約申請</h2>
      </div>

      {/* STEP 1 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', color: colors.primary, margin: '0 0 12px 0', fontWeight: 'bold' }}>1. 選擇服務項目 (可複選)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {menuItems.map(item => {
            const isChecked = selectedServices.some(s => s.id === item.id);
            return (
              <div 
                key={item.id}
                onClick={() => toggleService(item)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px', borderRadius: '12px', border: `1px solid ${isChecked ? colors.secondary : '#eee'}`,
                  background: isChecked ? `${colors.background}33` : 'rgba(255, 248, 245, 0.14)', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>耗時約 {item.duration} 分鐘</div>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: colors.primary }}>${item.price}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2 */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', color: colors.primary, margin: '0 0 12px 0', fontWeight: 'bold' }}>2. 選擇日期與時間</h3>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          {['2026-06-04', '2026-06-05', '2026-06-06'].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => { setBookingDate(d); setBookingTime(''); }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer',
                border: bookingDate === d ? 'none' : '1px solid #eee',
                background: bookingDate === d ? colors.primary : colors.gray,
                color: bookingDate === d ? '#fff' : '#333'
              }}
            >
              {d.substring(5)}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {availableTimes.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setBookingTime(t)}
              style={{
                padding: '12px 0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                border: bookingTime === t ? 'none' : '1px solid #eee',
                background: bookingTime === t ? colors.secondary : '#fff',
                color: bookingTime === t ? '#fff' : '#333',
                fontWeight: bookingTime === t ? 'bold' : 'normal'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 底部摘要 */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px', color: '#555' }}>
          <div>預計耗時：<strong>{totalDuration} 分鐘</strong></div>
          <div style={{ fontSize: '16px', color: colors.primary }}>總計金額：<strong style={{ fontSize: '22px' }}>${totalPrice.toLocaleString()}</strong></div>
        </div>

        <button
          type="button"
          onClick={handleSend}
          style={{
            width: '100%', padding: '16px', border: 'none', borderRadius: '25px',
            background: colors.primary, color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            boxShadow: `0 4px 12px ${colors.primary}33`
          }}
        >
          送出預約申請 ➔
        </button>
      </div>

    </div>
  );
}

export default CustomerBookingFlow;
