import React, { useState, useRef, useEffect } from 'react';
import { formatPrice, getStudioDisplayName, supabase } from '../../lib/supabase';

const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  gray: '#f8f9fa'
};

const statusLabels = {
  pending: '店家審核中',
  approved: '預約已確認',
  paid: '已付訂金，待店家確認',
  rejected: '店家已婉拒',
  cancelled: '已取消',
  refunding: '退款處理中',
  refunded: '已退款',
  completed: '服務已完成',
  no_show: '未到店'
};

const demoAppointmentStorageKey = 'nail-lab-demo-appointments';

function readDemoAppointments() {
  try {
    return JSON.parse(window.localStorage.getItem(demoAppointmentStorageKey) || '[]');
  } catch {
    return [];
  }
}

function saveDemoAppointments(records) {
  window.localStorage.setItem(demoAppointmentStorageKey, JSON.stringify(records));
  window.dispatchEvent(new Event('nail-lab-demo-appointments-updated'));
}

function isLocalDemoUser(user) {
  return Boolean(
    user?.isLocalDemo ||
    (import.meta.env.DEV && user?.id === '53988bcc-0fd2-4b60-8af3-c51786275361')
  );
}

export default function CustomerProfile({ currentUser, onLogout }) {
  // ─── 狀態管理 ───
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(currentUser?.name || '消費者'); 
  const [selectedStyles, setSelectedStyles] = useState([]);
  
  // 互動式頭像狀態 (點擊可更換本地照片)
  const [avatar, setAvatar] = useState(null); 
  const fileInputRef = useRef(null);

  const [bookingRecords, setBookingRecords] = useState([]);

  // 當使用者重新註冊、登入或 currentUser 改變時，即時更新名字狀態
  useEffect(() => {
    if (currentUser?.name) {
      setUserName(currentUser.name);
    }
  }, [currentUser]);

  // 從後端同步會員預約狀態
  useEffect(() => {
    const refreshBookings = async () => {
      try {
        if (isLocalDemoUser(currentUser)) {
          setBookingRecords(readDemoAppointments()
            .filter(item => item.customer_id === currentUser?.id)
            .map(item => ({
              id: item.id,
              studio: getStudioDisplayName(item.shops?.studio_name) || '美甲沙龍',
              service: item.service_name,
              price: formatPrice(item.price),
              depositAmount: item.deposit_amount ? formatPrice(item.deposit_amount) : '',
              date: item.appointment_date,
              time: item.appointment_time,
              rawStatus: item.status,
              status: statusLabels[item.status] || item.status
            })));
          return;
        }

        const { data, error } = await supabase
          .from('appointments')
          .select('id, service_name, price, appointment_date, appointment_time, status, shops(studio_name)')
          .eq('customer_id', currentUser?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setBookingRecords((data || []).map(item => ({
          id: item.id,
          studio: getStudioDisplayName(item.shops?.studio_name) || '美甲沙龍',
          service: item.service_name,
          price: formatPrice(item.price),
          date: item.appointment_date,
          time: item.appointment_time,
          rawStatus: item.status,
          status: statusLabels[item.status] || item.status
        })));
      } catch (err) {
        console.error('Failed to fetch user bookings from backend:', err);
      }
    };
    
    window.addEventListener('focus', refreshBookings); 
    window.addEventListener('nail-lab-demo-appointments-updated', refreshBookings);
    refreshBookings(); // 元件載入時先主動刷一次
    
    return () => {
      window.removeEventListener('focus', refreshBookings);
      window.removeEventListener('nail-lab-demo-appointments-updated', refreshBookings);
    };
  }, [currentUser]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('確定要取消這筆預約嗎？取消後時段會重新開放。')) return;

    if (isLocalDemoUser(currentUser)) {
      const updated = readDemoAppointments().map(record => {
        if (record.id !== bookingId) return record;
        const nextStatus = record.deposit_amount > 0 ? 'refunding' : 'cancelled';
        return { ...record, status: nextStatus };
      });
      saveDemoAppointments(updated);
      setBookingRecords(prev => prev.map(record => (
        record.id === bookingId
          ? { ...record, rawStatus: record.depositAmount ? 'refunding' : 'cancelled', status: record.depositAmount ? statusLabels.refunding : statusLabels.cancelled }
          : record
      )));
      alert('已送出取消申請；若有訂金，狀態會進入退款處理中。');
      return;
    }

    const { data, error } = await supabase.rpc('cancel_my_appointment', {
      p_appointment_id: bookingId
    });

    if (error) {
      alert(`取消失敗：${error.message || '請稍後再試。'}`);
      return;
    }
    if (!data) {
      alert('這筆預約目前無法取消，可能已被處理或狀態已更新。');
      return;
    }

    setBookingRecords(prev => prev.map(record => (
      record.id === bookingId
        ? { ...record, rawStatus: 'cancelled', status: statusLabels.cancelled }
        : record
    )));
    alert('預約已取消。');
  };

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
          text-align: center; cursor: pointer; transition: all 0.2s ease; background: rgba(255, 248, 245, 0.14);
          border-color: rgba(255, 248, 245, 0.24); color: #fff8f5; backdrop-filter: blur(14px);
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
          background: rgba(255, 248, 245, 0.14); padding: 20px; border-radius: 14px;
          box-shadow: 0 18px 45px rgba(27, 16, 17, 0.14); border: 1px solid rgba(255, 248, 245, 0.24); margin-top: 12px;
          text-align: left;
          color: #fff8f5; backdrop-filter: blur(16px);
        }
        @media (max-width: 768px) {
          .booking-card { flex-direction: column; align-items: flex-start; gap: 14px; }
        }
      `}</style>

      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />

      {/* 基本資料卡片 */}
      <div style={{ background: 'rgba(255, 248, 245, 0.14)', borderRadius: '16px', padding: '30px', boxShadow: '0 18px 45px rgba(27, 16, 17, 0.16)', border: '1px solid rgba(255, 248, 245, 0.24)', marginBottom: '24px', backdropFilter: 'blur(16px)', color: '#fff8f5' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          
          <div className="avatar-container" onClick={handleAxatarClick}>
            {avatar ? (
              <img src={avatar} alt="頭像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              /* 關鍵修正：這裡已完美修復原本語法錯誤的 center 加上引號 */
              <div style={{ width: '100%', height: '100%', background: '#EAD4D6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>👩🏻</div>
            )}
            <div className="avatar-mask">
              <span>📷</span>
              <span>更換照片</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', width: '100%' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255, 248, 245, 0.62)', marginBottom: '4px' }}>姓名</div>
            {isEditing ? (
              <input 
                type="text" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', padding: '4px 10px', border: `2px solid ${colors.accent}`, borderRadius: '6px', outline: 'none' }}
              />
            ) : (
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff8f5' }}>{userName}</div>
            )}

            <div style={{ fontSize: '13px', color: 'rgba(255, 248, 245, 0.62)', marginTop: '14px', marginBottom: '4px' }}>帳號</div>
            <div style={{ fontSize: '14px', color: 'rgba(255, 248, 245, 0.78)', fontWeight: '500' }}>
              {generateBeautifulUsername()}
            </div>

            <div style={{ fontSize: '13px', color: 'rgba(255, 248, 245, 0.62)', marginTop: '14px', marginBottom: '4px' }}>身份</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 248, 245, 0.16)', border: '1px solid rgba(255, 248, 245, 0.24)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', color: '#fff8f5', fontWeight: 'bold' }}>
              🧭 消費者
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px', marginTop: '20px' }}>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              style={{ flex: 1, background: colors.primary, color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isEditing ? '儲存資料' : '編輯資料'}
            </button>
            <button 
              type="button"
              onClick={onLogout}
              style={{ flex: 1, background: 'rgba(255, 248, 245, 0.14)', color: '#fff8f5', border: '1px solid rgba(255, 248, 245, 0.28)', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              登出
            </button>
          </div>
        </div>
      </div>

      {/* 預約日程管理卡片 */}
      <div style={{ background: 'rgba(255, 248, 245, 0.14)', borderRadius: '16px', padding: '24px', boxShadow: '0 18px 45px rgba(27, 16, 17, 0.16)', border: '1px solid rgba(255, 248, 245, 0.24)', backdropFilter: 'blur(16px)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#fff8f5', textAlign: 'left' }}>專屬我的美甲預約日程</h3>
        
        {bookingRecords.map((record) => (
          <div key={record.id} className="booking-card">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '16px', color: '#fff8f5' }}>{record.studio}</strong>
                <span style={{ fontSize: '11px', background: 'rgba(255, 248, 245, 0.14)', padding: '2px 6px', borderRadius: '4px', color: 'rgba(255, 248, 245, 0.68)' }}>單號 {record.id}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 248, 245, 0.72)', marginTop: '6px' }}>
                施作項目：{record.service} ｜ 金額：<strong style={{ color: colors.primary }}>{record.price}</strong>
                {record.depositAmount && <> ｜ 訂金：<strong style={{ color: colors.primary }}>{record.depositAmount}</strong></>}
              </div>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255, 248, 245, 0.72)' }}>
              預約時間：<span style={{ fontWeight: 'bold', color: '#fff8f5' }}>{record.date} 於 {record.time}</span>
            </div>
            <div>
              <span style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', background: '#FFF0F2', color: colors.primary, border: `1px solid ${colors.accent}` }}>
                {record.status}
              </span>
              {['pending', 'approved', 'paid'].includes(record.rawStatus) && (
                <button
                  type="button"
                  onClick={() => handleCancelBooking(record.id)}
                  style={{ marginLeft: '8px', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255, 248, 245, 0.28)', background: 'rgba(255, 248, 245, 0.14)', color: '#fff8f5', cursor: 'pointer', fontSize: '12px' }}
                >
                  取消預約
                </button>
              )}
            </div>
          </div>
        ))}
        {bookingRecords.length === 0 && (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'rgba(255, 248, 245, 0.72)', background: 'rgba(255, 248, 245, 0.14)', border: '1px solid rgba(255, 248, 245, 0.22)', borderRadius: '12px', marginTop: '12px' }}>
            目前還沒有預約紀錄
          </div>
        )}
      </div>

    </div>
  );
}
