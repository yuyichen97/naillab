import React from 'react';

const colors = {
  primary: '#560A0C',     
  secondary: '#A45D65',   
  accent: '#CCA2A4',      
  background: '#EAD4D6',  
  gray: '#f8f9fa'
};

export default function Favorites({ favorites, toggleFavorite, onSelectStudio }) {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#222', marginBottom: '20px' }}>
        ❤️ 我收藏的工作室 ({favorites.length})
      </h2>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '24px', border: '1px dashed #CCA2A4' }}>
          <div style={{ fontSize: '50px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ color: '#333', fontSize: '16px', fontWeight: 'bold' }}>目前沒有收藏任何工作室</h3>
          <p style={{ color: '#aaa', fontSize: '13px' }}>快去探索首頁看看有沒有心儀的美甲師吧！✨</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {favorites.map((studio) => (
            <div 
              key={studio.id} 
              onClick={() => onSelectStudio && onSelectStudio(studio)} // 🎯 點擊卡片進入預約
              style={{ 
                background: '#fff', borderRadius: '20px', overflow: 'hidden', 
                boxShadow: '0 6px 18px rgba(86,10,12,0.03)', border: '1px solid #f3f3f3',
                position: 'relative', display: 'flex', flexDirection: 'column', cursor: 'pointer'
              }}
            >
              <div style={{ height: '150px', background: '#EAD4D6', display: 'flex', alignItems: 'center', justifycontent: 'center', position: 'relative', fontSize: '48px' }}>
                {studio.imageText}

                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // 🎯 隔離愛心事件，避免取消收藏時誤跳預約頁面
                    toggleFavorite(studio);
                  }}
                  style={{ position: 'absolute', top: '14px', right: '14px', width: '34px', height: '34px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifycontent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}
                >
                  <span style={{ fontSize: '18px' }}>❤️</span>
                </button>
              </div>

              <div style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '16px', color: '#111' }}>{studio.name}</strong>
                  <span style={{ fontSize: '14px', color: '#ffb100', fontWeight: 'bold' }}>⭐ {studio.rating}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>📍 {studio.location}</div>
                <div style={{ display: 'flex', gap: '6px', flexwrap: 'wrap' }}>
                  {studio.tags?.map(tag => (
                    <span key={tag} style={{ fontSize: '11px', background: '#FFF0F2', padding: '3px 10px', borderRadius: '6px', color: colors.secondary, fontWeight: 'bold' }}>#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}