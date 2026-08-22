import React, { useState } from 'react';

const colors = {
  primary: '#560A0C',
  secondary: '#A45D65',
  accent: '#CCA2A4',
  background: '#EAD4D6',
};

const styleOptions = [
  { id: 'korean', label: '🧸 韓系簡約' },
  { id: 'japanese', label: '🌸 日式輕透' },
  { id: 'cat-eye', label: '璀璨貓眼' },
  { id: 'luxury', label: '💎 奢華排鑽' },
  { id: 'hand-paint', label: '🎨 精緻手繪' },
  { id: 'nuance', label: '🌊 暈染暈渲' }
];

export default function RegisterFlow({ initialData, onComplete, onCancel }) {
  const [step, setStep] = useState(1); 
  const [shopName, setShopName] = useState(initialData?.name || '');
  const [selectedStyles, setSelectedStyles] = useState([]);

  const handleToggleStyle = (styleLabel) => {
    setSelectedStyles(prev => 
      prev.includes(styleLabel) ? prev.filter(s => s !== styleLabel) : [...prev, styleLabel]
    );
  };

  const handleNextStep = () => {
    if (!shopName.trim()) return alert('請輸入您的工作室或美甲師名稱');
    setStep(2);
  };

  const handleSubmit = () => {
    if (selectedStyles.length === 0) return alert('請至少選擇一種您擅長的風格');
    onComplete({ shopName, tags: selectedStyles });
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${colors.background} 0%, #f0d0d5 100%)`, padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '600px', width: '100%', background: 'rgba(255, 248, 245, 0.68)', border: `1px solid ${colors.accent}`, borderRadius: '24px', padding: '40px', boxShadow: '0 12px 40px rgba(86, 10, 12, 0.15)', backdropFilter: 'blur(18px)', boxSizing: 'border-box', textAlign: 'center' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '36px', margin: '0 0 8px 0', color: colors.primary }}>NailLab</h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>美甲師入駐 · 工作室建置流程</p>
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', fontWeight: 'bold' }}>確認您的公開經營名稱</h2>
            <div style={{ marginBottom: '30px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>工作室名稱 / 美甲師暱稱</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            <button onClick={handleNextStep} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: '12px', background: colors.primary, color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              下一步：選擇擅長風格 ➔
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', fontWeight: 'bold' }}>選擇您擅長的美甲風格</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '35px' }}>
              {styleOptions.map((style) => {
                const isSelected = selectedStyles.includes(style.label);
                return (
                  <div
                    key={style.id}
                    onClick={() => handleToggleStyle(style.label)}
                    style={{ padding: '16px', borderRadius: '12px', border: isSelected ? `2px solid ${colors.primary}` : '2px solid rgba(204, 162, 164, 0.4)', background: isSelected ? `${colors.background}44` : 'rgba(255, 248, 245, 0.48)', color: isSelected ? colors.primary : '#444', fontWeight: isSelected ? 'bold' : 'normal', cursor: 'pointer', textAlign: 'center' }}
                  >
                    {style.label}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', border: '1px solid rgba(204, 162, 164, 0.5)', borderRadius: '12px', background: 'rgba(255, 248, 245, 0.48)', color: '#666', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>返回</button>
              <button onClick={handleSubmit} style={{ flex: 2, padding: '14px', border: 'none', borderRadius: '12px', background: colors.primary, color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>完成設定並入駐</button>
            </div>
          </div>
        )}

        <button onClick={onCancel} style={{ width: '100%', padding: '12px', border: 'none', background: 'none', color: '#999', fontSize: '14px', cursor: 'pointer', marginTop: '15px', textDecoration: 'underline' }}>
          取消返回
        </button>

      </div>
    </div>
  );
}
