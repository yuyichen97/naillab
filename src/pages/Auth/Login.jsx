import React, { useState, useEffect } from 'react';

const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  gray: '#f8f9fa'
};

// 🗺️ 全台灣 22 縣市美甲預約完整資料庫
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

export default function Login({ onLogin }) {
  // 🧭 內部流程控管
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('customer'); 
  const [isRegister, setIsRegister] = useState(false);         
  
  // 表單輸入狀態
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // 🔒 驗證碼相關狀態 
  const [otpCode, setOtpCode] = useState('');               // 使用者輸入的驗證碼
  const [isOtpSent, setIsOtpSent] = useState(false);         // 是否已發送驗證碼
  const [countdown, setCountdown] = useState(0);             // 倒數計時秒數

  // 🔮 雙層地區連動狀態
  const [selectedCity, setSelectedCity] = useState('台北市'); 
  const [selectedDistrict, setSelectedDistrict] = useState('大安區'); 

  // 🎯 重置所有欄位與驗證碼狀態
  useEffect(() => {
    setAccount('');
    setPassword('');
    setName('');
    setOtpCode('');
    setIsOtpSent(false);
    setCountdown(0);
  }, [isRegister, step]);

  // ⏳ 驗證碼倒數計時的 Effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  // ✉️ 模擬發送驗證碼按鈕事件（包含 RegEx 格式防呆檢查）
  const handleSendOtp = () => {
    const phoneRegex = /^09\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const inputAccount = account.trim();

    if (!inputAccount) {
      alert('❌ 請先輸入手機號碼或信箱以獲取驗證碼！');
      return;
    }

    if (!phoneRegex.test(inputAccount) && !emailRegex.test(inputAccount)) {
      alert('❌ 格式錯誤！請輸入正確的台灣手機號碼或電子信箱。');
      return;
    }

    // 模擬後端串接發送
    alert(`✨ 驗證碼已發送至：${inputAccount}\n（ demo 專題簡報展示用驗證碼請輸入：1234 ）`);
    setIsOtpSent(true);
    setCountdown(60); // 進入 60 秒倒數
  };

  // 送出表單時進行必填欄位檢查
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. 登入狀態下的必填防呆與資料傳遞
    if (!isRegister) {
      if (!account.trim()) {
        alert('❌ 請輸入手機號碼或信箱！');
        return;
      }
      if (!password.trim()) {
        alert('❌ 請輸入密碼！');
        return;
      }
      
      const defaultName = selectedRole === 'stylist' ? '專業美甲師' : '消費者';

      onLogin({ 
        studioName: selectedRole === 'stylist' ? defaultName : '', 
        name: defaultName, 
        phone: account.trim(), 
        role: selectedRole 
      });
      return;
    }

    // 2. 註冊狀態下的必填防呆（區分身份）
    if (isRegister) {
      const phoneRegex = /^09\d{8}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name.trim()) {
        const errorMsg = selectedRole === 'stylist' ? '❌ 請填寫沙龍 / 工作室名稱！' : '❌ 請填寫您的姓名 / 暱稱！';
        alert(errorMsg);
        return;
      }

      if (selectedRole === 'stylist' && (!selectedCity || !selectedDistrict)) {
        alert('❌ 請選擇完整的經營/服務地區！');
        return;
      }

      if (!account.trim() || (!phoneRegex.test(account.trim()) && !emailRegex.test(account.trim()))) {
        alert('❌ 請填寫正確的手機號碼或信箱！');
        return;
      }

      // 🔒 驗證碼必填防呆
      if (!isOtpSent) {
        alert('❌ 請先點擊「獲取驗證碼」並完成驗證！');
        return;
      }

      if (otpCode.trim() !== '1234') { // 🎯 Demo 報告專用死碼
        alert('❌ 驗證碼錯誤，請重新輸入！');
        return;
      }

      if (!password.trim()) {
        alert('❌ 請設定您的密碼！');
        return;
      }

      const fullLocation = `${selectedCity}${selectedDistrict}`;

      if (selectedRole === 'stylist') {
        // 固定為獨立一人工作室結構
        const initialEmployees = [{ id: 1, name: '首席設計師 (店長)', isOwner: true }];

        alert(`🎉 美甲師註冊成功！\n工作室：${name}\n服務地區：${fullLocation}\n系統已自動為您登入後台。`);
        
        onLogin({ 
          studioName: name, 
          name: name, 
          phone: account.trim(), 
          role: selectedRole, 
          location: fullLocation,
          studioType: 'single',        // 固定傳回單人型態
          employees: initialEmployees  // 固定傳回單人名單
        });
      } else {
        alert(`🎉 消費者註冊成功！已為您自動登入。`);
        onLogin({ name: name, phone: account.trim(), role: selectedRole });
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
      alignItems: 'center', justifyContent: 'center', background: '#EAD4D6', 
      padding: '16px', boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      
      {/* 🔮 注入 RWD 排版控制與防擠壓機制 */}
      <style>{`
        .login-card {
          max-width: 450px; 
          width: 100%; 
          background: #fff; 
          border-radius: 24px; 
          padding: 35px 24px 25px 24px; 
          box-shadow: 0 12px 36px rgba(86,10,12,0.06); 
          box-sizing: border-box;
        }
        .role-box-container {
          display: flex; 
          gap: 16px; 
          margin-bottom: 25px;
        }
        @media (max-width: 400px) {
          .login-card {
            padding: 24px 16px 20px 16px;
            border-radius: 16px;
          }
          .role-box-container {
            flex-direction: column;
            gap: 12px;
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
          ⬅️ 重新選擇身份
        </button>
      )}

      {/* 頂部標題區 */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', margin: '0 0 4px 0', color: colors.primary, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span>💅</span> Nail Lab
        </h1>
        <p style={{ fontSize: '13px', color: colors.secondary, margin: 0, letterSpacing: '2px', fontWeight: '500' }}>專業美甲預約管理平台</p>
      </div>

      <div className="login-card">
        
        {/* ================= 階段 1：選擇身份 ================= */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 20px 0' }}>選擇你的身份</h2>
            
            <div className="role-box-container">
              {/* 消費者選項 */}
              <div 
                onClick={() => handleSelectRole('customer')}
                style={{ flex: 1, border: '1px solid #eee', borderRadius: '16px', padding: '25px 10px', cursor: 'pointer', transition: 'all 0.2s ease', background: '#fcfcfc', boxSizing: 'border-box' }}
              >
                <div style={{ fontSize: '34px', marginBottom: '12px' }}>👱‍♀️</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>消費者</div>
                <div style={{ fontSize: '11px', color: '#888' }}>預約美甲服務</div>
              </div>

              {/* 美甲師選項 */}
              <div 
                onClick={() => handleSelectRole('stylist')}
                style={{ flex: 1, border: '1px solid #eee', borderRadius: '16px', padding: '25px 10px', cursor: 'pointer', transition: 'all 0.2s ease', background: '#fcfcfc', boxSizing: 'border-box' }}
              >
                <div style={{ fontSize: '34px', marginBottom: '12px' }}>💅</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>美甲師</div>
                <div style={{ fontSize: '11px', color: '#888' }}>管理服務與預約</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>點選上方選項即可繼續</p>
          </div>
        )}

        {/* ================= 階段 2：輸入帳密 / 註冊表單 ================= */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', background: colors.background, color: colors.primary, padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                {selectedRole === 'stylist' ? '✨ 美甲師端' : '👤 消費者端'}
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', margin: '8px 0 0 0' }}>
                {isRegister ? '建立新帳號' : '密碼安全登入'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {isRegister && (
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' }}>
                    {selectedRole === 'stylist' ? '沙龍 / 工作室名稱 *' : '您的姓名 / 暱稱 *'}
                  </label>
                  <input 
                    type="text" placeholder="此欄位為必填" value={name} onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              )}

              {/* 美甲師註冊專用：服務地區選單 */}
              {isRegister && selectedRole === 'stylist' && (
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' }}>
                    📍 經營/服務地區 *
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    
                    <select
                      value={selectedCity}
                      onChange={handleCityChange}
                      style={{ 
                        flex: 1, padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', 
                        fontSize: '14px', background: '#fff', outline: 'none', cursor: 'pointer', color: '#333', minWidth: 0
                      }}
                    >
                      {Object.keys(regionData).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>

                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      style={{ 
                        flex: 1, padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', 
                        fontSize: '14px', background: '#fff', outline: 'none', cursor: 'pointer', color: '#333', minWidth: 0
                      }}
                    >
                      {regionData[selectedCity].map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>

                  </div>
                </div>
              )}

              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' }}>手機號碼 / 信箱 *</label>
                {/* 🔒 註冊模式下：帳號輸入框與發送按鈕並排 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" placeholder="請輸入手機號碼或信箱" value={account} onChange={(e) => setAccount(e.target.value)}
                    style={{ flex: 1, padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', minWidth: 0 }}
                  />
                  {isRegister && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={countdown > 0}
                      style={{ 
                        padding: '0 15px', background: countdown > 0 ? '#ccc' : colors.secondary, color: '#fff', 
                        border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {countdown > 0 ? `${countdown}s 後重發` : '獲取驗證碼'}
                    </button>
                  )}
                </div>
              </div>

              {/* 🔒 註冊模式且已發送驗證碼時才顯示的「驗證碼輸入框」 */}
              {isRegister && isOtpSent && (
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' }}>🤖 輸入4位數驗證碼 *</label>
                  <input 
                    type="text" placeholder="請輸入 1234 測試" value={otpCode} maxLength={4} onChange={(e) => setOtpCode(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', border: `1px solid ${colors.secondary}`, borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', background: '#fff5f5', fontWeight: 'bold', letterSpacing: '4px' }}
                  />
                </div>
              )}

              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' }}>密碼 *</label>
                <input 
                  type="password" placeholder="請輸入密碼" value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <button 
                type="submit"
                style={{ width: '100%', padding: '12px', background: colors.primary, color: '#fff', border: 'none', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(86,10,12,0.15)' }}
              >
                {isRegister ? '完成註冊並登入' : '登入系統'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: '#666' }}>
              {isRegister ? (
                <span>已經有帳號了？ <button type="button" onClick={() => setIsRegister(false)} style={{ background: 'none', border: 'none', color: colors.secondary, fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>按此登入</button></span>
              ) : (
                <span>第一次使用嗎？ <button type="button" onClick={() => setIsRegister(true)} style={{ background: 'none', border: 'none', color: colors.secondary, fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>免費註冊帳號</button></span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}