import React, { useState } from 'react';

// 🎨 還原核心色調
const colors = {
  primary: '#560A0C',     // 奢華酒紅
  secondary: '#A45D65',   // 乾燥玫瑰
  accent: '#CCA2A4',      // 暮色粉
  background: '#EAD4D6',  // 陶瓷粉
  white: '#ffffff',
  gray: '#f8f9fa'
};

function StylistCalendarSetting({ scheduleDatabase = {}, setScheduleDatabase = () => {} }) {
  // 📅 2026年專題基準時間點
  const availableMonths = ['2026-06', '2026-07', '2026-08'];
  
  // 1. 全局月份索引狀態
  const [monthIndex, setMonthIndex] = useState(0);
  const currentMonth = availableMonths[monthIndex];

  // 🌟【專題絕對防呆核心】：直接將今天錨定在專題基準時間點，不依賴不穩定的系統真實時間
  const todayStr = '2026-06-08'; 
  const currentHour = 14; // 錨定當前時間下午 2:00 (14點)

  // 使用絕對年、月、日解析出專題的今天午夜毫秒數，徹底杜絕時區與真實日子干擾
  const todayTimestamp = Date.parse('2026-06-08T00:00:00');

  // 2. 目前選中的日期（預設動態對接專題今天）
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // 24 小時的預設時段選單
  const timeSlots = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  // 自動生成各月份日曆的核心邏輯
  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getFirstDayOfWeek = (year, month) => new Date(year, month - 1, 1).getDay();

  const year = parseInt(currentMonth.split('-')[0]);
  const month = parseInt(currentMonth.split('-')[1]);

  const totalDays = getDaysInMonth(year, month);       
  const blankCells = getFirstDayOfWeek(year, month);   

  const formatDayNum = (d) => d < 10 ? `0${d}` : d;

  const currentDayTimes = scheduleDatabase[selectedDate] || [];

  // 處理下方時段按鈕的點擊勾選
  const toggleTimeSlot = (time) => {
    // 🔒 雙重後端級防呆：如果企圖修改過去的資料，直接 return 阻斷
    const currentSelectedDayNum = formatDayNum(parseInt(selectedDate.split('-')[2]));
    const targetTimestamp = Date.parse(`${currentMonth}-${currentSelectedDayNum}T00:00:00`);
    const isPastDay = targetTimestamp < todayTimestamp;

    const slotHour = parseInt(time.split(':')[0]);
    const isTimePast = isPastDay || (selectedDate === todayStr && slotHour <= currentHour);

    if (isTimePast) return; // 鎖死點擊，完全不變更資料庫狀態！

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

  const hasSchedule = (dateString) => {
    return scheduleDatabase[dateString] && scheduleDatabase[dateString].length > 0;
  };

  // 切換月份
  const handleMonthChange = (direction) => {
    let newIndex = monthIndex + direction;
    if (newIndex >= 0 && newIndex < availableMonths.length) {
      setMonthIndex(newIndex);
      const nextMonthStr = availableMonths[newIndex];
      
      if (nextMonthStr === todayStr.slice(0, 7)) {
        setSelectedDate(todayStr);
      } else {
        setSelectedDate(`${nextMonthStr}-01`);
      }
    }
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'sans-serif', background: '#fff' }}>
      
      {/* 1. 頂部標題 */}
      <div style={{ marginBottom: '15px', textAlign: 'left' }}>
        <span style={{ fontSize: '11px', color: colors.secondary, fontWeight: 'bold', letterSpacing: '1px' }}>QUARTERLY SCHEDULE</span>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a' }}>季度班表設定</h2>
      </div>

      {/* 2. 三個月滾動日曆卡片 */}
      <div style={{ background: '#fff', border: `1px solid ${colors.accent}`, borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: '20px' }}>
        
        {/* 月份切換控制列 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <button 
            type="button"
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
            type="button"
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
          
          {Array.from({ length: blankCells }).map((_, index) => (
            <span key={`blank-${index}`}></span>
          ))}

          {Array.from({ length: totalDays }).map((_, index) => {
            const dayNum = index + 1;
            const thisDateStr = `${currentMonth}-${formatDayNum(dayNum)}`;
            const isTargetSelected = selectedDate === thisDateStr;
            const isDayChecked = hasSchedule(thisDateStr);

            // 🎯【最強日期防呆】：精準用字串拼出當天午夜並轉換，與專題今天做絕對毫秒值大小比對
            const cellTimestamp = Date.parse(`${currentMonth}-${formatDayNum(dayNum)}T00:00:00`);
            const isPastDay = cellTimestamp < todayTimestamp;

            return (
              <div 
                key={`day-${dayNum}`}
                onClick={() => {
                  // 🔒 如果是過去的日期（6/2, 6/3），直接禁止點擊切換選中狀態！
                  if (isPastDay) return;
                  setSelectedDate(thisDateStr);
                }} 
                style={{ 
                  position: 'relative', 
                  cursor: isPastDay ? 'not-allowed' : 'pointer', 
                  margin: '0 auto', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '50%', 
                  background: isTargetSelected ? colors.primary : 'transparent', 
                  color: isTargetSelected ? '#fff' : (isPastDay ? '#ccc' : '#333'), 
                  fontWeight: 'bold',
                  transition: 'all 0.1s',
                  opacity: isPastDay ? 0.4 : 1 // 讓過去的 6/2、6/3 在畫面上直接變透明灰色
                }}
              >
                {dayNum}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
          {timeSlots.map((time) => {
            const isSelected = currentDayTimes.includes(time);
            const slotHour = parseInt(time.split(':')[0]); 

            // 🎯【最強時間段防呆】：
            const currentSelectedDayNum = formatDayNum(parseInt(selectedDate.split('-')[2]));
            const selectedDateTimestamp = Date.parse(`${currentMonth}-${currentSelectedDayNum}T00:00:00`);
            const isSelectedDatePast = selectedDateTimestamp < todayTimestamp;

            // 只要選中的日期在專題今天之前，或者就是專題今天但小時已經過去，按鈕一律被列為過期
            const isTimePast = isSelectedDatePast || (selectedDate === todayStr && slotHour <= currentHour);

            return (
              <button
                key={time}
                type="button"
                disabled={isTimePast} // HTML 原生禁用，點擊事件完全失效
                onClick={() => toggleTimeSlot(time)}
                style={{
                  padding: '10px 0',
                  borderRadius: '10px',
                  border: isSelected ? 'none' : '1px solid #eee',
                  background: isTimePast ? '#e2e8f0' : (isSelected ? colors.secondary : colors.gray),
                  color: isTimePast ? '#94a3b8' : (isSelected ? '#fff' : '#333'),
                  fontSize: '12px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  cursor: isTimePast ? 'not-allowed' : 'pointer', 
                  transition: 'all 0.1s ease',
                  textDecoration: isTimePast ? 'line-through' : 'none' 
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