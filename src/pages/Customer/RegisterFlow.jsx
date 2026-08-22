import React, { useState } from 'react';

function RegisterFlow() {
  // 用 step 控制目前在第幾步：1 = 登入, 2 = 建立個人檔案, 3 = 選擇喜愛風格
  const [step, setStep] = useState(1);
  
  // 儲存消費者輸入的資料
  const [name, setName] = useState('');
  const [selectedStyles, setSelectedStyles] = useState([]);

  // 可選的風格標籤清單
  const availableStyles = ['韓系', '日系', '簡約', '奢華', '可愛', '個性', '法式', '貓眼', '手繪'];

  // 處理標籤複選的邏輯
  const toggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style)); // 再次點擊取消勾選
    } else {
      setSelectedStyles([...selectedStyles, style]); // 勾選
    }
  };

  return (
    <div style={{ maxWidth: '375px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', background: 'transparent', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* ─── STEP 1: 登入主頁 ─── */}
      {step === 1 && (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>N</div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>NailLink</h1>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>專業美甲預約與工作室管理平台</p>
          
          <div style={{ marginTop: '150px' }}>
            <button onClick={() => setStep(2)} style={{ width: '100%', padding: '15px', background: '#0b132b', color: '#fff', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', cursor: 'pointer' }}>
              💼 我是美甲師 / 註冊入駐
            </button>
            <button onClick={() => setStep(2)} style={{ width: '100%', padding: '15px', background: '#f4f5f7', color: '#1a1a1a', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              尋找美甲工作室
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: 建立個人檔案 ─── */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>建立個人檔案</h2>
          <p style={{ color: '#888', fontSize: '14px' }}>歡迎加入，讓我們更了解你的需求</p>
          
          {/* 大頭貼預留區 */}
          <div style={{ textAlignment: 'center', margin: '30px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#e4e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>N</div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#444' }}>暱稱或稱呼：</label>
            <input type="text" placeholder="小美" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
          </div>

          <button onClick={() => setStep(3)} disabled={!name} style={{ width: '100%', padding: '15px', background: name ? '#0b132b' : '#ccc', color: '#fff', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', marginTop: '100px', cursor: 'pointer' }}>
            下一步
          </button>
        </div>
      )}

      {/* ─── STEP 3: 選擇喜愛風格 ─── */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>選擇喜愛風格</h2>
          <p style={{ color: '#888', fontSize: '14px' }}>我們將依據你的偏好推薦適合的工作室</p>
          
          {/* 泡泡標籤區域 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '30px' }}>
            {availableStyles.map((style) => {
              const isSelected = selectedStyles.includes(style);
              return (
                <button key={style} onClick={() => toggleStyle(style)} style={{ padding: '10px 20px', borderRadius: '20px', border: isSelected ? 'none' : '1px solid rgba(255, 248, 245, 0.28)', background: isSelected ? '#5a189a' : 'rgba(255, 248, 245, 0.16)', color: isSelected ? '#fff' : '#fff8f5', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {style}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '150px' }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, padding: '15px', background: 'rgba(255, 248, 245, 0.16)', color: '#fff8f5', border: '1px solid rgba(255, 248, 245, 0.28)', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              返回
            </button>
            <button onClick={() => alert(`註冊成功！歡迎 ${name}，你選擇了：${selectedStyles.join(', ')}`)} style={{ flex: 2, padding: '15px', background: '#5a189a', color: '#fff', border: 'none', borderRadius: '25px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              進入大廳
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default RegisterFlow;
