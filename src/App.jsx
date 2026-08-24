import React, { useState, useEffect } from 'react';
import { CalendarDays, Compass, Heart } from 'lucide-react';
import Home from './pages/Customer/Home';
import CustomerProfile from './pages/Customer/CustomerProfile';
import Favorites from './pages/Customer/Favorites';
import ShopDetail from './pages/Customer/ShopDetail';
import Login from './pages/Auth/Login'; // 🎯 引入妳的登入註冊頁面
import { DEFAULT_PORTFOLIO_IMAGES, fetchShops, getStudioDisplayName, parsePrice, supabase } from './lib/supabase';
import './App.css';

// 🎯 引入妳的美甲師後台管理頁面
import Dashboard from './pages/Stylist/Dashboard';

const colors = {
  primary: '#560A0C',
  secondary: '#A45D65',
  accent: '#CCA2A4',
  background: '#EAD4D6',
  gray: '#f8f9fa'
};

const demoAppointmentStorageKey = 'nail-lab-demo-appointments';
const pendingRoleStorageKey = 'nail-lab-pending-auth-role';
const demoUserStorageKey = 'nail-lab-demo-current-user';

function isLocalDemoUser(user) {
  return Boolean(
    user?.isLocalDemo ||
    (import.meta.env.DEV && [
      '8d02c359-38c4-4a6d-b4ba-7f9c44b32d2b',
      '53988bcc-0fd2-4b60-8af3-c51786275361'
    ].includes(user?.id))
  );
}

function readDemoAppointments() {
  try {
    return JSON.parse(window.localStorage.getItem(demoAppointmentStorageKey) || '[]');
  } catch {
    return [];
  }
}

function readStoredDemoUser() {
  try {
    const user = JSON.parse(window.localStorage.getItem(demoUserStorageKey) || 'null');
    return isLocalDemoUser(user) ? user : null;
  } catch {
    return null;
  }
}

function decodeBase64UrlJson(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = window.atob(padded);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function readLineCallbackUserFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const encodedUser = searchParams.get('line_demo_user') || hashParams.get('line_demo_user');
  if (!encodedUser) return null;

  try {
    const user = decodeBase64UrlJson(encodedUser);
    if (!isLocalDemoUser(user) || !user.role) return null;

    window.localStorage.setItem(demoUserStorageKey, JSON.stringify(user));
    window.localStorage.removeItem(pendingRoleStorageKey);
    window.history.replaceState({}, document.title, window.location.origin);
    return user;
  } catch (error) {
    console.error('Failed to read LINE callback user:', error);
    window.history.replaceState({}, document.title, window.location.origin);
    return null;
  }
}

function saveDemoAppointments(records) {
  window.localStorage.setItem(demoAppointmentStorageKey, JSON.stringify(records));
  window.dispatchEvent(new Event('nail-lab-demo-appointments-updated'));
}

function readStylistDemoData() {
  try {
    return JSON.parse(window.localStorage.getItem('nail-lab-demo-stylist-8d02c359-38c4-4a6d-b4ba-7f9c44b32d2b') || '{}');
  } catch {
    return {};
  }
}

async function createDefaultStylistShop(userId, studioName, location) {
  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .insert({
      owner_id: userId,
      studio_name: studioName,
      location: location || '台北市大安區',
      rules: '1. 預約請遲到不超過 15 分鐘，逾時自動取消。\n2. 現場操作不開放攜帶寵物與陪同者。\n3. 如需卸甲請於預約時提前備註。',
      tags: ['韓系', '貓眼'],
      image_text: ''
    })
    .select()
    .single();

  if (shopError || !shop?.id) return;

  await supabase.from('services').insert([
    { shop_id: shop.id, name: '經典單色美甲', price: 1200, duration: 60 },
    { shop_id: shop.id, name: '法式優雅彩繪', price: 1599, duration: 120 }
  ]);

  await supabase.from('portfolio_images').insert(
    DEFAULT_PORTFOLIO_IMAGES.map((imageUrl, index) => ({
      shop_id: shop.id,
      image_url: imageUrl,
      sort_order: index
    }))
  );
}

async function ensureProfileForSession(session) {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (existingProfile) return existingProfile;

  const pendingRole = window.localStorage.getItem(pendingRoleStorageKey);
  const role = pendingRole === 'stylist' ? 'stylist' : 'customer';
  const userMeta = session.user.user_metadata || {};
  const displayName = userMeta.full_name || userMeta.name || userMeta.display_name || session.user.email || 'Nail Lab 會員';
  const location = role === 'stylist' ? '台北市大安區' : null;

  const profile = {
    id: session.user.id,
    role,
    name: displayName,
    phone: session.user.email || '',
    location
  };

  const { data: createdProfile, error: profileError } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single();

  if (profileError) throw profileError;

  if (role === 'stylist') {
    await createDefaultStylistShop(session.user.id, displayName, location);
  }

  window.localStorage.removeItem(pendingRoleStorageKey);
  return createdProfile;
}

function buildCurrentUserFromProfile(profile, session) {
  const displayName = profile.role === 'stylist'
    ? getStudioDisplayName(profile.name)
    : profile.name;

  return {
    id: profile.id,
    name: displayName,
    phone: profile.phone || session.user.email,
    email: session.user.email,
    role: profile.role,
    location: profile.location || '',
    studioName: displayName
  };
}

export default function App() {
  // 👥 1. 登入狀態控制：初始預設為 null (未登入，會停留在身份選擇與登入註冊頁)
  const [currentUser, setCurrentUser] = useState(null);

  // 🧭 2. 消費者分頁狀態：'home', 'favorites', 'profile', 'shop-detail'
  const [currentTab, setCurrentTab] = useState('home');

  // 🎯 3. 紀錄目前消費者點選的是哪一家工作室的細節
  const [selectedStudio, setSelectedStudio] = useState(null);

  // 4. 全域收藏狀態
  const [favorites, setFavorites] = useState([]);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const lineCallbackUser = readLineCallbackUserFromUrl();
      if (lineCallbackUser) {
        setCurrentUser(lineCallbackUser);
        setIsCheckingSession(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const profile = await ensureProfileForSession(session);
          setCurrentUser(buildCurrentUserFromProfile(profile, session));
          window.localStorage.removeItem(demoUserStorageKey);
        } catch (error) {
          console.error('Failed to prepare auth profile:', error);
          await supabase.auth.signOut();
          setCurrentUser(null);
        }
      } else {
        const storedDemoUser = readStoredDemoUser();
        if (storedDemoUser) setCurrentUser(storedDemoUser);
      }
      setIsCheckingSession(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setCurrentUser(null);
        setIsCheckingSession(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadSession();
      }
    });

    loadSession();

    return () => authListener.subscription.unsubscribe();
  }, []);

  // 載入收藏狀態
  useEffect(() => {
    if (currentUser && currentUser.role === 'customer') {
      Promise.all([
        supabase
          .from('favorites')
          .select('shop_id')
          .eq('customer_id', currentUser.id),
        fetchShops()
      ])
        .then(([favoritesResult, shops]) => {
          if (favoritesResult.error) throw favoritesResult.error;
          const favoriteShopIds = new Set((favoritesResult.data || []).map(item => item.shop_id));
          setFavorites(shops.filter(shop => favoriteShopIds.has(shop.id)));
        })
        .catch(err => console.error('Failed to fetch favorites:', err));
    } else {
      setFavorites([]);
    }
  }, [currentUser]);

  // 愛心收藏切換
  const toggleFavorite = async (studio) => {
    if (!currentUser?.id) return;

    const isExist = favorites.some(item => item.id === studio.id);
    const updated = isExist ? favorites.filter(item => item.id !== studio.id) : [...favorites, studio];
    setFavorites(prev => {
      return updated;
    });

    const { error } = isExist
      ? await supabase.from('favorites').delete().eq('customer_id', currentUser.id).eq('shop_id', studio.id)
      : await supabase.from('favorites').insert({ customer_id: currentUser.id, shop_id: studio.id });

    if (error) {
      console.error('Failed to update favorites:', error);
      setFavorites(favorites);
    }
  };

  // 消費者點擊卡片跳轉至詳情頁
  const handleSelectStudio = (studio) => {
    const demoData = readStylistDemoData();
    const demoPortfolioImages = Array.isArray(demoData.portfolioImages) && demoData.portfolioImages.length > 0
      ? demoData.portfolioImages
      : null;
    setSelectedStudio({
      ...studio,
      name: demoData.studioName || studio.name,
      studioName: demoData.studioName || studio.studioName,
      rules: demoData.rules || studio.rules,
      portfolioImages: demoPortfolioImages || studio.portfolioImages || DEFAULT_PORTFOLIO_IMAGES,
      services: demoData.services || studio.services,
      schedule: demoData.schedule || studio.schedule,
      announcement: demoData.announcement || studio.announcement,
      cancellationPolicy: demoData.cancellationPolicy || studio.cancellationPolicy,
      paymentMethods: demoData.paymentMethods || studio.paymentMethods,
      address: demoData.address || studio.address || studio.location,
      depositSettings: demoData.depositSettings || studio.depositSettings
    });
    setCurrentTab('shop-detail');
  };

  // 🎯 詳情頁提交預約後的處理：所有資料寫入後端
  const handleBookingSubmit = async (bookingData) => {
    if (!selectedStudio?.id || !currentUser?.id || !bookingData?.serviceId) {
      alert('預約資料不完整，請重新選擇服務與時段。');
      return false;
    }

    try {
      if (isLocalDemoUser(currentUser)) {
        const id = `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const record = {
          id,
          shop_id: selectedStudio.id,
          customer_id: currentUser.id,
          customer_name: currentUser?.name || '會員',
          service_id: bookingData.serviceId,
          service_name: bookingData.service,
          duration_minutes: Number(bookingData.duration || 60),
          price: parsePrice(bookingData.price),
          deposit_amount: Number(bookingData.depositAmount || 0),
          remaining_amount: Number(bookingData.remainingAmount || 0),
          customer_note: bookingData.customerNote || '',
          style_request: bookingData.styleRequest || '',
          contact_info: bookingData.contactInfo || '',
          needs_removal: Boolean(bookingData.needsRemoval),
          allergy_note: bookingData.allergyNote || '',
          payment_method: bookingData.paymentMethod || '',
          appointment_date: bookingData.date,
          appointment_time: bookingData.time,
          status: bookingData.depositPaid ? 'paid' : 'pending',
          created_at: new Date().toISOString(),
          shops: { studio_name: selectedStudio.name }
        };

        saveDemoAppointments([record, ...readDemoAppointments()]);

        const bookingNumber = `NL-${id.slice(-8).toUpperCase()}`;
        alert(`訂金付款完成，預約申請已送出\n\n店家：${selectedStudio.name}\n項目：${bookingData.service}\n時間：${bookingData.date} ${bookingData.time}\n訂金：NT$${Number(bookingData.depositAmount || 0).toLocaleString()}\n單號：${bookingNumber}`);
        setCurrentTab('profile');
        return true;
      }

      const payload = {
        shop_id: selectedStudio.id,
        customer_id: currentUser.id,
        customer_name: currentUser?.name || '會員',
        service_id: bookingData.serviceId,
        service_name: bookingData.service,
        duration_minutes: Number(bookingData.duration || 60),
        price: parsePrice(bookingData.price),
        appointment_date: bookingData.date,
        appointment_time: bookingData.time,
        status: bookingData.depositPaid ? 'paid' : 'pending'
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;

      const bookingNumber = `NL-${data.id.slice(0, 8).toUpperCase()}`;
      alert(`訂金付款完成，預約申請已送出\n\n店家：${selectedStudio.name}\n項目：${bookingData.service}\n時間：${bookingData.date} ${bookingData.time}\n訂金：NT$${Number(bookingData.depositAmount || 0).toLocaleString()}\n單號：${bookingNumber}`);
      setCurrentTab('profile');
      return true;
    } catch (err) {
      console.error('Failed to post booking to backend:', err);
      const message = String(err?.message || '');
      if (message.includes('APPOINTMENT_TIME_CONFLICT')) {
        alert('這個時段剛剛已被預約，請選擇其他時間。');
      } else if (message.includes('duration_minutes') || message.includes('service_id')) {
        alert('預約系統尚未完成資料庫升級，請先套用 booking_workflow.sql。');
      } else {
        alert(`預約送出失敗：${message || '請稍後再試。'}`);
      }
      return false;
    }
  };

  // 處理登出：重置所有狀態，安全退回到最初的 Login 畫面
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Failed to sign out:', error);
      alert(`登出失敗：${error.message || '請稍後再試。'}`);
      return false;
    }

    setCurrentUser(null);
    setSelectedStudio(null);
    setFavorites([]);
    setCurrentTab('home');
    window.localStorage.removeItem(demoUserStorageKey);
    return true;
  };

  // ==================== 門神判斷：若未登入，顯示身分選擇與登入註冊 ====================
  if (isCheckingSession) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FFF0F2', color: colors.primary, fontWeight: 'bold' }}>正在確認登入狀態...</div>;
  }

  if (!currentUser) {
    return (
      <Login
        isPasswordRecovery={isPasswordRecovery}
        onRecoveryComplete={() => setIsPasswordRecovery(false)}
        onLogin={(user) => {
          // 接收來自 Login.jsx 的資料：{ name, phone, role, ... }
          if (isLocalDemoUser(user)) {
            window.localStorage.setItem(demoUserStorageKey, JSON.stringify(user));
          } else {
            window.localStorage.removeItem(demoUserStorageKey);
          }
          setCurrentUser(user);
        }}
      />
    );
  }

  // ==================== 身分分流：如果是美甲師後台 ====================
  if (currentUser.role === 'stylist') {
    return (
      <Dashboard
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  // ==================== 身分分流：如果是消費者前台 ====================
  return (
    <div className="customer-shell">
      <header className="customer-header">
        <button className="brand-button" type="button" onClick={() => setCurrentTab('home')} aria-label="回到 Nail Lab 首頁">
          <img className="brand-mark" src="/nail-lab-logo.png" alt="" />
          <span>Nail Lab</span>
        </button>

        <nav className="customer-nav customer-nav-desktop" aria-label="消費者導覽">
          <button className={currentTab === 'home' || currentTab === 'shop-detail' ? 'active' : ''} onClick={() => setCurrentTab('home')}>
            <Compass aria-hidden="true" />
            <span>探索</span>
          </button>
          <button className={currentTab === 'favorites' ? 'active' : ''} onClick={() => setCurrentTab('favorites')}>
            <Heart aria-hidden="true" />
            <span>收藏{favorites.length > 0 ? ` ${favorites.length}` : ''}</span>
          </button>
          <button className={currentTab === 'profile' ? 'active' : ''} onClick={() => setCurrentTab('profile')}>
            <CalendarDays aria-hidden="true" />
            <span>預約</span>
          </button>
        </nav>

        <div className="account-menu">
          <span>{currentUser?.name || '會員'}</span>
          <button type="button" onClick={handleLogout}>登出</button>
        </div>
      </header>

      <nav className="customer-nav customer-nav-mobile mobile-dock-nav" aria-label="消費者手機導覽">
        <button className={currentTab === 'home' || currentTab === 'shop-detail' ? 'active' : ''} onClick={() => setCurrentTab('home')}>
          <Compass aria-hidden="true" />
          <span>探索</span>
        </button>
        <button className={currentTab === 'favorites' ? 'active' : ''} onClick={() => setCurrentTab('favorites')}>
          <Heart aria-hidden="true" />
          <span>收藏{favorites.length > 0 ? ` ${favorites.length}` : ''}</span>
        </button>
        <button className={currentTab === 'profile' ? 'active' : ''} onClick={() => setCurrentTab('profile')}>
          <CalendarDays aria-hidden="true" />
          <span>預約</span>
        </button>
      </nav>

      <main className={currentTab === 'shop-detail' ? 'customer-main detail-main' : 'customer-main'}>
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
            studio={selectedStudio}
            onBack={() => setCurrentTab('home')}
            onSubmitBooking={handleBookingSubmit}
          />
        )}
      </main>
    </div>
  );
}
