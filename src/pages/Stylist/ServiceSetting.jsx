import React, { useState } from 'react';

// 引入你們專題顏色.jpg 的色調
const colors = {
  primary: '#560A0C',     // 酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
};

function StylistServiceSetting() {
  // 狀態：管理美甲師輸入的服務項目列表（預設有一筆資料）
  const [services, setServices] = useState([
    { id: 1, name: '極致單色光療', price: '800', duration: '90' }
  ]);

  // 處理輸入欄位改變
  const handleInputChange = (id, field, value) => {
    const updated = services.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setServices(updated);
  };

  // 點擊「＋ 新增更多服務」
  const addServiceRow = () => {
    const newId = services.length > 0 ? services[services.length - 1].id + 1 : 1;
    setServices([...services, { id: newId, name: '', price: '', duration: '' }]);
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh' }}>
      
      {/* 1. 頂部標題與流程提示 */}
      <div style={{ marginBottom: '25px' }}>
        <span style={{ fontSize: '11px', color: colors.secondary, fontWeight: 'bold', letterSpacing: '1px' }}>STEP 03</span>
        <h2 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a' }}>核心服務設定</h2>
        <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 0 0' }}>這是取代私訊問價的關鍵資訊</p>
      </div>

      {/* 2. 動態服務項目列表（對應設計圖上的白底卡片） */}
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

            {/* 服務名稱輸入框 */}
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

            {/* 價格與耗時（橫向並排） */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>價格 (TWD)</label>
                <input 
                  type="number" 
                  placeholder="800" 
                  value={service.price}
                  onChange={(e) => handleInputChange(service.id, 'price', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
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

      {/* 3. 新增更多服務按鈕（虛線框樣式，完美還原設計圖） */}
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
          marginBottom: '30px'
        }}
      >
        ➕ 新增更多服務
      </button>

      {/* 4. 底部導覽按鈕 */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button style={{ flex: 1, padding: '12px', border: '1px solid #ddd', background: '#fff', borderRadius: '25px', color: '#666', fontSize: '14px', cursor: 'pointer' }}>
          返回
        </button>
        <button 
          onClick={() => alert(`成功儲存 ${services.length} 項服務！已完成入駐！`)}
          style={{ flex: 2, padding: '12px', border: 'none', background: colors.primary, borderRadius: '25px', color: '#fff', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          完成入駐 ➔
        </button>
      </div>

    </div>
  );
}

export default StylistServiceSetting;
