import React, { useState, useEffect } from 'react';
import { Check, CircleDollarSign, Clock3, Home } from 'lucide-react';
import { RestBlockModal } from './ScheduleCalendar';

const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  gray: '#f8f9fa'
};

const fallbackPortfolioImage = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800';

function SettingIcon({ type, fallback }) {
  const icons = {
    home: Home,
    clock: Clock3,
    check: Check,
    dollar: CircleDollarSign
  };
  const Icon = icons[type];
  if (Icon) return <Icon aria-hidden="true" />;

  if (type === 'bell') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8.5a6 6 0 0 0-12 0c0 6-2.5 7-2.5 7h17S18 14.5 18 8.5" />
        <path d="M9.8 19a2.4 2.4 0 0 0 4.4 0" />
      </svg>
    );
  }

  if (type === 'user') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 19c1.25-3.15 3.45-4.7 6.5-4.7s5.25 1.55 6.5 4.7" />
      </svg>
    );
  }

  return fallback;
}

// 🎯 解構接收來自 App.jsx 的全域狀態與更新函式，達成同步核心連動
export default function StylistPortfolio({ 
  currentUser, 
  studioName, 
  setStudioName, 
  rules, 
  setRules, 
  portfolioImages, 
  setPortfolioImages,
  announcement,
  setAnnouncement,
  cancellationPolicy,
  setCancellationPolicy,
  paymentMethods,
  setPaymentMethods,
  address,
  setAddress,
  depositSettings,
  setDepositSettings,
  onSaveShop,
  onCreateRestDates
}) {
  // 控制設定首頁、編輯表單與預覽頁籤
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const policyStorageKey = `nail-lab-booking-policy-${currentUser?.id || 'guest'}`;
  const [bookingPolicy, setBookingPolicy] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        requireApproval: true,
        allowMultipleServices: true,
        cancelHours: 24,
        fields: { phone: 'required', birthday: 'hidden', gender: 'hidden', styleNote: 'optional', removal: 'required', contact: 'required' }
      };
    }

    try {
      const saved = JSON.parse(window.localStorage.getItem(policyStorageKey) || '{}');
      return {
        requireApproval: saved.requireApproval ?? true,
        allowMultipleServices: saved.allowMultipleServices ?? true,
        cancelHours: saved.cancelHours ?? 24,
        fields: {
          phone: saved.fields?.phone || 'required',
          birthday: saved.fields?.birthday || 'hidden',
          gender: saved.fields?.gender || 'hidden',
          styleNote: saved.fields?.styleNote || 'optional',
          removal: saved.fields?.removal || 'required',
          contact: saved.fields?.contact || 'required'
        }
      };
    } catch {
      return {
        requireApproval: true,
        allowMultipleServices: true,
        cancelHours: 24,
        fields: { phone: 'required', birthday: 'hidden', gender: 'hidden', styleNote: 'optional', removal: 'required', contact: 'required' }
      };
    }
  });
  const depositStorageKey = `nail-lab-deposit-policy-${currentUser?.id || 'guest'}`;
  const [depositPolicy, setDepositPolicy] = useState(() => {
    const defaults = {
      enabled: depositSettings?.enabled !== false,
      type: depositSettings?.type || 'percent',
      value: depositSettings?.value ?? 30,
      freeCancelHours: depositSettings?.refundHours ?? 24,
      paymentInfo: paymentMethods || '銀行轉帳\n銀行：008 華南銀行\n戶名：yyc nail\n帳號：123-456-789012',
      unpaidHoldHours: 24,
      overdueAction: 'notify',
      multiServiceMode: 'sum'
    };

    if (typeof window === 'undefined') return defaults;

    try {
      return { ...defaults, ...JSON.parse(window.localStorage.getItem(depositStorageKey) || '{}') };
    } catch {
      return defaults;
    }
  });

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

  // 核心功能：處理本地實體照片上傳，直接存入全域陣列
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

  const updatePolicyField = (field, value) => {
    setBookingPolicy(prev => ({
      ...prev,
      fields: { ...prev.fields, [field]: value }
    }));
  };

  const saveBookingPolicy = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(policyStorageKey, JSON.stringify(bookingPolicy));
    }
    alert('接單政策已儲存。');
  };

  const saveDepositPolicy = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(depositStorageKey, JSON.stringify(depositPolicy));
    }
    setDepositSettings({
      ...depositSettings,
      enabled: depositPolicy.enabled,
      type: depositPolicy.type,
      value: Number(depositPolicy.value || 0),
      refundHours: Number(depositPolicy.freeCancelHours || 0),
      unpaidHoldHours: Number(depositPolicy.unpaidHoldHours || 0),
      overdueAction: depositPolicy.overdueAction,
      multiServiceMode: depositPolicy.multiServiceMode
    });
    setPaymentMethods(depositPolicy.paymentInfo);
    alert('訂金規則已儲存。');
  };

  const settingsItems = [
    { id: 'edit', iconType: 'home', icon: '⌂', title: '店鋪資訊', desc: '店名、地址、公告與預約須知', note: '更新顧客看到的店家內容' },
    { id: 'calendar', iconType: 'clock', icon: '◷', title: '預約時段', desc: '營業時段、休息日與可約時間', note: '管理顧客可以選的日期' },
    { id: 'policy', iconType: 'check', icon: '✓', title: '接單規則', desc: '審核方式、表單欄位與取消時間', note: '決定預約送出後怎麼處理' },
    { id: 'deposit', iconType: 'dollar', icon: '$', title: '訂金付款', desc: '訂金金額、退款時間與收款資訊', note: '設定預約前需支付的費用' }
  ];

  return (
    <div style={{ background: 'transparent', borderRadius: '16px', padding: '0', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 🔮 注入 RWD 安全排版與上傳按鈕美化樣式 */}
      <style>{`
        .edit-grid {
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
          gap: 24px; 
          background: rgba(255, 244, 246, 0.86); 
          padding: 24px; 
          border-radius: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
        }
        .edit-grid h3 {
          color: #21191a !important;
          font-size: 20px !important;
          font-weight: 900 !important;
          letter-spacing: 0 !important;
        }
        .edit-grid label {
          color: #5f5254 !important;
          font-size: 14px !important;
          font-weight: 750 !important;
          letter-spacing: 0 !important;
        }
        .edit-grid input,
        .edit-grid textarea {
          font-family: inherit !important;
          font-size: 15px !important;
          line-height: 1.55 !important;
          color: #2a2324 !important;
          font-weight: 650 !important;
          border-color: rgba(204, 162, 164, 0.62) !important;
          background: rgba(255, 255, 255, 0.88) !important;
        }
        .edit-grid input {
          min-height: 46px;
        }
        .edit-grid textarea {
          resize: vertical;
        }

        .settings-shell {
          display: grid;
          grid-template-columns: 210px minmax(0, 820px);
          justify-content: center;
          gap: 34px;
          min-height: 650px;
        }
        .settings-sidebar {
          align-self: start;
          margin-top: 62px;
          padding: 16px;
          border: 1px solid rgba(204, 162, 164, 0.34);
          border-radius: 26px;
          background: rgba(255, 244, 246, 0.18);
          backdrop-filter: blur(18px);
        }
        .settings-sidebar-title {
          margin: 0 0 14px 0;
          color: #2a2324;
          font-size: 12px;
          font-weight: 850;
          text-align: left;
          letter-spacing: 0.14em;
        }
        .settings-side-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          min-height: 46px;
          margin-bottom: 8px;
          padding: 0 12px;
          border: 0;
          border-radius: 16px;
          background: transparent;
          color: #4b3e40;
          font-size: 14px;
          font-weight: 800;
          text-align: left;
          cursor: pointer;
        }
        .settings-side-item.active,
        .settings-side-item:hover {
          background: rgba(255, 244, 246, 0.72);
          color: ${colors.primary};
        }
        .settings-icon {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border-radius: 13px;
          background: rgba(255, 244, 246, 0.52);
          color: ${colors.primary};
          font-size: 17px;
          font-weight: 900;
        }
        .settings-icon svg {
          width: 21px;
          height: 21px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .settings-main {
          padding-top: 48px;
        }
        .settings-main h2 {
          margin: 0;
          color: #222;
          font-size: 28px;
          letter-spacing: 0;
        }
        .settings-overview-head {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 18px;
          margin-bottom: 22px;
          text-align: left;
        }
        .settings-overview-head p {
          margin: 8px 0 0 0;
          color: #4f4446;
          font-size: 14px;
          font-weight: 650;
          line-height: 1.6;
        }
        .settings-status-pill {
          border: 1px solid rgba(204, 162, 164, 0.52);
          border-radius: 999px;
          padding: 9px 14px;
          color: ${colors.primary};
          background: rgba(255, 244, 246, 0.44);
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }
        .settings-list-card {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .settings-row {
          position: relative;
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
          width: 100%;
          min-height: 150px;
          padding: 20px;
          border: 1px solid rgba(204, 162, 164, 0.46);
          border-radius: 24px;
          background: rgba(255, 244, 246, 0.42);
          color: #2a2324;
          text-align: left;
          box-shadow: 0 16px 34px rgba(86, 10, 12, 0.08);
          backdrop-filter: blur(16px);
          cursor: pointer;
        }
        .settings-row:hover {
          transform: translateY(-2px);
          background: rgba(255, 244, 246, 0.58);
          border-color: rgba(86, 10, 12, 0.34);
        }
        .settings-row strong {
          display: block;
          margin-bottom: 7px;
          font-size: 18px;
          color: #222;
        }
        .settings-row span {
          color: #5f5254;
          font-size: 14px;
          line-height: 1.55;
          font-weight: 650;
        }
        .settings-row small {
          display: block;
          margin-top: 16px;
          color: ${colors.primary};
          font-size: 12px;
          font-weight: 900;
        }
        .settings-chevron {
          position: absolute;
          right: 18px;
          bottom: 14px;
          color: ${colors.secondary};
          font-size: 25px;
        }
        .settings-panel {
          border: 1px solid ${colors.accent};
          border-radius: 16px;
          background: rgba(255, 244, 246, 0.9);
          padding: 20px;
        }
        .settings-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }
        .settings-panel-head h2 {
          margin: 0;
        }
        .time-settings-card {
          display: grid;
          gap: 18px;
          padding: 22px;
          border: 1px solid #F1DDE0;
          border-radius: 16px;
          background: rgba(255, 244, 246, 0.92);
        }
        .time-settings-card h3 {
          margin: 0;
          color: ${colors.primary};
          font-size: 20px;
        }
        .time-settings-card p {
          margin: 0;
          color: #7c6e70;
          font-size: 14px;
          line-height: 1.7;
        }
        .time-action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
        }
        .time-action-card {
          display: grid;
          gap: 8px;
          min-height: 118px;
          padding: 18px;
          border: 1px solid ${colors.accent};
          border-radius: 14px;
          background: white;
          color: #2a2324;
          text-align: left;
        }
        .time-action-card strong {
          color: #222;
          font-size: 16px;
        }
        .time-action-card span {
          color: #8b7f82;
          font-size: 13px;
          line-height: 1.5;
        }
        .time-action-card.primary {
          border-color: ${colors.primary};
          background: ${colors.primary};
          color: white;
        }
        .time-action-card.primary strong,
        .time-action-card.primary span {
          color: white;
        }
        .back-to-settings {
          border: 1px solid ${colors.accent};
          border-radius: 999px;
          background: #fff;
          color: ${colors.primary};
          padding: 8px 13px;
          font-weight: 850;
        }
        .policy-page {
          display: grid;
          gap: 22px;
        }
        .policy-intro {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
        }
        .policy-intro p,
        .policy-section p,
        .policy-card p,
        .field-copy {
          margin: 0;
          color: #5f5254;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 650;
        }
        .policy-save-chip {
          border: 0;
          border-radius: 999px;
          background: rgba(86, 10, 12, 0.1);
          color: ${colors.primary};
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }
        .policy-section {
          display: grid;
          gap: 14px;
          padding: 20px;
          border: 1px solid rgba(204, 162, 164, 0.68);
          border-radius: 18px;
          background: rgba(255, 244, 246, 0.9);
          box-shadow: 0 12px 30px rgba(86, 10, 12, 0.07);
          backdrop-filter: blur(18px);
        }
        .policy-section h3,
        .policy-card h4,
        .field-row strong {
          margin: 0;
          color: #21191a;
          letter-spacing: 0;
        }
        .policy-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          align-items: center;
          padding: 18px;
          border: 1px solid rgba(204, 162, 164, 0.7);
          border-radius: 16px;
          background: rgba(255, 244, 246, 0.86);
        }
        .policy-switch {
          position: relative;
          width: 58px;
          height: 34px;
          border: 0;
          border-radius: 999px;
          background: rgba(95, 82, 84, 0.22);
          cursor: pointer;
          transition: background 180ms ease;
        }
        .policy-switch::after {
          content: '';
          position: absolute;
          top: 5px;
          left: 5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: transform 180ms ease;
        }
        .policy-switch.active {
          background: ${colors.primary};
        }
        .policy-switch.active::after {
          transform: translateX(24px);
        }
        .field-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          align-items: center;
          padding: 16px 0;
          border-top: 1px solid rgba(204, 162, 164, 0.42);
        }
        .field-row:first-of-type {
          border-top: 0;
        }
        .field-options {
          display: flex;
          padding: 5px;
          border-radius: 999px;
          background: rgba(86, 10, 12, 0.08);
        }
        .field-options button {
          min-width: 72px;
          padding: 9px 12px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #6d6062;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }
        .field-options button.active {
          background: #fff;
          color: ${colors.primary};
          box-shadow: 0 4px 12px rgba(86, 10, 12, 0.12);
        }
        .cancel-policy-grid {
          display: grid;
          gap: 10px;
        }
        .cancel-policy-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid rgba(204, 162, 164, 0.8);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.58);
          color: #21191a;
          font-size: 17px;
          font-weight: 800;
          box-sizing: border-box;
        }
        .policy-save-button {
          justify-self: start;
          margin-top: 4px;
          padding: 13px 22px;
          border: 0;
          border-radius: 14px;
          background: ${colors.primary};
          color: white;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
        }
        .deposit-mode-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }
        .deposit-choice {
          padding: 14px;
          border: 1px solid rgba(204, 162, 164, 0.72);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.36);
          color: #5f5254;
          font-weight: 900;
          cursor: pointer;
        }
        .deposit-choice.active {
          border-color: ${colors.primary};
          background: ${colors.primary};
          color: #fff;
        }
        .deposit-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 14px;
        }
        .deposit-field {
          display: grid;
          gap: 8px;
        }
        .deposit-field strong {
          color: #21191a;
          font-size: 15px;
        }
        .deposit-field input,
        .deposit-field textarea {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid rgba(204, 162, 164, 0.8);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.58);
          color: #21191a;
          font-size: 15px;
          font-weight: 750;
          box-sizing: border-box;
        }
        .deposit-field textarea {
          min-height: 128px;
          resize: vertical;
          line-height: 1.6;
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

        @media (max-width: 800px) {
          .settings-shell {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .settings-sidebar {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            margin-top: 0;
            padding: 10px;
          }
          .settings-sidebar-title {
            display: none;
          }
          .settings-side-item {
            width: auto;
            white-space: nowrap;
          }
          .settings-main {
            padding-top: 0;
          }
          .settings-list-card {
            grid-template-columns: 1fr;
          }
          .settings-overview-head {
            align-items: flex-start;
            flex-direction: column;
          }
        }
        @media (max-width: 500px) {
          .edit-grid { padding: 12px; gap: 16px; }
          .settings-row {
            grid-template-columns: 40px minmax(0, 1fr) auto;
            padding: 14px;
          }
          .policy-card,
          .field-row {
            grid-template-columns: 1fr;
          }
          .field-options {
            width: 100%;
          }
          .field-options button {
            flex: 1;
            min-width: 0;
          }
        }
      `}</style>

      <div className="settings-shell">
        <aside className="settings-sidebar">
          <p className="settings-sidebar-title">設定</p>
          {settingsItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`settings-side-item ${activeSubTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveSubTab(item.id)}
            >
              <span className="settings-icon"><SettingIcon type={item.iconType} fallback={item.icon} /></span>
              {item.title}
            </button>
          ))}
        </aside>

        <main className="settings-main">
          {activeSubTab === 'overview' && (
            <>
              <div className="settings-overview-head">
                <div>
                  <h2>營運設定</h2>
                  <p>整理店鋪資料、預約規則與付款方式，讓顧客下單前看到清楚一致的資訊。</p>
                </div>
                <span className="settings-status-pill">本機展示模式</span>
              </div>
              <div className="settings-list-card">
                {settingsItems.map(item => (
                  <button key={item.id} type="button" className="settings-row" onClick={() => setActiveSubTab(item.id)}>
                    <span className="settings-icon"><SettingIcon type={item.iconType} fallback={item.icon} /></span>
                    <span>
                      <strong>{item.title}</strong>
                      {item.desc}
                      <small>{item.note}</small>
                    </span>
                    <span className="settings-chevron">›</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeSubTab !== 'overview' && (
            <div className="settings-panel">
              <div className="settings-panel-head">
                <h2>{settingsItems.find(item => item.id === activeSubTab)?.title || '設定'}</h2>
                <button type="button" className="back-to-settings" onClick={() => setActiveSubTab('overview')}>返回設定</button>
              </div>

      {/* ─── 內容區塊分流 ─── */}
      {activeSubTab === 'calendar' ? (
        <div className="time-settings-card">
          <div>
            <h3>時段設定</h3>
            <p>管理營業時間、休息時段與可預約規則。新增休息時段後，消費者就不能預約那些日期。</p>
          </div>

          <div className="time-action-grid">
            <button type="button" className="time-action-card primary" onClick={() => setIsRestModalOpen(true)}>
              <strong>+ 新增休息時段</strong>
              <span>設定單日休息、每週重複，或整月挑選休假日。</span>
            </button>
            <button type="button" className="time-action-card" onClick={() => alert('營業時間目前固定為 08:00 到 22:00，每 30 分鐘一個時段。')}>
              <strong>營業時間</strong>
              <span>目前開放 08:00 到 22:00，每 30 分鐘一個時段。</span>
            </button>
            <button type="button" className="time-action-card" onClick={() => alert('可約規則會套用在消費者預約頁。')}>
              <strong>可約規則</strong>
              <span>消費者只能選擇你開放且沒有被休息日擋住的時段。</span>
            </button>
          </div>
        </div>
      ) : activeSubTab === 'policy' ? (
        <div className="policy-page">
          <div className="policy-intro">
            <p>設定預約是否需要你確認、顧客預約時要填哪些資料，以及最晚可取消的時間。</p>
            <span className="policy-save-chip">可儲存</span>
          </div>

          <section className="policy-section">
            <div>
              <h3>預約成立方式</h3>
              <p>決定顧客送出預約後，是直接成立，還是先進入待確認。</p>
            </div>

            <div className="policy-card">
              <div>
                <h4>需確認後才保留時段</h4>
                <p>開啟後，顧客送出的預約會先進入審核；你接受後才正式保留時段並顯示在行程表。</p>
              </div>
              <button
                type="button"
                aria-label="切換預約確認制"
                className={`policy-switch ${bookingPolicy.requireApproval ? 'active' : ''}`}
                onClick={() => setBookingPolicy(prev => ({ ...prev, requireApproval: !prev.requireApproval }))}
              />
            </div>

            <div className="policy-card">
              <div>
                <h4>允許一次預約多個服務</h4>
                <p>開啟後，顧客可在同一筆預約中選多個項目，系統會一起計算時間與金額。</p>
              </div>
              <button
                type="button"
                aria-label="切換多服務預約"
                className={`policy-switch ${bookingPolicy.allowMultipleServices ? 'active' : ''}`}
                onClick={() => setBookingPolicy(prev => ({ ...prev, allowMultipleServices: !prev.allowMultipleServices }))}
              />
            </div>
          </section>

          <section className="policy-section">
            <div>
              <h3>預約表單欄位</h3>
              <p>選擇顧客預約時要不要填這些資料。「不顯示」代表前台不會出現這個欄位。</p>
            </div>

            {[
              ['phone', '手機', '方便臨時聯絡與確認預約。正式展示時建議設為必填。'],
              ['styleNote', '款式需求', '讓顧客先描述想做的風格，也可以貼 IG 或參考方向。'],
              ['removal', '是否需要卸甲', '有助於你安排服務時間與報價。'],
              ['contact', 'IG / LINE 聯絡方式', '讓美甲師能在預約前補充確認細節。'],
              ['birthday', '生日', '可用於會員紀錄與生日優惠，不需要就隱藏。'],
              ['gender', '性別', '通常不影響美甲預約，預設不顯示。']
            ].map(([field, title, copy]) => (
              <div className="field-row" key={field}>
                <div>
                  <strong>{title}</strong>
                  <p className="field-copy">{copy}</p>
                </div>
                <div className="field-options" aria-label={`${title}欄位設定`}>
                  {[
                    ['required', '必填'],
                    ['optional', '選填'],
                    ['hidden', '不顯示']
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={bookingPolicy.fields[field] === value ? 'active' : ''}
                      onClick={() => updatePolicyField(field, value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="policy-section">
            <div>
              <h3>取消政策</h3>
              <p>設定顧客最晚可以在預約前幾小時自行取消。少於這個時間，就會鎖定取消入口。</p>
            </div>
            <div className="cancel-policy-grid">
              <label>
                <strong>最晚可取消時間（小時前）</strong>
                <input
                  className="cancel-policy-input"
                  type="number"
                  min="0"
                  value={bookingPolicy.cancelHours}
                  onChange={(event) => setBookingPolicy(prev => ({ ...prev, cancelHours: Number(event.target.value) }))}
                />
              </label>
              <p>目前設定：顧客需在預約前 {bookingPolicy.cancelHours || 0} 小時以前取消。</p>
            </div>
            <button type="button" className="policy-save-button" onClick={saveBookingPolicy}>
              儲存接單政策
            </button>
          </section>
        </div>
      ) : activeSubTab === 'deposit' ? (
        <div className="policy-page">
          <div className="policy-intro">
            <p>設定訂金怎麼收、多久內免費取消、未付款保留多久，以及多個服務時訂金如何計算。</p>
            <span className="policy-save-chip">需儲存</span>
          </div>

          <section className="policy-section">
            <div>
              <h3>訂金規則</h3>
              <p>顧客送出預約前會先看到訂金與尾款資訊，確認後再送出。</p>
            </div>

            <div className="policy-card">
              <div>
                <h4>啟用預約訂金</h4>
                <p>開啟後，預約確認頁會顯示需付訂金與到店尾款；關閉則顯示免訂金。</p>
              </div>
              <button
                type="button"
                aria-label="切換訂金"
                className={`policy-switch ${depositPolicy.enabled ? 'active' : ''}`}
                onClick={() => setDepositPolicy(prev => ({ ...prev, enabled: !prev.enabled }))}
              />
            </div>

            <div className="deposit-mode-grid">
              <button
                type="button"
                className={`deposit-choice ${depositPolicy.type === 'fixed' ? 'active' : ''}`}
                onClick={() => setDepositPolicy(prev => ({ ...prev, type: 'fixed' }))}
              >
                固定金額
              </button>
              <button
                type="button"
                className={`deposit-choice ${depositPolicy.type === 'percent' ? 'active' : ''}`}
                onClick={() => setDepositPolicy(prev => ({ ...prev, type: 'percent' }))}
              >
                服務比例
              </button>
            </div>

            <div className="deposit-form-grid">
              <label className="deposit-field">
                <strong>{depositPolicy.type === 'fixed' ? '訂金金額（元）' : '訂金比例（%）'}</strong>
                <input
                  type="number"
                  min="0"
                  value={depositPolicy.value}
                  onChange={(event) => setDepositPolicy(prev => ({ ...prev, value: Number(event.target.value) }))}
                />
              </label>
              <label className="deposit-field">
                <strong>免費取消時數（小時前）</strong>
                <input
                  type="number"
                  min="0"
                  value={depositPolicy.freeCancelHours}
                  onChange={(event) => setDepositPolicy(prev => ({ ...prev, freeCancelHours: Number(event.target.value) }))}
                />
              </label>
            </div>
            <p>在免費取消時數內取消，系統會提醒你依退款政策處理，不會自動退款。</p>
          </section>

          <section className="policy-section">
            <div>
              <h3>收款方式</h3>
              <p>目前先支援銀行轉帳。請填寫顧客付款後可以核對的資訊。</p>
            </div>
            <label className="deposit-field">
              <strong>收款資訊</strong>
              <textarea
                value={depositPolicy.paymentInfo}
                onChange={(event) => setDepositPolicy(prev => ({ ...prev, paymentInfo: event.target.value }))}
                placeholder={'例如：\n銀行：008 華南銀行\n戶名：yyc nail\n帳號：123-456-789012'}
              />
            </label>
          </section>

          <section className="policy-section">
            <div>
              <h3>未付保留與逾期處理</h3>
              <p>顧客送出預約但還沒回報付款時，決定這個時段要幫他保留多久。</p>
            </div>
            <label className="deposit-field">
              <strong>未付保留時數（小時）</strong>
              <input
                type="number"
                min="0"
                value={depositPolicy.unpaidHoldHours}
                onChange={(event) => setDepositPolicy(prev => ({ ...prev, unpaidHoldHours: Number(event.target.value) }))}
              />
            </label>

            <div>
              <strong>逾期未付處理</strong>
              <div className="field-options" style={{ marginTop: '10px', maxWidth: '520px' }}>
                {[
                  ['release', '自動釋放時段'],
                  ['notify', '只通知我']
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={depositPolicy.overdueAction === value ? 'active' : ''}
                    onClick={() => setDepositPolicy(prev => ({ ...prev, overdueAction: value }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p style={{ marginTop: '10px' }}>建議專題展示先用「只通知我」，避免誤放掉想保留的預約。</p>
            </div>
          </section>

          <section className="policy-section">
            <div>
              <h3>多服務訂金計算</h3>
              <p>同一筆預約含多個服務時，可以選擇訂金加總，或只取最高的一項。</p>
            </div>
            <div className="field-options">
              {[
                ['sum', '加總'],
                ['highest', '取最高']
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={depositPolicy.multiServiceMode === value ? 'active' : ''}
                  onClick={() => setDepositPolicy(prev => ({ ...prev, multiServiceMode: value }))}
                >
                  {label}
                </button>
              ))}
            </div>
            <button type="button" className="policy-save-button" onClick={saveDepositPolicy}>
              儲存訂金規則
            </button>
          </section>
        </div>
      ) : activeSubTab !== 'preview' ? (
        /* ================= 填寫調整模式 ================= */
        <div className="edit-grid">
          
          {/* 左側：門面設定表單 */}
          <div style={{ background: 'rgba(255, 244, 246, 0.9)', padding: '20px', borderRadius: '16px', boxShadow: '0 12px 30px rgba(86,10,12,0.08)', border: `1px solid ${colors.accent}`, boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
              店鋪門面設定
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
                營業地址
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', color: '#444', boxSizing: 'border-box', textAlign: 'center' }}
                placeholder="例如：台北市大安區"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px', textAlign: 'center' }}>
                店家公告
              </label>
              <textarea
                rows="3"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '13px', lineHeight: '1.5', color: '#444', boxSizing: 'border-box' }}
                placeholder="例如：本月新客優惠、預約注意事項"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px', textAlign: 'center' }}>
                工作室預約準則 (一人一行)
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px', textAlign: 'center' }}>
                取消 / 退款規則
              </label>
              <textarea
                rows="3"
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '13px', lineHeight: '1.5', color: '#444', boxSizing: 'border-box' }}
              />
            </div>

            {/* 上傳檔案區塊 */}
            <div style={{ borderTop: '1px dashed #eee', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '8px', textAlign: 'center' }}>
                上傳美甲作品照片
              </label>
              <div className="upload-btn-wrapper">
                <div className="btn-upload">
                  <span style={{ fontSize: '20px' }}>+</span>
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

            <button
              type="button"
              onClick={onSaveShop}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '13px',
                border: 'none',
                borderRadius: '12px',
                background: colors.primary,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              儲存店鋪設定
            </button>
          </div>

          {/* 右側：目前作品集內容 */}
          <div style={{ background: 'rgba(255, 244, 246, 0.9)', padding: '20px', borderRadius: '16px', boxShadow: '0 12px 30px rgba(86,10,12,0.08)', border: `1px solid ${colors.accent}`, boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', fontSize: '16px', color: '#333', fontWeight: 'bold' }}>
              目前作品集內容 ({portfolioImages.length} 張)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
              {portfolioImages.map((url, index) => (
                <div key={index} style={{ width: '100%', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', position: 'relative', border: '1px solid #eee' }}>
                  <img
                    src={url}
                    alt="作品"
                    onError={(event) => {
                      event.currentTarget.src = fallbackPortfolioImage;
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
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
                <span style={{ whiteSpace: 'nowrap' }}>5G 100%</span>
              </div>

              <div style={{ width: '100%', height: '140px', position: 'relative', background: '#555', overflow: 'hidden' }}>
                <img 
                  src={portfolioImages[0] || fallbackPortfolioImage} 
                  alt="封面" 
                  onError={(event) => {
                    event.currentTarget.src = fallbackPortfolioImage;
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} 
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))' }} />
                
                <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px', color: '#fff' }}>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    🌟 {studioName || '未命名工作室'}
                  </h4>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>{address || '台北市大安區'}</div>
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
                    店家公告
                  </div>
                  <div style={{ fontSize: '11px', color: '#555', whiteSpace: 'pre-line', lineHeight: '1.5', wordBreak: 'break-all', marginBottom: '10px' }}>
                    {announcement}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: colors.secondary }}>
                    店家預約須知
                  </div>
                  <div style={{ fontSize: '11px', color: '#555', whiteSpace: 'pre-line', lineHeight: '1.5', wordBreak: 'break-all' }}>
                    {rules}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '11px', color: colors.primary, lineHeight: '1.5' }}>
                    訂金：{depositSettings?.enabled === false ? '免訂金' : depositSettings?.type === 'fixed' ? `固定 NT$${depositSettings?.value || 0}` : `${depositSettings?.value || 30}%`} ｜ 付款：{paymentMethods}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.01)', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: colors.secondary }}>
                    現場作品精選
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', width: '100%' }}>
                    {portfolioImages.map((url, idx) => (
                      <div key={idx} style={{ width: '100%', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: '#eee' }}>
                        <img
                          src={url}
                          alt="預覽作品"
                          onError={(event) => {
                            event.currentTarget.src = fallbackPortfolioImage;
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
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
          )}
        </main>
      </div>

      {isRestModalOpen && (
        <RestBlockModal
          cursor={today}
          selectedDate={todayKey}
          onClose={() => setIsRestModalOpen(false)}
          onCreate={(dates) => onCreateRestDates?.(dates)}
        />
      )}

    </div>
  );
}
