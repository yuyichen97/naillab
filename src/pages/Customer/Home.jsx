import React, { useEffect, useState } from 'react';
import { fetchShops } from '../../lib/supabase';

const categories = ['全部', '韓系', '貓眼', '簡約', '奢華', '手繪'];
const fallbackImage = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop';

export default function Home({ favorites, toggleFavorite, onSelectStudio }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [studios, setStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShops()
      .then(setStudios)
      .catch(error => console.error('Failed to fetch studios:', error))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredStudios = studios.filter(studio => {
    const matchesCategory = selectedCategory === '全部' || (studio.tags || []).includes(selectedCategory);
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return matchesCategory;

    return matchesCategory && [studio.name, studio.location, ...(studio.tags || [])]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(keyword));
  });

  return (
    <section>
      <div>
        <h1 className="page-heading">找到適合今天的美甲</h1>
        <p className="page-subtitle">看作品、比較服務，選好時間就完成預約。</p>
      </div>

      <div className="search-panel">
        <div className="search-wrap">
          <input
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="搜尋工作室、地區或風格"
            aria-label="搜尋工作室"
          />
          {searchQuery && (
            <button className="clear-search" type="button" onClick={() => setSearchQuery('')} aria-label="清除搜尋">×</button>
          )}
        </div>

        <div className="category-tabs" aria-label="美甲風格篩選">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="section-heading-row">
        <h2>{selectedCategory === '全部' ? '推薦工作室' : `${selectedCategory}工作室`}</h2>
        <span>{isLoading ? '載入中' : `${filteredStudios.length} 間`}</span>
      </div>

      <div className="studio-grid">
        {isLoading && <div className="empty-state">正在載入工作室資料...</div>}

        {!isLoading && filteredStudios.map(studio => {
          const isFavorited = favorites.some(item => item.id === studio.id);
          const coverImage = studio.portfolioImages?.[0] || fallbackImage;

          return (
            <article
              key={studio.id}
              className="studio-card"
              role="button"
              tabIndex={0}
              aria-label={`查看 ${studio.name}`}
              onClick={() => onSelectStudio(studio)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') onSelectStudio(studio);
              }}
            >
              <div className="studio-card-media">
                <img
                  src={coverImage}
                  alt={`${studio.name}作品`}
                  onError={event => { event.currentTarget.src = fallbackImage; }}
                />
                <button
                  className="favorite-button"
                  type="button"
                  aria-label={isFavorited ? `取消收藏 ${studio.name}` : `收藏 ${studio.name}`}
                  onClick={event => {
                    event.stopPropagation();
                    toggleFavorite(studio);
                  }}
                >
                  {isFavorited ? '♥' : '♡'}
                </button>
              </div>

              <div className="studio-card-copy">
                <div className="studio-card-title">
                  <strong>{studio.name}</strong>
                  <span>★ {studio.rating}</span>
                </div>
                <p className="studio-location">{studio.location}</p>
                <div className="tag-list">
                  {(studio.tags || []).map(tag => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </article>
          );
        })}

        {!isLoading && filteredStudios.length === 0 && (
          <div className="empty-state">
            <strong>找不到符合條件的工作室</strong>
            <div style={{ marginTop: 6, fontSize: 13 }}>換個關鍵字或選擇其他風格看看。</div>
          </div>
        )}
      </div>
    </section>
  );
}
