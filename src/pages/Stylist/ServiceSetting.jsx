import React, { useEffect, useState } from 'react';

// 引入你們專題顏色.jpg 的色調
const colors = {
  primary: '#560A0C',     // 酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
};

function StylistServiceSetting({ shop, onUpdateServices, onBack }) {
  const [services, setServices] = useState(shop?.services || []);

  useEffect(() => {
    setServices(shop?.services || []);
  }, [shop]);

  const handleInputChange = (id, field, value) => {
    setServices(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addServiceRow = () => {
    const newId = services.length > 0 ? Number(services[services.length - 1].id.replace(/\D/g, '')) + 1 : 1;
    setServices([...services, { id: `new-${newId}`, name: '', price: '', duration: '' }]);
  };

  const handleSave = () => {
    if (!shop) return;
    onUpdateServices(shop.id, services);
    alert('✅ 已儲存服務項目，消費者將可在該工作室頁面看到最新項目。');
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', background: 'none', border: 'none', color: colors.primary, fontSize: '16px', cursor: 'pointer' }}>
        ⬅️ 返回工作台
      </button>

      <div style={{ marginBottom: '25px' }}>
        <span style={{ fontSize: '11px', color: colors.secondary, fontWeight: 'bold', letterSpacing: '1px' }}>STEP 03</span>
        <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a' }}>服務設定</h2>
        <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>
          已選擇：{shop?.name || '尚未選擇工作室'}
        </p>
      </div>

      {shop ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            {services.map((service, index) => (
              <div 
                key={service.id} 
                style={{ 
                  background: '#fdfbfb', 
                  border: `1px solid ${colors.accent}`, 
                  borderRadius: '16px', 
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: colors.primary, marginBottom: '10px' }}>
                  項目 #{index + 1}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>服務名稱</label>
                  <input 
                    type="text" 
                    placeholder="例如：貓眼暈染設計、經典法式" 
                    value={service.name}
                    onChange={(e) => handleInputChange(service.id, 'name', e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>價格 (TWD)</label>
                    <input 
                      type="number" 
                      placeholder="800" 
                      value={service.price}
                      onChange={(e) => handleInputChange(service.id, 'price', e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>耗時 (分鐘)</label>
                    <input 
                      type="number" 
                      placeholder="90" 
                      value={service.duration}
                      onChange={(e) => handleInputChange(service.id, 'duration', e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={addServiceRow}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: 'none', 
              border: `2px dashed ${colors.accent}`, 
              borderRadius: '12px', 
              color: colors.secondary, 
              fontSize: '14px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              marginBottom: '24px'
            }}
          >
            ➕ 新增更多服務
          </button>

          <button 
            onClick={handleSave}
            style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '16px', background: colors.primary, color: '#fff', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            儲存服務設定
          </button>
        </>
      ) : (
        <div style={{ padding: '24px', background: '#fff7f7', borderRadius: '16px', border: '1px solid #f4d4dc' }}>
          <p style={{ margin: 0, color: '#666' }}>無法載入工作室資料，請返回工作台選擇。</p>
        </div>
      )}
    </div>
  );
}

export default StylistServiceSetting;
