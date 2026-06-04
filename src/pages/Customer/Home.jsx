import React, { useState } from 'react';

function CustomerHome() {
  const [activeCategory, setActiveCategory] = useState('全部');

  const idols = [
    {
      id: 1,
      name: 'Emma Nail Studio',
      location: '台北市大安區 · 0.8km',
      rating: '4.9 (120+ 評價)',
      tags: ['#韓系', '#貓眼', '#奢華'],
      img: '👤'
    },
    {
      id: 2,
      name: '艾米美甲美睫',
      location: '台北市信義區 · 2.1km',
      rating: '4.8 (85 評價)',
      tags: ['#日系', '#簡約', '#手繪'],
      img: '💅'
    },
    {
      id: 3,
      name: '鑽石美甲工作室',
      location: '台北市東區 · 1.5km',
      rating: '4.9 (156 評價)',
      tags: ['#奢華', '#貓眼', '#時尚'],
      img: '💎'
    }
  ];

  const categories = ['全部', '韓系', '貓眼', '簡約', '奢華', '手繪'];

  return (
    <div style={{ width: '100%', minHeight: '100vh' }} className="customer-home">
      
      {/* 1. 頂部區：大頭貼、哈囉、通知 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 'clamp(2.5rem, 8vw, 3.5rem)', height: 'clamp(2.5rem, 8vw, 3.5rem)', borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}>👩</div>
          <div>
            <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', color: '#888' }}>你好，</div>
            <div style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', fontWeight: 'bold' }}>小美</div>
          </div>
        </div>
        <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', cursor: 'pointer', transition: 'transform 0.3s' }}>🔔</div>
      </div>

      {/* 2. 搜尋列 */}
      <div style={{ marginBottom: '25px' }}>
        <input 
          type="text" 
          placeholder="🔍 搜尋風格、地區..." 
          style={{ width: '100%', padding: 'clamp(10px, 2vw, 14px) clamp(12px, 3vw, 16px)', borderRadius: '20px', border: 'none', background: '#f4f5f7', fontSize: 'clamp(0.85rem, 2vw, 1rem)', boxSizing: 'border-box', transition: 'box-shadow 0.3s' }}
          onFocus={(e) => e.target.style.boxShadow = '0 2px 12px rgba(86, 10, 12, 0.1)'}
          onBlur={(e) => e.target.style.boxShadow = 'none'}
        />
      </div>

      {/* 3. 熱門分類 */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', margin: '0 0 15px 0', fontWeight: 'bold' }}>熱門分類 ✨</h3>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', whiteSpace: 'nowrap', scrollBehavior: 'smooth' }}>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: 'clamp(6px, 2vw, 10px) clamp(12px, 3vw, 18px)',
                  borderRadius: '15px',
                  border: 'none',
                  background: isSelected ? '#560A0C' : '#f4f5f7',
                  color: isSelected ? '#fff' : '#666',
                  fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  transition: 'all 0.3s',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 2px 8px rgba(86, 10, 12, 0.2)' : 'none'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 推薦工作室標題 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', margin: 0, fontWeight: 'bold' }}>推薦工作室</h3>
        <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', color: '#560A0C', cursor: 'pointer', fontWeight: 'bold', transition: 'opacity 0.3s' }} onMouseEnter={(e) => e.target.style.opacity = '0.7'} onMouseLeave={(e) => e.target.style.opacity = '1'}>查看更多</span>
      </div>

      {/* 5. 工作室卡片清單 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(15px, 3vw, 20px)' }}>
        {idols.map((shop) => (
          <div 
            key={shop.id}
            style={{
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #f0f0f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(86, 10, 12, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            {/* 假圖片區 */}
            <div style={{ height: 'clamp(100px, 25vw, 150px)', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(2rem, 8vw, 3rem)' }}>
              {shop.img}
            </div>
            
            {/* 卡片文字內容 */}
            <div style={{ padding: 'clamp(12px, 3vw, 16px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', fontWeight: 'bold', flex: 1 }}>{shop.name}</h4>
                <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', color: '#ffb703', whiteSpace: 'nowrap' }}>⭐ {shop.rating}</span>
              </div>
              
              <p style={{ margin: '6px 0', fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', color: '#888' }}>📍 {shop.location}</p>
              
              {/* 標籤 */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                {shop.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 'clamp(0.7rem, 2vw, 0.8rem)', background: '#f3e5f5', color: '#560A0C', padding: '4px 8px', borderRadius: '4px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .customer-home {
            padding: 1rem;
          }
        }
        @media (max-width: 480px) {
          .customer-home {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

export default CustomerHome;