import React from 'react';

// 套用 專題顏色.jpg 核心色調
const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  gray: '#f8f9fa'
};

function AppointmentRequests({ requests, handleApprove, handleReject, onBack }) {
  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh' }}>
      
      {/* 頂部導覽列 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: colors.primary }}>
          ⬅️
        </button>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' }}>預約請求審核</h2>
      </div>

      {/* 請求列表 */}
      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
          <p style={{ fontSize: '14px', margin: 0 }}>目前沒有待處理的預約請求！</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {requests.map((req) => (
            <div 
              key={req.id}
              style={{
                background: '#fff',
                border: `1px solid ${colors.accent}`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}
            >
              {/* 客人基本資訊 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a' }}>{req.customerName}</div>
                  <div style={{ fontSize: '12px', color: colors.secondary, marginTop: '2px', fontWeight: 'bold' }}>
                    📅 {req.date} ({req.time})
                  </div>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: colors.primary }}>
                  {req.price}
                </span>
              </div>

              {/* 預約項目說明 */}
              <div style={{ background: colors.gray, padding: '10px 12px', borderRadius: '8px', fontSize: '13px', color: '#555', marginBottom: '15px' }}>
                🛠️ <strong>預約項目：</strong>{req.service}
              </div>

              {/* 審核按鈕（接受 / 拒絕） */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleReject(req.id)}
                  style={{ flex: 1, padding: '10px', border: '1px solid #ddd', background: '#fff', borderRadius: '20px', color: '#666', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  拒絕 ❌
                </button>
                <button 
                  onClick={() => handleApprove(req.id)}
                  style={{ flex: 2, padding: '10px', border: 'none', background: colors.primary, borderRadius: '20px', color: '#fff', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  接受預約 ✅
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default AppointmentRequests;
