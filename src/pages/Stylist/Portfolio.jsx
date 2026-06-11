import React, { useState, useEffect } from 'react';

const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  gray: '#f8f9fa'
};

// 🎯 解構接收來自 App.jsx 的全域狀態與更新函式，達成同步核心連動
export default function StylistPortfolio({ 
  currentUser, 
  studioName, 
  setStudioName, 
  rules, 
  setRules, 
  portfolioImages, 
  setPortfolioImages 
}) {
  // 控制上方「填寫與調整設定」及「預覽」頁籤狀態
  const [activeSubTab, setActiveSubTab] = useState('edit');

  // 💡 原本元件內部的三個 useState 已經成功移除，改為向上與全域綁定 💡

  // 動態同步更新工作室名字（只有在還是預設名稱且登入資料存在時才覆蓋）
  useEffect(() => {
    if (currentUser && (studioName === '預設美甲沙龍' || studioName === '暮色美甲沙龍')) {
      const dynamicName = currentUser.studioName || currentUser.name || currentUser.username;
      if (dynamicName) {
        setStudioName(dynamicName);
      }
    }
  }, [currentUser, setStudioName]);

  // 📸 核心功能：處理本地實體照片上傳，直接存入全域陣列
  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioImages((prevImages) => [...prevImages, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // 刪除作品集照片
  const handleRemoveImage = (index) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index));
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '10px 0', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 🔮 注入 RWD 安全排版與上傳按鈕美化樣式 */}
      <style>{`
        .edit-grid {
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
          gap: 24px; 
          background: #F9ECEE; 
          padding: 24px; 
          border-radius: 20px;
        }
        
        .upload-btn-wrapper {
          position: relative;
          overflow: hidden;
          display: inline-block;
          width: 100%;
        }
        .btn-upload {
          border: 2px dashed ${colors.secondary};
          color: ${colors.secondary};
          background-color: #fff;
          padding: 14px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: bold;
          width: 100%;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .btn-upload:hover {
          background-color: #FFF0F2;
          border-color: ${colors.primary};
          color: ${colors.primary};
        }
        .upload-btn-wrapper input[type=file] {
          font-size: 100px;
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          cursor: pointer;
        }

        @media (max-width: 500px) {
          .edit-grid { padding: 12px; gap: 16px; }
        }
      `}</style>

      {/* ─── 頂部小標籤 ─── */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <span style={{ 
          background: '#F5E6E8', color: colors.secondary, fontSize: '12px', 
          padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' 
        }}>
          店鋪外觀
        </span>
      </div>

      {/* ─── 大標題 ─── */}
      <h2 style={{ 
        textAlign: 'center', margin: '0 0 24px 0', fontSize: '22px', 
        fontWeight: 'bold', color: colors.primary, letterSpacing: '1px',
        padding: '0 10px'
      }}>
        『{studioName}』管理系統
      </h2>

      {/* ─── 子頁籤切換按鈕組 (填寫設定 / 預覽) ─── */}
      <div style={{ 
        display: 'flex', background: '#F0F2F5', padding: '6px', 
        borderRadius: '30px', maxWidth: '460px', margin: '0 auto 24px auto',
        boxSizing: 'border-box'
      }}>
        <button 
          onClick={() => setActiveSubTab('edit')}
          style={{ 
            flex: 1, border: 'none', padding: '10px 12px', borderRadius: '25px', 
            fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
            background: activeSubTab === 'edit' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'edit' ? colors.primary : '#666',
            boxShadow: activeSubTab === 'edit' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          ⚙️ 填寫與調整設定
        </button>
        <button 
          onClick={() => setActiveSubTab('preview')}
          style={{ 
            flex: 1, border: 'none', padding: '10px 12px', borderRadius: '25px', 
            fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
            background: activeSubTab === 'preview' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'preview' ? colors.primary : '#666',
            boxShadow: activeSubTab === 'preview' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          👀 看消費者畫面 (預覽)
        </button>
      </div>

      {/* ─── 內容區塊分流 ─── */}
      {activeSubTab === 'edit' ? (
        /* ================= ⚙️ 填寫調整模式 ================= */
        <div className="edit-grid">
          
          {/* 左側：門面設定表單 */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
              🏨 店鋪門面設定
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px', textAlign: 'center' }}>
                沙龍 / 工作室名稱
              </label>
              <input 
                type="text" 
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                style={{ 
                  width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '10px', 
                  fontSize: '14px', color: colors.primary, fontWeight: 'bold', boxSizing: 'border-box', textAlign: 'center' 
                }} 
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px', textAlign: 'center' }}>
                📜 工作室預約準則 (一人一行)
              </label>
              <textarea 
                rows="4"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                style={{ 
                  width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '10px', 
                  fontSize: '13px', lineHeight: '1.5', color: '#444', boxSizing: 'border-box' 
                }}
              />
            </div>

            {/* 上傳檔案區塊 */}
            <div style={{ borderTop: '1px dashed #eee', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '8px', textAlign: 'center' }}>
                📸 上傳美甲作品照片
              </label>
              <div className="upload-btn-wrapper">
                <div className="btn-upload">
                  <span style={{ fontSize: '20px' }}>📤</span>
                  <span>點擊選擇照片或拍照上傳</span>
                  <span style={{ fontSize: '11px', color: '#999', fontWeight: 'normal' }}>支援多張同時選擇 (.jpg, .png)</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageUpload} 
                />
              </div>
            </div>
          </div>

          {/* 右側：目前作品集內容 */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
              目前作品集內容 ({portfolioImages.length} 張)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
              {portfolioImages.map((url, index) => (
                <div key={index} style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', position: 'relative', border: '1px solid #eee' }}>
                  <img src={url} alt="作品" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => handleRemoveImage(index)}
                    style={{ 
                      position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.9)', 
                      color: '#ff4d4f', border: 'none', width: '18px', height: '18px', borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', 
                      fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* ================= 📱 手機前台模擬預覽模式 ================= */
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 10px', width: '100%', boxSizing: 'border-box' }}>
          
          <div style={{ 
            width: '340px', maxWidth: '100%', background: '#111', padding: '10px', 
            borderRadius: '36px', boxShadow: '0 12px 30px rgba(0,0,0,0.12)', border: '3px solid #222',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              background: '#ffffff', borderRadius: '26px', overflow: 'hidden', 
              minHeight: '480px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
            }}>
              
              <div style={{ background: '#333', color: '#fff', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>Nail Lab 模擬</span>
                <span style={{ whiteSpace: 'nowrap' }}>📶 5G 100%</span>
              </div>

              <div style={{ width: '100%', height: '140px', position: 'relative', background: '#555', overflow: 'hidden' }}>
                <img 
                  src={portfolioImages[0] || "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400"} 
                  alt="封面" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))' }} />
                
                <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px', color: '#fff' }}>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🌟 {studioName || '未命名工作室'}
                  </h4>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>📍 台北市大安區</div>
                </div>
              </div>

              <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fff' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px 4px', fontSize: '12px', fontWeight: 'bold', color: colors.primary, borderBottom: `2px solid ${colors.primary}`, whiteSpace: 'nowrap' }}>
                  作品集 & 準則
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px 4px', fontSize: '12px', color: '#888', whiteSpace: 'nowrap' }}>
                  服務價目表
                </div>
              </div>

              <div style={{ padding: '12px', flex: 1, background: '#F8F9FA', overflowY: 'auto', maxHeight: '320px', boxSizing: 'border-box' }}>
                
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.01)', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: colors.secondary }}>
                    📜 店家預約須知
                  </div>
                  <div style={{ fontSize: '11px', color: '#555', whiteSpace: 'pre-line', lineHeight: '1.5', wordBreak: 'break-all' }}>
                    {rules}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.01)', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: colors.secondary }}>
                    🖼️ 現場作品精選
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', width: '100%' }}>
                    {portfolioImages.map((url, idx) => (
                      <div key={idx} style={{ width: '100%', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: '#eee' }}>
                        <img src={url} alt="預覽作品" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}