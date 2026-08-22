import React, { useState, useEffect } from 'react';
import { dateFromToday, supabase } from '../../lib/supabase';

const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  gray: '#f8f9fa'
};

// 全台灣 22 縣市美甲預約完整資料庫
const regionData = {
  '台北市': ['大安區', '中山區', '信義區', '萬華區(西門町)', '中正區', '松山區', '內湖區', '士林區', '北投區', '文山區', '大同區', '南港區'],
  '新北市': ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '土城區', '淡水區', '蘆洲區', '汐止區', '樹林區', '三峽區', '林口區', '五股區', '鶯歌區'],
  '基隆市': ['仁愛區', '信義區', '中正區', '中山區', '安樂區', '七堵區', '暖暖區'],
  '桃園市': ['桃園區', '中壢區', '蘆竹區(南崁)', '龜山區', '八德區', '平鎮區', '楊梅區', '龍潭區', '大溪區', '大園區'],
  '新竹市': ['東區', '北區', '香山區'],
  '新竹縣': ['竹北市', '竹東鎮', '新埔鎮', '新豐鄉', '湖口鄉'],
  '苗栗縣': ['頭份市', '苗栗市', '竹南鎮', '後龍鎮', '苑裡鎮'],
  '台中市': ['西屯區(逢甲)', '北區(一中)', '西區(勤美)', '南屯區', '北屯區', '大里區', '豐原區', '太平區', '東區', '南區', '沙鹿區', '清水區', '潭子區'],
  '彰化縣': ['彰化市', '員林市', '鹿港鎮', '和美鎮', '溪湖鎮', '二林鎮'],
  '南投縣': ['南投市', '草屯鎮', '埔里鎮', '竹山鎮'],
  '雲林縣': ['斗六市', '虎尾鎮', '西螺鎮', '斗南鎮', '麥寮鄉'],
  '嘉義市': ['西區', '東區'],
  '嘉義縣': ['太保市', '朴子市', '民雄鄉', '水上鄉', '中埔鄉'],
  '台南市': ['永康區', '東區', '中西區', '北區', '安平區', '南區', '安南區', '新營區', '仁德區', '歸仁區', '善化區', '新市區'],
  '高雄市': ['左營區', '三民區', '新興區(新堀江)', '苓雅區', '前鎮區', '鳳山區', '鼓山區(美術館)', '楠梓區', '小港區', '仁武區', '岡山區', '旗山區'],
  '屏東縣': ['屏東市', '潮州鎮', '東港鎮', '恆春鎮'],
  '宜蘭縣': ['宜蘭市', '羅東鎮', '礁溪鄉', '頭城鎮', '蘇澳鎮'],
  '花蓮縣': ['花蓮市', '吉安鄉', '新城鄉', '玉里鎮'],
  '台東縣': ['台東市', '卑南鄉', '成功鎮'],
  '澎湖縣': ['馬公市', '湖西鄉'],
  '金門縣': ['金城鎮', '金湖鎮', '金沙鎮'],
  '連江縣(馬祖)': ['南竿鄉', '北竿鄉']
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailAccount = (value) => emailRegex.test(value.trim());
const pendingRoleStorageKey = 'nail-lab-pending-auth-role';
const lineAuthStartUrl = import.meta.env.VITE_LINE_AUTH_START_URL || 'http://localhost:5001/api/auth/line/start';

const localDemoUsers = {
  customer: {
    id: '53988bcc-0fd2-4b60-8af3-c51786275361',
    name: 'nita',
    phone: 'ccyy940120@gmail.com',
    email: 'ccyy940120@gmail.com',
    role: 'customer',
    location: '',
    studioName: '',
    isLocalDemo: true
  },
  stylist: {
    id: '8d02c359-38c4-4a6d-b4ba-7f9c44b32d2b',
    name: 'yyc nail',
    phone: 'demo-stylist@gmail.com',
    email: 'demo-stylist@gmail.com',
    role: 'stylist',
    location: '台北市大安區',
    studioName: 'yyc nail',
    isLocalDemo: true
  }
};

const getErrorMessage = (error, fallback = '請稍後再試。') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  const message = error.message || error.error_description || error.details || error.hint;
  if (message) return message;

  try {
    const serialized = JSON.stringify(error);
    if (serialized && serialized !== '{}') return serialized;
  } catch {
    // Keep the friendly fallback when the error cannot be serialized.
  }

  return fallback;
};

const getSignupErrorMessage = (error) => {
  const message = getErrorMessage(error, '');
  const lowerMessage = message.toLowerCase();

  if (!message || message === '{}') {
    return '註冊失敗：目前寄信服務沒有回傳明確錯誤，請先確認 Resend API key、Sender email 是否已驗證，並到 Supabase 儲存 SMTP 設定。';
  }

  if (lowerMessage.includes('rate limit')) {
    return '註冊失敗：Email 寄送次數暫時超過限制，請稍後再試，或確認 Custom SMTP 是否已正確啟用。';
  }

  if (
    lowerMessage.includes('smtp') ||
    lowerMessage.includes('sender') ||
    lowerMessage.includes('from') ||
    lowerMessage.includes('email provider')
  ) {
    return `註冊失敗：寄信設定可能還沒完成。請確認 Resend Sender email 已驗證、API key 正確，Supabase SMTP 已儲存。原始訊息：${message}`;
  }

  return `註冊失敗：${message}`;
};

const getOAuthCallbackError = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const lineError = searchParams.get('line_error') || hashParams.get('line_error');
  const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');
  const errorCode = searchParams.get('error_code') || hashParams.get('error_code');

  if (lineError) {
    const messages = {
      missing_line_secret: 'LINE 登入還沒完成：請先把 LINE Channel Secret 放到 server/.env，並重新啟動後端。',
      invalid_line_state: 'LINE 登入逾時或來源不一致，請重新按一次 LINE 登入。',
      expired_line_state: 'LINE 登入等待太久，請重新按一次 LINE 登入。',
      missing_line_code: 'LINE 沒有回傳登入授權碼，請重新按一次 LINE 登入。',
      line_token_exchange_failed: 'LINE 登入失敗：後端無法用授權碼換取 LINE 登入資料，請確認 Channel ID、Channel Secret 與 Callback URL。',
      line_profile_failed: 'LINE 登入失敗：後端無法讀取 LINE 個人資料，請確認 LINE Login channel 已啟用。'
    };

    return messages[lineError] || `LINE 登入失敗：${lineError}`;
  }

  if (!errorDescription && !errorCode) return '';

  if (errorDescription?.includes('Error getting user profile from external provider')) {
    return 'LINE 登入回傳失敗：Supabase 目前無法讀取 LINE 個人資料。請先確認 LINE provider 的 Client Secret、Scopes 與「允許無 Email 使用者」設定。';
  }

  return `LINE 登入回傳失敗：${errorDescription || errorCode}`;
};

export default function Login({ onLogin, isPasswordRecovery = false, onRecoveryComplete }) {
  // 🧭 內部流程控管
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('customer'); 
  const [isRegister, setIsRegister] = useState(false);         
  
  // 表單輸入狀態
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryPasswordConfirm, setRecoveryPasswordConfirm] = useState('');
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  // 🔮 雙層地區連動狀態
  const [selectedCity, setSelectedCity] = useState('台北市'); 
  const [selectedDistrict, setSelectedDistrict] = useState('大安區'); 

  // 🎯 重置所有欄位狀態
  useEffect(() => {
    setAccount('');
    setPassword('');
    setName('');
    setFormMessage('');
  }, [isRegister, step]);

  useEffect(() => {
    const callbackError = getOAuthCallbackError();
    if (!callbackError) return;

    const pendingRole = window.localStorage.getItem(pendingRoleStorageKey);
    if (pendingRole === 'customer' || pendingRole === 'stylist') {
      setSelectedRole(pendingRole);
    }

    setStep(2);
    setFormMessage(callbackError);
    window.history.replaceState({}, document.title, window.location.origin);
  }, []);

  // 當使用者切換「縣市」時，自動把「行政區」重設為該縣市的第一個選項
  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setSelectedDistrict(regionData[city][0]); 
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setStep(2); 
  };

  const handleDemoLogin = () => {
    onLogin(localDemoUsers[selectedRole]);
  };

  const handleLineLogin = async () => {
    setFormMessage('');
    window.localStorage.setItem(pendingRoleStorageKey, selectedRole);

    const url = new URL(lineAuthStartUrl);
    url.searchParams.set('role', selectedRole);
    url.searchParams.set('returnTo', window.location.origin);
    window.location.href = url.toString();
  };

  const showMessage = (message) => {
    setFormMessage(message);
    alert(message);
  };

  const handleForgotPassword = async () => {
    if (!isEmailAccount(account)) {
      showMessage('請先輸入美甲師帳號的 Email。');
      return;
    }

    setIsSendingRecovery(true);
    const { error } = await supabase.auth.resetPasswordForEmail(account.trim(), {
      redirectTo: window.location.origin
    });
    setIsSendingRecovery(false);

    if (error) {
      showMessage(`無法寄出重設密碼信：${getErrorMessage(error)}`);
      return;
    }

    showMessage('重設密碼信已寄出，請到信箱點擊連結，再回到 Nail Lab 設定新密碼。');
  };

  const handleRecoverySubmit = async (event) => {
    event.preventDefault();

    if (recoveryPassword.length < 8) {
      showMessage('新密碼至少需要 8 個字元。');
      return;
    }

    if (recoveryPassword !== recoveryPasswordConfirm) {
      showMessage('兩次輸入的新密碼不一致。');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: recoveryPassword });
    if (error) {
      showMessage(`密碼更新失敗：${getErrorMessage(error)}`);
      return;
    }

    await supabase.auth.signOut();
    setRecoveryPassword('');
    setRecoveryPasswordConfirm('');
    onRecoveryComplete?.();
    showMessage('密碼已更新，請使用新密碼登入。');
  };

  // 送出表單時進行必填欄位檢查
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 登入狀態下的必填防呆與資料傳遞
    if (!isRegister) {
      if (!account.trim()) {
        showMessage('請輸入 Email！');
        return;
      }

      if (!isEmailAccount(account)) {
        showMessage('請輸入正確的 Email 格式。');
        return;
      }

      if (!password.trim()) {
        showMessage('請輸入密碼！');
        return;
      }
      
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: account.trim(),
          password: password.trim()
        });

        if (authError) {
          showMessage(`登入失敗：${getErrorMessage(authError, '請檢查帳密或身分')}`);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profileError || !profile) {
          showMessage('找不到會員資料，請確認是否已完成註冊。');
          return;
        }

        if (profile.role !== selectedRole) {
          await supabase.auth.signOut();
          showMessage('登入身分不符合，請重新選擇消費者或美甲師。');
          return;
        }

        onLogin({
          id: profile.id,
          name: profile.name,
          phone: profile.phone || authData.user.email,
          email: authData.user.email,
          role: profile.role,
          location: profile.location || '',
          studioName: profile.name
        });
      } catch (err) {
        console.error('Login error:', err);
        showMessage('系統錯誤，請稍後再試。');
      }
      return;
    }

    // 2. 註冊狀態下的必填防呆（區分身份）
    if (isRegister) {
      const inputAccount = account.trim();
      const accountIsEmail = isEmailAccount(inputAccount);

      if (!name.trim()) {
        const errorMsg = selectedRole === 'stylist' ? '請填寫沙龍 / 工作室名稱！' : '請填寫您的姓名 / 暱稱！';
        showMessage(errorMsg);
        return;
      }

      if (selectedRole === 'stylist' && (!selectedCity || !selectedDistrict)) {
        showMessage('請選擇完整的經營/服務地區！');
        return;
      }

      if (!accountIsEmail) {
        showMessage('請輸入正確的 Email 格式。');
        return;
      }

      if (!password.trim()) {
        showMessage('請設定您的密碼！');
        return;
      }

      const fullLocation = `${selectedCity}${selectedDistrict}`;

      try {
        let { data: authData, error: authError } = await supabase.auth.signUp({
          email: inputAccount,
          password: password.trim(),
          options: {
            data: {
              name: name.trim(),
              role: selectedRole,
              location: selectedRole === 'stylist' ? fullLocation : null
            }
          }
        });

        if (authError) {
          showMessage(getSignupErrorMessage(authError));
          return;
        }

        if (!authData.session) {
          showMessage('註冊信已送出。請到 Email 信箱點擊確認連結，完成後再回來用 Email + 密碼登入。');
          setIsRegister(false);
          return;
        }

        const profile = {
          id: authData.user.id,
          name: name.trim(),
          phone: inputAccount,
          role: selectedRole,
          location: selectedRole === 'stylist' ? fullLocation : null
        };

        const { error: profileError } = await supabase.from('profiles').upsert(profile);
        if (profileError) {
          showMessage(`會員資料建立失敗：${getErrorMessage(profileError)}`);
          return;
        }

        if (selectedRole === 'stylist') {
          const { data: shop, error: shopError } = await supabase
            .from('shops')
            .insert({
              owner_id: authData.user.id,
              studio_name: name.trim(),
              location: fullLocation,
              rules: '1. 預約請遲到不超過 15 分鐘，逾時自動取消。\n2. 現場操作不開放攜帶寵物與陪同者。\n3. 如需卸甲請於預約時提前備註。',
              tags: ['韓系', '貓眼'],
              image_text: ''
            })
            .select()
            .single();

          if (shopError) {
            showMessage(`工作室建立失敗：${getErrorMessage(shopError)}`);
            return;
          }

          await supabase.from('services').insert([
            { shop_id: shop.id, name: '經典單色美甲', price: 1200, duration: 60 },
            { shop_id: shop.id, name: '法式優雅彩繪', price: 1599, duration: 120 }
          ]);

          await supabase.from('schedules').insert([
            { shop_id: shop.id, work_date: dateFromToday(1), time_slots: ['09:00', '10:00', '11:00'] },
            { shop_id: shop.id, work_date: dateFromToday(2), time_slots: ['14:00', '15:00'] },
            { shop_id: shop.id, work_date: dateFromToday(3), time_slots: ['10:00', '13:00', '16:00'] }
          ]);

          await supabase.from('portfolio_images').insert([
            { shop_id: shop.id, image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800', sort_order: 0 },
            { shop_id: shop.id, image_url: 'https://i0.wp.com/greenweddingshoes.com/wp-content/uploads/2025/07/3D-mermaid-beach-nail-ideas-for-2025-ocean-vacation.jpg?fit=1024%2C9999', sort_order: 1 }
          ]);

          showMessage(`美甲師註冊成功！\n工作室：${name}\n服務地區：${fullLocation}\n系統已自動為您登入後台。`);
        } else {
          showMessage(`消費者註冊成功！已為您自動登入。`);
        }

        onLogin({
          id: profile.id,
          name: profile.name,
          phone: profile.phone,
          email: authData.user.email || '',
          role: profile.role,
          location: profile.location || '',
          studioName: profile.name
        });
      } catch (err) {
        console.error('Registration error:', err);
        showMessage(`系統錯誤：${getErrorMessage(err)}`);
      }
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setIsRegister(false);
  };

  return (
    <div style={{ 
      width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: step === 1
        ? 'linear-gradient(180deg, rgba(20,20,20,0.16), rgba(12,12,12,0.48)), url("/login-tools-background.png") center / cover'
        : 'linear-gradient(180deg, rgba(128,84,76,0.38), rgba(36,25,24,0.78)), url("https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1800&auto=format&fit=crop&q=80") center / cover',
      padding: '16px', boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      
      {/* 🔮 注入 RWD 排版控制與防擠壓機制 */}
      <style>{`
        .login-card {
          max-width: 450px; 
          width: 100%; 
          background: rgba(42, 31, 29, 0.58);
          border: 1px solid rgba(255, 248, 245, 0.28);
          border-radius: 34px; 
          padding: 35px 24px 25px 24px; 
          box-shadow: 0 32px 90px rgba(22, 15, 15, 0.32);
          backdrop-filter: blur(28px);
          box-sizing: border-box;
        }
        .login-card h2,
        .login-card label,
        .login-card div {
          color: rgba(255, 248, 245, 0.92);
        }
        .login-card input,
        .login-card select {
          border-color: rgba(255, 248, 245, 0.28) !important;
          background: rgba(255, 248, 245, 0.14) !important;
          color: #fff8f5 !important;
        }
        .login-card input::placeholder {
          color: rgba(255, 248, 245, 0.54);
        }
        .login-card button[type="submit"] {
          background: #fff8f2 !important;
          color: #560A0C !important;
          box-shadow: 0 18px 38px rgba(22, 15, 15, 0.22) !important;
        }
        .line-login-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 16px;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 248, 245, 0.88);
          color: #560A0C;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 16px 32px rgba(86, 10, 12, 0.18);
        }
        .line-login-mark {
          display: grid;
          width: 24px;
          height: 24px;
          place-items: center;
          border-radius: 999px;
          background: #560A0C;
          color: #fff8f5;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 4px 0;
          color: rgba(255, 248, 245, 0.64);
          font-size: 12px;
          font-weight: 750;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 248, 245, 0.22);
        }
        .demo-login-button {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid rgba(255, 248, 245, 0.32);
          border-radius: 999px;
          background: rgba(255, 248, 245, 0.12);
          color: #fff8f5;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
        }
        .login-card.role-selection {
          max-width: 660px;
          padding: 18px 0 0;
          background: transparent;
          border: 0;
          border-radius: 0;
          box-shadow: none;
          backdrop-filter: none;
        }
        .role-box-container {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin: 28px 0 24px;
        }
        .role-choice {
          min-height: 190px;
          padding: 24px 38px;
          border: 0;
          background: transparent;
          color: #fff8f5;
          cursor: pointer;
          transition: transform 180ms ease, color 180ms ease;
          font: inherit;
        }
        .role-choice + .role-choice {
          border-left: 1px solid rgba(255, 248, 245, 0.42);
        }
        .role-choice:hover,
        .role-choice:focus-visible {
          transform: translateY(-5px);
          color: #ffffff;
          outline: none;
        }
        .role-choice-title {
          display: block;
          margin-bottom: 10px;
          font-size: 26px;
          font-weight: 700;
        }
        .role-choice-description {
          display: block;
          color: rgba(255, 248, 245, 0.7);
          font-size: 13px;
        }
        .role-selection-title,
        .role-selection-hint {
          color: #fff8f5 !important;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.34);
        }
        @media (max-width: 400px) {
          .login-card {
            padding: 24px 16px 20px 16px;
            border-radius: 16px;
          }
          .login-card.role-selection {
            padding: 8px 0 0;
          }
          .role-box-container {
            grid-template-columns: 1fr;
            margin: 20px 0;
          }
          .role-choice {
            min-height: 128px;
            padding: 18px 28px;
          }
          .role-choice-title {
            font-size: 23px;
          }
          .role-choice + .role-choice {
            border-top: 1px solid rgba(255, 248, 245, 0.42);
            border-left: 0;
          }
        }
      `}</style>

      {/* 返回前一步按鈕 */}
      {step === 2 && (
        <button 
          type="button"
          onClick={handleBackToStep1}
          style={{ 
            position: 'absolute', top: '24px', left: '24px', background: '#fff', border: `1px solid ${colors.accent}`, 
            padding: '8px 14px', borderRadius: '20px', fontSize: '13px', color: colors.primary, fontWeight: 'bold', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
            zIndex: 10
          }}
        >
          重新選擇身份
        </button>
      )}

      {/* 頂部標題區 */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', margin: '0 0 4px 0', color: '#fff8f5', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <img
            src="/nail-lab-logo.png"
            alt="Nail Lab Logo"
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          Nail Lab
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,248,245,0.74)', margin: 0, letterSpacing: '2px', fontWeight: '500' }}>專業美甲預約管理平台</p>
      </div>

      <div className={`login-card${!isPasswordRecovery && step === 1 ? ' role-selection' : ''}`}>
        {isPasswordRecovery && (
          <div>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', background: colors.background, color: colors.primary, padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                帳號安全
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', margin: '8px 0 0 0' }}>
                設定新密碼
              </h2>
            </div>

            <form onSubmit={handleRecoverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' }}>新密碼 *</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="至少 8 個字元"
                  value={recoveryPassword}
                  onChange={(event) => setRecoveryPassword(event.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' }}>再次輸入新密碼 *</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="再次輸入新密碼"
                  value={recoveryPasswordConfirm}
                  onChange={(event) => setRecoveryPasswordConfirm(event.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: colors.primary, color: '#fff', border: 'none', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                儲存新密碼
              </button>
            </form>
          </div>
        )}
        
        {/* ================= 階段 1：選擇身份 ================= */}
        {!isPasswordRecovery && step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <h2 className="role-selection-title" style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>選擇你的身份</h2>
            
            <div className="role-box-container">
              {/* 消費者選項 */}
              <button
                type="button"
                className="role-choice"
                onClick={() => handleSelectRole('customer')}
              >
                <span className="role-choice-title">消費者</span>
                <span className="role-choice-description">探索店家並預約美甲服務</span>
              </button>

              {/* 美甲師選項 */}
              <button
                type="button"
                className="role-choice"
                onClick={() => handleSelectRole('stylist')}
              >
                <span className="role-choice-title">美甲師</span>
                <span className="role-choice-description">管理服務、班表與顧客預約</span>
              </button>
            </div>
            <p className="role-selection-hint" style={{ fontSize: '12px', margin: 0 }}>選擇身份後即可繼續</p>
          </div>
        )}

        {/* ================= 階段 2：LINE 登入 ================= */}
        {!isPasswordRecovery && step === 2 && (
          <div>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', background: colors.background, color: colors.primary, padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                {selectedRole === 'stylist' ? '美甲師端' : '消費者端'}
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff8f5', margin: '8px 0 0 0' }}>
                LINE 登入
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button type="button" className="line-login-button" onClick={handleLineLogin}>
                <span className="line-login-mark">LINE</span>
                使用 LINE 登入 / 綁定
              </button>

              {import.meta.env.DEV && (
                <button type="button" className="demo-login-button" onClick={handleDemoLogin}>
                  本機展示模式直接進入
                </button>
              )}

              {formMessage && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: formMessage.includes('成功') || formMessage.includes('已寄出') ? '#eef8f0' : '#fff5f5',
                  color: formMessage.includes('成功') || formMessage.includes('已寄出') ? '#226b35' : colors.primary,
                  border: `1px solid ${formMessage.includes('成功') || formMessage.includes('已寄出') ? '#c9e9d0' : '#f0c8cc'}`,
                  fontSize: '12px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line'
                }}>
                  {formMessage}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
