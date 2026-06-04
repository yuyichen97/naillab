import React, { useState } from 'react';

const colors = {
  primary: '#560A0C',
  secondary: '#A45D65',
  accent: '#CCA2A4',
  background: '#EAD4D6',
  gray: '#f8f9fa'
};

function CustomerBookingFlow({ stylistSchedule, onSubmitBooking, onBack }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingDate, setBookingDate] = useState('2026-06-04');
  const [bookingTime, setBookingTime] = useState('');

  const menuItems = [
    { id: 's1', name: '精緻微奢晶石貓眼', price: 1600, duration: 90 },
    { id: 's2', name: '法式經典線條設計', price: 1500, duration: 90 },
    { id: 's3', name: '他店安全溫和卸甲', price: 400, duration: 30 }
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

  const handleSend = () => {
    if (selectedServices.length === 0) return alert('請至少選擇一項服務！');
    if (!bookingTime) return alert('請選擇預約時間段！');

    const bookingData = {
      customerName: '測試小公主',
      date: bookingDate,
      time: bookingTime,
      service: selectedServices.map(s => s.name).join(' + '),
      price: `$${totalPrice}`
    };

    onSubmitBooking(bookingData);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh' }} className="booking-flow">
      
      {/* 頂部返回 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: colors.primary, padding: '8px' }}>
          ⬅️
        </button>
        <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 'bold', color: '#1a1a1a' }}>線上預約申請</h2>
      </div>

      {/* 主內容 */}
      <div style={{ maxWidth: '100%' }}>
        
        {/* STEP 1: 選擇服務項目 */}
        <div style={{ marginBottom: '30px', background: '#fff', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', color: colors.primary, margin: '0 0 15px 0', fontWeight: 'bold' }}>1. 選擇服務項目 (可複選)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {menuItems.map(item => {
              const isChecked = selectedServices.some(s => s.id === item.id);
              return (
                <div 
                  key={item.id}
                  onClick={() => toggleService(item)}
                  style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    padding: '14px', borderRadius: '12px', border: `2px solid ${isChecked ? colors.secondary : '#eee'}`,
                    background: isChecked ? `${colors.background}66` : '#fff', cursor: 'pointer', transition: 'all 0.3s',
                    boxShadow: isChecked ? '0 4px 12px rgba(164, 93, 101, 0.2)' : 'none'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', fontWeight: 'bold', color: '#333', marginBottom: '6px' }}>{item.name}</div>
                    <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: '#888' }}>⏱️ 耗時約 {item.duration} 分鐘</div>
                  </div>
                  <div style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', fontWeight: 'bold', color: colors.primary, marginTop: '8px' }}>
                    ${item.price}
                    <span style={{ fontSize: '0.8em', fontWeight: 'normal', marginLeft: '4px' }}>
                      {isChecked ? '✓' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 2: 選擇預約日期與時段 */}
        <div style={{ marginBottom: '30px', background: '#fff', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', color: colors.primary, margin: '0 0 15px 0', fontWeight: 'bold' }}>2. 選擇日期與時間</h3>
          
          {/* 日期選擇 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#333' }}>選擇日期</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
              {['2026-06-04', '2026-06-05', '2026-06-06'].map(d => (
                <button
                  key={d}
                  onClick={() => { setBookingDate(d); setBookingTime(''); }}
                  style={{
                    padding: '10px 8px', borderRadius: '8px', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', fontWeight: 'bold', cursor: 'pointer',
                    border: bookingDate === d ? 'none' : '1px solid #eee',
                    background: bookingDate === d ? colors.primary : colors.gray,
                    color: bookingDate === d ? '#fff' : '#333',
                    transition: 'all 0.3s'
                  }}
                >
                  {d.substring(5)}
                </button>
              ))}
            </div>
          </div>

          {/* 時段選擇 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: '#333' }}>選擇時間</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '8px' }}>
              {availableTimes.map(t => (
                <button
                  key={t}
                  onClick={() => setBookingTime(t)}
                  style={{
                    padding: '12px 8px', borderRadius: '8px', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', cursor: 'pointer',
                    border: bookingTime === t ? 'none' : '1px solid #eee',
                    background: bookingTime === t ? colors.secondary : '#fff',
                    color: bookingTime === t ? '#fff' : '#333',
                    fontWeight: bookingTime === t ? 'bold' : 'normal',
                    transition: 'all 0.3s',
                    boxShadow: bookingTime === t ? '0 2px 8px rgba(164, 93, 101, 0.3)' : 'none'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 摘要與送出按鈕 */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
            <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
              <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '4px' }}>預計耗時</div>
              <div style={{ fontWeight: 'bold', color: colors.primary, fontSize: 'clamp(1rem, 3vw, 1.3rem)' }}>{totalDuration} 分鐘</div>
            </div>
            <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
              <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '4px' }}>總計金額</div>
              <div style={{ fontWeight: 'bold', color: colors.primary, fontSize: 'clamp(1rem, 3vw, 1.3rem)' }}>${totalPrice}</div>
            </div>
          </div>

          <button
            onClick={handleSend}
            style={{
              width: '100%', padding: 'clamp(12px, 3vw, 16px)', border: 'none', borderRadius: '12px',
              background: colors.primary, color: '#fff', fontSize: 'clamp(0.95rem, 3vw, 1.05rem)', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: `0 4px 12px ${colors.primary}33`,
              transition: 'all 0.3s',
              transform: 'scale(1)'
            }}
            onHover={(e) => e.target.style.transform = 'scale(1.02)'}
          >
            ✨ 送出預約申請
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .booking-flow {
            padding: 1rem;
          }
        }
        @media (max-width: 480px) {
          .booking-flow {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

export default CustomerBookingFlow;
