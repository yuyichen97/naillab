import React from 'react';

// 套用 專題顏色.jpg 核心色調
const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  danger: '#d90429',      // 警示紅
  gray: '#f8f9fa'
};

function AppointmentRequests({ requests = [], handleApprove, handleReject, onBack }) {
  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', background: 'transparent', minHeight: '100vh' }}>
      
      {/* 頂部導覽列 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: colors.primary }}>
          ‹
        </button>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' }}>預約請求審核</h2>
      </div>

      {/* 🔮 調整後更精緻的無預約狀態顯示 */}
      {requests.length === 0 ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '60px 20px', 
          background: 'rgba(255, 248, 245, 0.52)', 
          borderRadius: '16px', 
          border: `1px dashed ${colors.accent}`, // 乾燥玫瑰色虛線外框
          color: '#21191a',
          marginTop: '10px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '14px' }}>📥</div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 'bold', color: '#21191a' }}>目前無預約請求</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#5f5254', fontWeight: 600 }}>當有消費者線上送出預約時，新的申請將會即時顯示在這裡。</p>
        </div>
      ) : (
        /* 100% 保留妳最滿意的漂亮列表卡片結構 + 融合全台放鳥聯防警示 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {requests.map((req) => (
            <div 
              key={req.id}
              style={{
                background: 'rgba(255, 248, 245, 0.62)',
                border: `1px solid ${colors.accent}`,
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}
            >
              {/* 客人基本資訊 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a' }}>
                    {req.customerName} <span style={{ fontSize: '12px', color: '#777', fontWeight: 'normal' }}>({req.phone || '0912-***-456'})</span>
                  </div>
                  <div style={{ fontSize: '12px', color: colors.secondary, marginTop: '2px', fontWeight: 'bold' }}>
                    {req.date || '今日'} ({req.time})
                  </div>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: colors.primary }}>
                  {req.price}
                </span>
              </div>

              {/* 預約項目說明 */}
              <div style={{ background: 'rgba(255, 248, 245, 0.56)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', color: '#555', marginBottom: '12px', textAlign: 'left' }}>
                <strong>預約項目：</strong>{req.service}
              </div>

              {(req.styleRequest || req.customerNote || req.contactInfo || req.needsRemoval || req.allergyNote) && (
                <div style={{ background: 'rgba(255, 248, 245, 0.48)', padding: '10px 12px', border: `1px solid ${colors.accent}`, borderRadius: '8px', fontSize: '12px', color: '#555', marginBottom: '12px', textAlign: 'left', lineHeight: 1.7 }}>
                  {req.styleRequest && <div><strong>款式需求：</strong>{req.styleRequest}</div>}
                  {req.needsRemoval && <div><strong>卸甲：</strong>需要卸甲</div>}
                  {req.allergyNote && <div><strong>過敏提醒：</strong>{req.allergyNote}</div>}
                  {req.contactInfo && <div><strong>聯絡方式：</strong>{req.contactInfo}</div>}
                  {req.customerNote && <div><strong>其他備註：</strong>{req.customerNote}</div>}
                </div>
              )}

              <div style={{ padding: '10px 12px', background: '#FFF8F8', borderRadius: '8px', marginBottom: '15px', textAlign: 'left', fontSize: '12px', color: colors.primary }}>
                {req.status === 'paid'
                  ? `訂金已付${req.depositAmount ? `：${req.depositAmount}` : ''}，接受後此時段會正式保留。`
                  : '待確認：接受後此時段會正式保留；婉拒後會立即釋出。'}
                {req.remainingAmount && <span> 到店尾款：{req.remainingAmount}</span>}
              </div>

              {/* 審核按鈕（接受 / 拒絕） */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleReject(req.id)}
                  style={{ flex: 1, padding: '10px', border: '1px solid rgba(164, 93, 101, 0.32)', background: 'rgba(255, 248, 245, 0.42)', borderRadius: '20px', color: '#666', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  婉拒預約
                </button>
                <button 
                  onClick={() => handleApprove(req.id)}
                  style={{ flex: 2, padding: '10px', border: 'none', background: colors.primary, borderRadius: '20px', color: '#fff', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  接受預約
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
