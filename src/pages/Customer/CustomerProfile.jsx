import React, { useState, useRef, useEffect } from 'react';

const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  gray: '#f8f9fa'
};

export default function CustomerProfile({ currentUser }) {
  // ─── 狀態管理 ───
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(currentUser?.name || '消費者'); 
  const [selectedStyles, setSelectedStyles] = useState([]);
  
  // 📸 互動式頭像狀態 (點擊可更換本地照片)
  const [avatar, setAvatar] = useState(null); 
  const fileInputRef = useRef(null);

  // 🎯 核心修正：確保預設資料與新存入的 localStorage 完美合併，不會互相蓋掉
  const [bookingRecords, setBookingRecords] = useState(() => {
    const savedBookings = localStorage.getItem('nail_appointments');
    const defaultRecord = {
      id: 'B20260604',
      studio: '暮色美甲沙龍',
      service: '單色凝膠美甲 + 貓眼晶石',
      price: '$1,399',
      date: '2026-06-04',
      time: '11:00',
      status: '店家審核中'
    };

    if (savedBookings) {
      const parsed = JSON.parse(savedBookings);
      // 如果快取裡已經有資料，且不包含這筆預設的，就幫忙補在最後面
      if (!parsed.some(item => item.id === 'B20260604')) {
        return [...parsed, defaultRecord];
      }
      return parsed;
    }
    return [defaultRecord];
  });

  // 當使用者重新註冊、登入或 currentUser 改變時，即時更新名字狀態
  useEffect(() => {
    if (currentUser?.name) {
      setUserName(currentUser.name);
    }
  }, [currentUser]);

  // 🎯 核心修正：加強版同步監聽，當頁面一亮起 (切換分頁) 就重新去 LocalStorage 撈一次最新狀態
  useEffect(() => {
    const refreshBookings = () => {
      const savedBookings = localStorage.getItem('nail_appointments');
      const defaultRecord = {
        id: 'B20260604',
        studio: '暮色美甲沙龍',
        service: '單色凝膠美甲 + 貓眼晶石',
        price: '$1,399',
        date: '2026-06-04',
        time: '11:00',
        status: '店家審核中'
      };

      if (savedBookings) {
        const parsed = JSON.parse(savedBookings);
        if (!parsed.some(item => item.id === 'B20260604')) {
          setBookingRecords([...parsed, defaultRecord]);
        } else {
          setBookingRecords(parsed);
        }
      }
    };
    
    window.addEventListener('storage', refreshBookings);
    window.addEventListener('focus', refreshBookings); 
    refreshBookings(); // 元件載入時先主動刷一次
    
    return () => {
      window.removeEventListener('storage', refreshBookings);
      window.removeEventListener('focus', refreshBookings);
    };
  }, []);

  const handleAxatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result); 
    };
    reader.readAsDataURL(file);
  };

  const generateBeautifulUsername = () => {
    const cleanName = userName.toLowerCase().replace(/\s+/g, '_');
    if (currentUser?.phone) {
      const lastFour = currentUser.phone.slice(-4);
      return `nail_${cleanName}_${lastFour}`;
    }
    return `nail_${cleanName}_4321`;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 10px', fontFamily: 'system-ui, sans-serif' }}>
      
      <style>{`
        .style-box {
          border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px 10px;
          text-align: center; cursor: pointer; transition: all 0.2s ease; background: #fff;
        }
        .style-box:hover { transform: translateY(-2px); }
        .avatar-container {
          position: relative; width: 120px; height: 120px; border-radius: 50%;
          background: #FF6B8B; display: flex; align-items: center; justify-content: center;
          cursor: pointer; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .avatar-mask {
          position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: #fff;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          font-size: 11px; opacity: 0; transition: opacity 0.2s; font-weight: bold;
        }
        .avatar-container:hover .avatar-mask { opacity: 1; }
        .booking-card {
          display: flex; justify-content: space-between; align-items: center;
          background: #fff; padding: 20px; border-radius: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02); border: 1px solid #f0f0f0; margin-top: 12px;
          text-align: left;
        }
        @media (max-width: 768px) {
          .booking-card { flex-direction: column; align-items: flex-start; gap: 14px; }
        }
      `}</style>

      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

      {/* 基本資料卡片 */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          
          <div className="avatar-container" onClick={handleAxatarClick}>
            {avatar ? (
              <img src={avatar} alt="頭像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              /* ✨ 關鍵修正：這裡已完美修復原本語法錯誤的 center 加上引號 */
              <div style={{ width: '100%', height: '100%', background: '#EAD4D6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>👩🏻</div>
            )}
            <div className="avatar-mask">
              <span>📷</span>
              <span>更換照片</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', width: '100%' }}>
            <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>姓名</div>
            {isEditing ? (
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', padding: '4px 10px', border: `2px solid ${colors.accent}`, borderRadius: '6px', outline: 'none' }}
              />
            ) : (
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{userName}</div>
            )}

            <div style={{ fontSize: '13px', color: '#aaa', marginTop: '14px', marginBottom: '4px' }}>帳號</div>
            <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
              {generateBeautifulUsername()}
            </div>

            <div style={{ fontSize: '13px', color: '#aaa', marginTop: '14px', marginBottom: '4px' }}>身份</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f5f5f5', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', color: '#555', fontWeight: 'bold' }}>
              🧭 消費者
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px', marginTop: '20px' }}>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              style={{ flex: 1, background: colors.primary, color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isEditing ? '💾 儲存資料' : '✏️ 編輯資料'}
            </button>
            <button 
              onClick={() => alert('已安全登出')}
              style={{ flex: 1, background: '#fff', color: '#666', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🚪 登出
            </button>
          </div>
        </div>
      </div>

      {/* 預約日程管理卡片 */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#222', textAlign: 'left' }}>📅 專屬我的美甲預約日程</h3>
        
        {bookingRecords.map((record) => (
          <div key={record.id} className="booking-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '16px', color: '#111' }}>{record.studio}</strong>
                <span style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px', color: '#888' }}>單號 {record.id}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
                施作項目：{record.service} ｜ 金額：<strong style={{ color: colors.primary }}>{record.price}</strong>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#444' }}>
              ⏰ 預約時間：<span style={{ fontWeight: 'bold', color: '#000' }}>{record.date} 於 {record.time}</span>
            </div>
            <div>
              <span style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', background: '#FFF0F2', color: colors.primary, border: `1px solid ${colors.accent}` }}>
                ⏳ {record.status}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}