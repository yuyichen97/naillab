import React from 'react';

const colors = {
  primary: '#560A0C',
  secondary: '#A45D65',
  accent: '#CCA2A4',
};

function StylistDashboard({ appointments, requestCount, onGoToRequests }) {
  return (
    <div style={{ width: '100%', minHeight: '100vh' }} className="stylist-dashboard">
      
      {/* 頂部區 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <div>
          <span style={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', color: '#888', letterSpacing: '1px', fontWeight: '600' }}>工作室管理</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 'bold' }}>個人工作室</h2>
        </div>
        <div style={{ width: 'clamp(2.5rem, 8vw, 3.5rem)', height: 'clamp(2.5rem, 8vw, 3.5rem)', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}>🧔</div>
      </div>

      {/* 營收看板 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(12px, 3vw, 16px)', marginBottom: '25px' }}>
        <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, color: '#fff', padding: 'clamp(16px, 3vw, 20px)', borderRadius: '16px', transition: 'all 0.3s' }}>
          <span style={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', color: '#e0e0e0', display: 'block', marginBottom: '8px' }}>今日預計營業額</span>
          <div style={{ fontSize: 'clamp(1.8rem, 5vw, 2.2rem)', fontWeight: 'bold' }}>
            ${appointments.reduce((sum, item) => sum + parseInt(item.price.replace('$','')), 0)}
          </div>
        </div>
        <div style={{ background: '#fff', padding: 'clamp(16px, 3vw, 20px)', borderRadius: '16px', border: '1px solid #eaeaea', textAlign: 'center', transition: 'all 0.3s' }}>
          <span style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>⭐</span>
          <div style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 'bold', margin: '8px 0' }}>4.9</div>
          <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', color: '#888' }}>120+ 評價</span>
        </div>
      </div>

      {/* 預約請求通知卡片 */}
      <div 
        onClick={onGoToRequests}
        style={{ 
          background: requestCount > 0 ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` : '#e2e2e2', 
          color: requestCount > 0 ? '#fff' : '#666', 
          padding: 'clamp(16px, 3vw, 20px)', 
          borderRadius: '16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          cursor: requestCount > 0 ? 'pointer' : 'default',
          boxShadow: requestCount > 0 ? `0 4px 14px ${colors.secondary}55` : 'none',
          transition: 'all 0.3s',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
          if (requestCount > 0) {
            e.currentTarget.style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 15px)', flex: 1 }}>
          <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>{requestCount > 0 ? '💬' : '✅'}</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.95rem, 3vw, 1.2rem)', marginBottom: '4px' }}>
              {requestCount > 0 ? `${requestCount} 個待處理預約` : '暫無待處理預約'}
            </div>
            <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', opacity: 0.85 }}>
              {requestCount > 0 ? '點擊立刻進入審核清單' : '今日預約已全數處理完畢'}
            </div>
          </div>
        </div>
        {requestCount > 0 && <div style={{ width: 'clamp(24px, 3vw, 32px)', height: 'clamp(24px, 3vw, 32px)', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', transition: 'all 0.3s' }}>➔</div>}
      </div>

      {/* 今日行程安排 */}
      <div>
        <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', fontWeight: 'bold', margin: '0 0 18px 0' }}>今日預約安排</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(12px, 3vw, 16px)' }}>
          {appointments.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', background: '#fff', borderRadius: '14px', padding: 'clamp(24px, 5vw, 32px)', textAlign: 'center', border: '1px solid #eee' }}>
              <p style={{ color: '#888', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>今日暫無預約</p>
            </div>
          ) : (
            appointments.map((ap) => (
              <div key={ap.id} style={{ background: '#fff', borderRadius: '14px', padding: 'clamp(14px, 3vw, 18px)', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 16px rgba(86, 10, 12, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 'bold' }}>{ap.time}</div>
                    <span style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '10px', marginTop: '4px', display: 'inline-block', fontWeight: '600' }}>{ap.status}</span>
                  </div>
                  <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', fontWeight: 'bold', color: colors.primary }}>{ap.price}</div>
                </div>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  <div style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', fontWeight: 'bold', marginBottom: '4px' }}>👤 {ap.customerName}</div>
                  <div style={{ fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', color: '#666' }}>📍 {ap.service}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stylist-dashboard {
            padding: 1rem;
          }
        }
        @media (max-width: 480px) {
          .stylist-dashboard {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

export default StylistDashboard;