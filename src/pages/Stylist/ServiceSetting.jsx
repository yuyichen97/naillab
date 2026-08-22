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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setServices(shop?.services || []);
  }, [shop]);

  const handleInputChange = (id, field, value) => {
    setServices(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addServiceRow = () => {
    setServices(prev => [
      ...prev,
      { id: `new-${Date.now()}`, name: '', price: '', duration: '60' }
    ]);
  };

  const removeServiceRow = (id) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const handleSave = async () => {
    const cleanServices = services
      .map(service => ({
        ...service,
        name: service.name?.trim() || '',
        price: String(service.price ?? '').trim(),
        duration: String(service.duration ?? '').trim()
      }))
      .filter(service => service.name || service.price || service.duration);

    if (cleanServices.length === 0) {
      alert('請至少保留一個服務項目。');
      return;
    }

    const invalidService = cleanServices.find(service => {
      const price = Number(String(service.price).replace(/[^\d]/g, ''));
      const duration = Number(service.duration);
      return !service.name || !Number.isFinite(price) || price <= 0 || !Number.isFinite(duration) || duration <= 0;
    });

    if (invalidService) {
      alert('請確認每個服務都有名稱、價格與耗時，價格和耗時都要大於 0。');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdateServices(shop?.id, cleanServices);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', background: 'transparent', minHeight: '100vh' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', background: 'none', border: 'none', color: colors.primary, fontSize: '16px', cursor: 'pointer' }}>
        返回工作台
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
                  background: 'rgba(255, 248, 245, 0.58)', 
                  border: `1px solid ${colors.accent}`, 
                  borderRadius: '16px', 
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: colors.primary }}>
                    項目 #{index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeServiceRow(service.id)}
                    disabled={services.length <= 1 || isSaving}
                    style={{
                      border: 'none',
                      background: services.length <= 1 ? '#eee' : '#fff0f2',
                      color: services.length <= 1 ? '#aaa' : colors.primary,
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: services.length <= 1 || isSaving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    刪除
                  </button>
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
            disabled={isSaving}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: 'none', 
              border: `2px dashed ${colors.accent}`, 
              borderRadius: '12px', 
              color: colors.secondary, 
              fontSize: '14px', 
              fontWeight: 'bold', 
              cursor: isSaving ? 'not-allowed' : 'pointer',
              marginBottom: '24px'
            }}
          >
            ➕ 新增更多服務
          </button>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '16px', background: isSaving ? '#9b7779' : colors.primary, color: '#fff', fontSize: '15px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer' }}
          >
            {isSaving ? '儲存中...' : '儲存服務設定'}
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
