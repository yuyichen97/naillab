import React, { useState } from 'react';

const colors = {
  primary: '#560A0C',     
  secondary: '#A45D65',   
  accent: '#CCA2A4',      
  background: '#EAD4D6',  
  gray: '#f8f9fa'
};

export default function Home({ favorites, toggleFavorite, onSelectStudio }) {
  // 🎯 核心修正 1：建立搜尋關鍵字的狀態
  const [searchQuery, setSearchQuery] = useState('');
  
  // 紀錄當前選取分類的狀態，預設為 '全部'
  const [selectedCategory, setSelectedCategory] = useState('全部');
  
  // 🧠 擴充：定義常用的精準推薦關鍵字（猜你想搜）
  const quickSearchKeywords = ['大安區', '中山區', '貓眼', '手繪'];

  // 靜態資料庫（擴充了測試資料，方便 Demo 時展示搜尋效果）
  const recommendedStudios = [
    {
      id: 'studio_muse_01', 
      name: '暮色美甲沙龍',
      rating: '4.9',
      location: '台北市大安區',
      tags: ['韓系', '貓眼'], 
      imageText: '💅'
    },
    {
      id: 'studio_rose_02',
      name: '玫瑰花園美甲工作室',
      rating: '4.8',
      location: '台北市中山區',
      tags: ['日系', '手繪'], 
      imageText: '🌸'
    },
    {
      id: 'studio_flora_03',
      name: 'Ikj 質感幾何美甲',
      rating: '4.7',
      location: '台北市信義區',
      tags: ['簡約', '貓眼'], 
      imageText: '✨'
    }
  ];

  // 🎯 核心優化 2：高容錯率的交叉過濾演算法（同時支援分類標籤＋輸入框模糊搜尋）
  const filteredStudios = recommendedStudios.filter(studio => {
    // 1. 處理【分類標籤】過濾
    const matchesCategory = selectedCategory === '全部' || studio.tags.includes(selectedCategory);

    // 2. 處理【搜尋關鍵字】優化
    // 去除前後空白、全部轉為小寫做格式歸一化（防呆）
    const cleanQuery = searchQuery.trim().toLowerCase();
    
    // 如果沒有輸入任何關鍵字，就直接回傳標籤過濾的結果
    if (!cleanQuery) return matchesCategory;

    // 多維度聯合檢索：比對 店名、地區、風格標籤
    const matchStudioName = studio.name?.toLowerCase().includes(cleanQuery);
    const matchLocation   = studio.location?.toLowerCase().includes(cleanQuery);
    const matchTags       = studio.tags?.some(tag => tag.toLowerCase().includes(cleanQuery));

    // 必須同時符合「分類標籤」且「關鍵字符合任一維度」
    return matchesCategory && (matchStudioName || matchLocation || matchTags);
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 搜尋列區域 */}
      <div style={{ position: 'relative', marginTop: '10px', marginBottom: '8px' }}>
        <input 
          type="text" 
          value={searchQuery}
          // 🎯 核心修正 3：綁定輸入事件
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 搜尋風格、地區（如：信義區、手繪）..." 
          style={{ width: '100%', padding: '14px 45px 14px 20px', borderRadius: '30px', border: '1px solid #ddd', fontSize: '15px', outline: 'none', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
        />
        
        {/* 🧠 貼心小功能：當搜尋框有字時，右側顯示 ✕ 按鈕可以一鍵清空 */}
        {searchQuery && (
          <button 
            type="button"
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#bbb', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 🎯 核心修正 4：新增「猜你想搜」熱門推薦標籤 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', paddingLeft: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: colors.secondary, fontWeight: 'bold' }}>⚡ 猜你想搜：</span>
        {quickSearchKeywords.map(keyword => (
          <button
            key={keyword}
            type="button"
            onClick={() => setSearchQuery(keyword)} // 點擊直接將關鍵字填入搜尋框
            style={{
              background: '#f5eded',
              border: 'none',
              borderRadius: '12px',
              padding: '4px 12px',
              fontSize: '12px',
              color: colors.primary,
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.target.style.background = '#ead4d6'}
            onMouseOut={(e) => e.target.style.background = '#f5eded'}
          >
            #{keyword}
          </button>
        ))}
      </div>

      {/* 熱門分類 */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '14px', color: '#666', fontWeight: 'bold', marginBottom: '12px' }}>熱門分類 ✨</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['全部', '韓系', '貓眼', '簡約', '奢華', '手繪'].map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <span 
                key={category} 
                onClick={() => setSelectedCategory(category)} 
                style={{ 
                  background: isSelected ? colors.primary : '#fff', 
                  color: isSelected ? '#fff' : '#555', 
                  padding: '8px 18px', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  fontWeight: 'bold', 
                  border: isSelected ? 'none' : '1px solid #eee', 
                  cursor: 'pointer',
                  userSelect: 'none', 
                  transition: 'all 0.2s ease' 
                }}
              >
                {category}
              </span>
            );
          })}
        </div>
      </div>

      {/* 推薦工作室卡片標題 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#222', margin: 0 }}>
          {selectedCategory === '全部' ? '推薦工作室' : `推薦工作室 · ${selectedCategory}`}
          {searchQuery && <span style={{ fontSize: '13px', color: '#888', fontWeight: 'normal' }}>（關鍵字: "{searchQuery}"）</span>}
        </h3>
        <span style={{ fontSize: '13px', color: colors.secondary, fontWeight: '500' }}>查看更多</span>
      </div>

      {/* 卡片列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredStudios.length > 0 ? (
          filteredStudios.map((studio) => {
            const isFavorited = favorites.some(item => item.id === studio.id);

            return (
              <div 
                key={studio.id} 
                onClick={() => onSelectStudio && onSelectStudio(studio)} 
                style={{ 
                  background: '#fff', borderRadius: '20px', overflow: 'hidden', 
                  boxShadow: '0 6px 18px rgba(86,10,12,0.03)', border: '1px solid #f3f3f3',
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  cursor: 'pointer', transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* 卡片上半部背景圖 */}
                <div style={{ height: '150px', background: '#EAD4D6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: '48px' }}>
                  {studio.imageText}

                  {/* 右上角愛心收藏按鈕 */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      toggleFavorite(studio);
                    }}
                    style={{
                      position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px',
                      borderRadius: '50%', background: '#fff', border: 'none', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', outline: 'none'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{isFavorited ? '❤️' : '🤍'}</span>
                  </button>
                </div>

                {/* 下半部資訊 */}
                <div style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '16px', color: '#111' }}>{studio.name}</strong>
                    <span style={{ fontSize: '14px', color: '#ffb100', fontWeight: 'bold' }}>⭐ {studio.rating}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>📍 {studio.location}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {studio.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '11px', background: '#FFF0F2', padding: '3px 10px', borderRadius: '6px', color: colors.secondary, fontWeight: 'bold' }}>#{tag}</span>
                    ))}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          /* 🔍 高質感防呆：不論是分類沒店家，還是關鍵字查無結果，都顯示這個漂亮的空白提示 */
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 40px', color: '#999', fontSize: '14px', background: '#fff', borderRadius: '20px', border: '1px dashed #eee' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
            <strong>找不到符合條件的工作室</strong>
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>建議試試看其他關鍵字，或清除分類標籤再搜看看唷！</div>
          </div>
        )}
      </div>

    </div>
  );
}