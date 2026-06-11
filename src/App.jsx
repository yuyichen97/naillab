import React, { useState } from 'react';
import Home from './pages/Customer/Home';
import CustomerProfile from './pages/Customer/CustomerProfile';
import Favorites from './pages/Customer/Favorites';
import ShopDetail from './pages/Customer/ShopDetail';
import Login from './pages/Auth/Login'; // 🎯 引入妳的登入註冊頁面

// 🎯 引入妳的美甲師後台管理頁面
import Dashboard from './pages/Stylist/Dashboard'; 

const colors = {
  primary: '#560A0C',     
  secondary: '#A45D65',   
  accent: '#CCA2A4',      
  background: '#EAD4D6',  
  gray: '#f8f9fa'
};

export default function App() {
  // 👥 1. 登入狀態控制：初始預設為 null (未登入，會停留在身份選擇與登入註冊頁)
  const [currentUser, setCurrentUser] = useState(null); 

  // 🧭 2. 消費者分頁狀態：'home', 'favorites', 'profile', 'shop-detail'
  const [currentTab, setCurrentTab] = useState('home');
  
  // 🎯 3. 紀錄目前消費者點選的是哪一家工作室的細節
  const [selectedStudio, setSelectedStudio] = useState(null);

  // ❤️ 4. 全域收藏狀態
  const [favorites, setFavorites] = useState([]);

  // 愛心收藏切換
  const toggleFavorite = (studio) => {
    const isExist = favorites.some(item => item.id === studio.id);
    if (isExist) {
      setFavorites(favorites.filter(item => item.id !== studio.id));
    } else {
      setFavorites([...favorites, studio]);
    }
  };

  // 消費者點擊卡片跳轉至詳情頁
  const handleSelectStudio = (studio) => {
    setSelectedStudio(studio);
    setCurrentTab('shop-detail'); 
  };

  // 🎯 核心優化：詳情頁提交預約後的處理（雙重保險寫入 localStorage 並自動跳轉至我的帳戶）
  const handleBookingSubmit = (bookingData) => {
    // A. 建立動態單號防碰撞編碼
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `B${todayStr}${randomNum}`;

    // B. 組裝與 CustomerProfile 欄位格式完全一致的訂單資料
    const newBookingItem = {
      id: generatedId,
      studio: selectedStudio?.name || '暮色美甲沙龍', // 自動帶入消費者剛點選的工作室名稱
      service: bookingData.service || '精緻微奢晶石貓眼',
      price: bookingData.price || '$1,600',
      date: bookingData.date || '2026-06-04',
      time: bookingData.time || '14:00', // 修正：精準對接傳入的預約時間段
      status: '店家審核中'
    };

    // C. 讀取並合併至 localStorage 緩存池中
    const existingRaw = localStorage.getItem('nail_appointments');
    let currentList = [];
    if (existingRaw) {
      currentList = JSON.parse(existingRaw);
    }
    
    // 防呆：避免與 Flow 組件重複塞入同一筆單
    if (!currentList.some(item => item.id === generatedId)) {
      currentList.unshift(newBookingItem); // 將最新預約置頂
      localStorage.setItem('nail_appointments', JSON.stringify(currentList));
    }

    // D. 跳出提示視窗
    alert(`🎉 預約申請提交成功！\n店名：${newBookingItem.studio}\n項目：${newBookingItem.service}\n單號：${generatedId}\n\n系統將自動為您引導至「我的帳戶」確認日程！`);

    // E. 關鍵修正：將 Tab 狀態強制切換至「我的帳戶」頁面，以便觸發日程卡片重繪
    setCurrentTab('profile'); 
  };

  // 🚪 處理登出：重置所有狀態，安全退回到最初的 Login 畫面
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedStudio(null);
    setCurrentTab('home');
  };

  // ==================== 🚪 門神判斷：若未登入，顯示身分選擇與登入註冊 ====================
  if (!currentUser) {
    return (
      <Login 
        onLogin={(user) => {
          // 接收來自 Login.jsx 的資料：{ name, phone, role, ... }
          setCurrentUser(user); 
        }} 
      />
    );
  }

  // ==================== ✂️ 身分分流：如果是美甲師後台 ====================
  if (currentUser.role === 'stylist') {
    return (
      <Dashboard 
        currentUser={currentUser} 
        onLogout={handleLogout} 
      />
    );
  }

  // ==================== 💅 身分分流：如果是消費者前台 ====================
  return (
    <div style={{ minHeight: '100vh', background: '#FFF0F2', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 頂部 Navbar */}
      <div style={{ 
        background: colors.primary, padding: '14px 20px', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>⭐</span> Nail Lab
        </div>
        
        <div style={{ fontSize: '14px', color: '#FFF0F2', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>👤 消費者前台：<strong style={{ color: '#fff' }}>{currentUser?.name || '會員'}</strong></span>
          
          {/* 右上角快捷登出按鈕 */}
          <button 
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', 
              padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
            }}
          >
            🚪 登出
          </button>
        </div>
      </div>

      {/* 橫條導覽列 */}
      <div style={{ 
        display: 'flex', justifyContent: 'center', gap: '40px', background: '#fff', 
        padding: '14px', borderBottom: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(86,10,12,0.02)'
      }}>
        <button onClick={() => setCurrentTab('home')} style={{ fontSize: '15px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', color: currentTab === 'home' ? colors.primary : '#666', borderBottom: currentTab === 'home' ? `2px solid ${colors.primary}` : '2px solid transparent', paddingBottom: '4px' }}>
          🧭 探索首頁
        </button>
        <button onClick={() => setCurrentTab('favorites')} style={{ fontSize: '15px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', color: currentTab === 'favorites' ? colors.primary : '#666', borderBottom: currentTab === 'favorites' ? `2px solid ${colors.primary}` : '2px solid transparent', paddingBottom: '4px' }}>
          ❤️ 我的收藏 <span style={{ background: favorites.length > 0 ? colors.primary : '#eee', color: favorites.length > 0 ? '#fff' : '#999', fontSize: '11px', padding: '2px 7px', borderRadius: '10px', marginLeft: '4px' }}>{favorites.length}</span>
        </button>
        <button onClick={() => setCurrentTab('profile')} style={{ fontSize: '15px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', color: currentTab === 'profile' ? colors.primary : '#666', borderBottom: currentTab === 'profile' ? `2px solid ${colors.primary}` : '2px solid transparent', paddingBottom: '4px' }}>
          👤 我的帳戶
        </button>
      </div>

      {/* 主要內容區 */}
      <div style={{ padding: '20px 0' }}>
        {currentTab === 'home' && (
          <Home 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
            onSelectStudio={handleSelectStudio} 
          />
        )}
        
        {currentTab === 'favorites' && (
          <Favorites 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
            onSelectStudio={handleSelectStudio} 
          />
        )}
        
        {currentTab === 'profile' && (
          <CustomerProfile currentUser={currentUser} onLogout={handleLogout} />
        )}

        {/* 詳情與日曆預約頁面 */}
        {currentTab === 'shop-detail' && selectedStudio && (
          <ShopDetail 
            studioName={selectedStudio.name}
            rules={`1. 預約請遲到不超過 15 分鐘，逾時自動取消。\n2. 現場操作不開放攜帶寵物與陪同者。\n3. 如需卸甲請於預約時提前備註。`}
            portfolioImages={[
              "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800",
              "https://images.unsplash.com/photo-1632345031435-8797b2d58045?w=800"
            ]}
            onBack={() => setCurrentTab('home')} 
            onSubmitBooking={handleBookingSubmit}
          />
        )}
      </div>

    </div>
  );
}