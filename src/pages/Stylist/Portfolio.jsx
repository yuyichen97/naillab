import React, { useState } from 'react';

function StylistPortfolio() {
  // 狀態：目前選中的作品分類
  const [activeTab, setActiveTab] = useState('全部');

  // 假資料：模擬美甲師上傳的作品集照片與數據（對應你們設計圖上的卡片內容）
  const photos = [
    { id: 1, title: '琥珀暈染設計', likes: 120, views: 1042, category: '暈染', color: '#e9c46a' },
    { id: 2, title: '冰透極光貓眼', likes: 95, views: 830, category: '貓眼', color: '#a8dadc' },
    { id: 3, title: '法式經典線條', likes: 210, views: 2450, category: '法式', color: '#f4a261' },
    { id: 4, title: '極致經典單色', likes: 45, views: 320, category: '單色', color: '#e76f51' },
  ];

  const categories = ['全部', '暈染', '貓眼', '法式', '單色'];

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh' }}>
      
      {/* 1. 頂部列：標題與你們設計圖上那個超精緻的「📤 上傳按鈕」 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#aaa', letterSpacing: '1px' }}>GALLERY</span>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a' }}>作品集管理</h2>
        </div>
        {/* 上傳按鈕 */}
        <button 
          onClick={() => alert('觸發手機相冊上傳圖片！')}
          style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#111318', color: '#fff', border: 'none', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          📤
        </button>
      </div>

      {/* 2. 分類標籤（橫向滑動） */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px', whiteSpace: 'nowrap' }}>
        {categories.map((cat) => {
          const isSelected = activeTab === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '15px',
                border: isSelected ? 'none' : '1px solid #eee',
                background: isSelected ? '#5a189a' : '#fff',
                color: isSelected ? '#fff' : '#666',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: isSelected ? 'bold' : 'normal'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. 雙列網格照片牆（完美復刻設計圖上的排版） */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {photos.map((photo) => (
          <div 
            key={photo.id}
            style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #f0f0f0',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
          >
            {/* 作品照片預留區（先用純色塊和文字代替，之後接後端圖片網址） */}
            <div style={{ height: '140px', background: photo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              {photo.category}
            </div>

            {/* 下方數據列 */}
            <div style={{ padding: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {photo.title}
              </div>
              
              {/* 愛心與瀏覽量數據 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#888' }}>
                <span>💖 {photo.likes}</span>
                <span>👁️ {photo.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default StylistPortfolio;