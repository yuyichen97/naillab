import React, { useState } from 'react';

// 🎨 100% 還原 專題顏色.jpg 的核心色調
const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  white: '#ffffff',
  gray: '#f8f9fa'
};

function StylistCalendarSetting({ scheduleDatabase, setScheduleDatabase }) {
  // 可供排班的三個月清單
  const availableMonths = ['2026-06', '2026-07', '2026-08'];
  
  // 1. 全局月份索引狀態（0 代表 6月, 1 代表 7月, 2 代表 8月）
  const [monthIndex, setMonthIndex] = useState(0);
  const currentMonth = availableMonths[monthIndex];

  // 2. 目前選中的日期（預設是 2026-06-04）
  const [selectedDate, setSelectedDate] = useState('2026-06-04');

  // 24 小時的預設時段選單
  const timeSlots = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  // 🌟 自動生成各月份日曆的核心邏輯 (動態計算天數與星期留白)
  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getFirstDayOfWeek = (year, month) => new Date(year, month - 1, 1).getDay();

  const year = parseInt(currentMonth.split('-')[0]);
  const month = parseInt(currentMonth.split('-')[1]);

  const totalDays = getDaysInMonth(year, month);       // 該月總天數 (30 或 31)
  const blankCells = getFirstDayOfWeek(year, month);   // 第一天禮拜幾 (決定前面留幾格空位)

  // 格式化日期數字為兩碼 (如 4 變成 "04")
  const formatDayNum = (d) => d < 10 ? `0${d}` : d;

  const currentDayTimes = scheduleDatabase[selectedDate] || [];

  // 處理下方時段按鈕的點擊勾選與記憶
  const toggleTimeSlot = (time) => {
    let updatedTimes;
    if (currentDayTimes.includes(time)) {
      updatedTimes = currentDayTimes.filter(t => t !== time);
    } else {
      updatedTimes = [...currentDayTimes, time];
    }
    setScheduleDatabase({
      ...scheduleDatabase,
      [selectedDate]: updatedTimes
    });
  };

  // 判斷某一號有沒有排班 (畫小圓點用)
  const hasSchedule = (dateString) => {
    return scheduleDatabase[dateString] && scheduleDatabase[dateString].length > 0;
  };

  // 切換月份按鈕
  const handleMonthChange = (direction) => {
    let newIndex = monthIndex + direction;
    if (newIndex >= 0 && newIndex < availableMonths.length) {
      setMonthIndex(newIndex);
      const nextMonthStr = availableMonths[newIndex];
      setSelectedDate(`${nextMonthStr}-01`); // 切月時預設選取該月1號
    }
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', background: '#fff', minHeight: '100vh' }}>
      
      {/* 1. 頂部標題 */}
      <div style={{ marginBottom: '15px' }}>
        <span style={{ fontSize: '11px', color: colors.secondary, fontWeight: 'bold', letterSpacing: '1px' }}>QUARTERLY SCHEDULE</span>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a' }}>季度班表設定</h2>
      </div>

      {/* 2. 三個月滾動日曆卡片 */}
      <div style={{ background: '#fff', border: `1px solid ${colors.accent}`, borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: '20px' }}>
        
        {/* 月份切換控制列 (支援 6、7、8 三個月來回切換) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button 
            disabled={monthIndex === 0}
            onClick={() => handleMonthChange(-1)}
            style={{ border: 'none', background: 'none', fontSize: '15px', cursor: 'pointer', color: monthIndex === 0 ? '#ccc' : colors.primary, fontWeight: 'bold' }}
          >
            ◀ 上個月
          </button>
          
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: colors.primary }}>
            {year}年 {month}月 📅
          </div>
          
          <button 
            disabled={monthIndex === availableMonths.length - 1}
            onClick={() => handleMonthChange(1)}
            style={{ border: 'none', background: 'none', fontSize: '15px', cursor: 'pointer', color: monthIndex === availableMonths.length - 1 ? '#ccc' : colors.primary, fontWeight: 'bold' }}
          >
            下個月 ▶
          </button>
        </div>
        
        {/* 星期標籤欄 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontSize: '12px', color: '#aaa', marginBottom: '12px' }}>
          <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
        </div>

        {/* 自動計算生成的日曆網格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '10px', textAlign: 'center', fontSize: '14px', alignItems: 'center' }}>
          
          {/* 1. 動態渲染每個月月初的空白格子 */}
          {Array.from({ length: blankCells }).map((_, index) => (
            <span key={`blank-${index}`}></span>
          ))}

          {/* 2. 動態渲染這個月的每一天 */}
          {Array.from({ length: totalDays }).map((_, index) => {
            const dayNum = index + 1;
            const thisDateStr = `${currentMonth}-${formatDayNum(dayNum)}`;
            const isTargetSelected = selectedDate === thisDateStr;
            const isDayChecked = hasSchedule(thisDateStr);

            return (
              <div 
                key={`day-${dayNum}`}
                onClick={() => setSelectedDate(thisDateStr)} 
                style={{ 
                  position: 'relative', 
                  cursor: 'pointer', 
                  margin: '0 auto', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '50%', 
                  background: isTargetSelected ? colors.primary : 'transparent', 
                  color: isTargetSelected ? '#fff' : '#333', 
                  fontWeight: 'bold',
                  transition: 'all 0.1s'
                }}
              >
                {dayNum}
                {/* 如果這天有排班，且目前沒被點選，就秀出乾燥玫瑰小點點 */}
                {isDayChecked && !isTargetSelected && (
                  <span style={{ position: 'absolute', bottom: '2px', width: '4px', height: '4px', background: colors.secondary, borderRadius: '50%' }}></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 當日時間段選取區 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: colors.primary }}>
            📍 {selectedDate} 班表設定
          </h3>
          <span style={{ fontSize: '12px', color: '#666', background: colors.background, padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
            已開放 {currentDayTimes.length} 個時段
          </span>
        </div>

        {/* 24 小時時段方塊牆 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', height: '230px', overflowY: 'auto', paddingRight: '4px' }}>
          {timeSlots.map((time) => {
            const isSelected = currentDayTimes.includes(time);
            return (
              <button
                key={time}
                onClick={() => toggleTimeSlot(time)}
                style={{
                  padding: '10px 0',
                  borderRadius: '10px',
                  border: isSelected ? 'none' : '1px solid #eee',
                  background: isSelected ? colors.secondary : colors.gray,
                  color: isSelected ? '#fff' : '#333',
                  fontSize: '12px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease'
                }}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default StylistCalendarSetting;
