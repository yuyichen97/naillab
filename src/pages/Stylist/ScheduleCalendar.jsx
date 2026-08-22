import React, { useMemo, useState } from 'react';
import './ScheduleCalendar.css';

const statusMeta = {
  pending: { label: '待確認', className: 'pending' },
  approved: { label: '已確認', className: 'approved' },
  paid: { label: '已付訂金', className: 'paid' },
  completed: { label: '已完成', className: 'completed' },
  refunding: { label: '退款中', className: 'pending' },
  refunded: { label: '已退款', className: 'completed' },
  no_show: { label: '未到', className: 'no-show' },
  rejected: { label: '已婉拒', className: 'cancelled' },
  cancelled: { label: '已取消', className: 'cancelled' }
};

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseDateKey(value) {
  return new Date(`${value}T12:00:00`);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date) {
  const dayOffset = (date.getDay() + 6) % 7;
  return addDays(date, -dayOffset);
}

function priceNumber(price) {
  return Number(String(price || 0).replace(/[^\d]/g, '')) || 0;
}

function formatMoney(value) {
  return `NT$${Number(value || 0).toLocaleString()}`;
}

export function RestBlockModal({ cursor, selectedDate, onClose, onCreate }) {
  const [mode, setMode] = useState('month');
  const [restCursor, setRestCursor] = useState(cursor);
  const [selectedDates, setSelectedDates] = useState(() => new Set([selectedDate]));
  const [label, setLabel] = useState('休假');

  const year = restCursor.getFullYear();
  const month = restCursor.getMonth();
  const monthLabel = `${year} 年 ${month + 1} 月`;
  const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - mondayOffset + 1);
    return {
      date,
      key: dateKey(date),
      isCurrentMonth: date.getMonth() === month
    };
  });

  const toggleDate = (key) => {
    setSelectedDates(prev => {
      if (mode === 'single') return new Set([key]);
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const applyWeeklyMode = () => {
    const base = parseDateKey(selectedDate);
    const dates = Array.from({ length: 4 }, (_, index) => dateKey(addDays(base, index * 7)));
    setSelectedDates(new Set(dates));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'single') setSelectedDates(new Set([selectedDate]));
    if (nextMode === 'weekly') applyWeeklyMode();
  };

  const handleCreate = () => {
    const dates = Array.from(selectedDates).sort();
    if (dates.length === 0) {
      alert('請先選擇要休息的日期。');
      return;
    }
    onCreate(dates, label || '休假');
    onClose();
  };

  return (
    <div className="rest-modal-backdrop" role="dialog" aria-modal="true">
      <div className="rest-modal">
        <div className="rest-modal-header">
          <h2>新增休息時段</h2>
          <button type="button" onClick={onClose} aria-label="關閉">×</button>
        </div>

        <div className="rest-mode-switch">
          <button type="button" className={mode === 'single' ? 'active' : ''} onClick={() => handleModeChange('single')}>單次</button>
          <button type="button" className={mode === 'weekly' ? 'active' : ''} onClick={() => handleModeChange('weekly')}>每週重複</button>
          <button type="button" className={mode === 'month' ? 'active' : ''} onClick={() => handleModeChange('month')}>整月挑日子</button>
        </div>

        <div className="rest-month-switcher">
          <button type="button" onClick={() => setRestCursor(new Date(year, month - 1, 1))}>‹</button>
          <strong>{monthLabel}</strong>
          <button type="button" onClick={() => setRestCursor(new Date(year, month + 1, 1))}>›</button>
        </div>

        <div className="rest-calendar">
          {['一', '二', '三', '四', '五', '六', '日'].map(day => <span key={day}>{day}</span>)}
          {cells.map(cell => {
            const isSelected = selectedDates.has(cell.key);
            return (
              <button
                key={cell.key}
                type="button"
                className={`${cell.isCurrentMonth ? '' : 'outside'}${isSelected ? ' selected' : ''}`}
                onClick={() => toggleDate(cell.key)}
              >
                {cell.date.getDate()}
              </button>
            );
          })}
        </div>

        <p className="rest-help">點選要休假的日子，可以不連續多天。已選 {selectedDates.size} 天。</p>

        <label className="rest-label-field">
          <span>標籤</span>
          <input value={label} onChange={event => setLabel(event.target.value)} placeholder="休假" />
        </label>

        <div className="rest-label-chips">
          {['午休', '休假', '私事', '進修'].map(item => (
            <button key={item} type="button" onClick={() => setLabel(item)}>{item}</button>
          ))}
        </div>

        <div className="rest-summary">
          {mode === 'single' ? '單日休息' : mode === 'weekly' ? `每週重複 ${selectedDates.size} 次` : `整月挑 ${selectedDates.size} 天`} · 全天
        </div>

        <div className="rest-modal-actions">
          <button type="button" onClick={onClose}>取消</button>
          <button type="button" className="primary" onClick={handleCreate}>建立</button>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleCalendar({ appointments = [], scheduleDatabase = {}, studioName, onGoToRequests, onUpdateStatus, onReschedule }) {
  const now = new Date();
  const todayKey = dateKey(now);
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [viewMode, setViewMode] = useState('week');
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showSideCalendar, setShowSideCalendar] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLabel = `${year} 年 ${month + 1} 月`;

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce((groups, appointment) => {
      if (!groups[appointment.date]) groups[appointment.date] = [];
      groups[appointment.date].push(appointment);
      groups[appointment.date].sort((a, b) => a.time.localeCompare(b.time));
      return groups;
    }, {});
  }, [appointments]);

  const calendarCells = useMemo(() => {
    const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(year, month, index - mondayOffset + 1);
      return {
        date,
        key: dateKey(date),
        isCurrentMonth: date.getMonth() === month
      };
    });
  }, [month, year]);

  const monthAppointments = appointments
    .filter(item => item.date?.startsWith(monthKey) && !['rejected', 'cancelled'].includes(item.status))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const agendaGroups = Object.entries(
    monthAppointments.reduce((groups, item) => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
      return groups;
    }, {})
  );

  const selectedDateAppointments = (appointmentsByDate[selectedDate] || [])
    .filter(item => !['rejected', 'cancelled'].includes(item.status));
  const selectedDateRevenue = selectedDateAppointments
    .filter(item => ['approved', 'paid', 'completed'].includes(item.status))
    .reduce((sum, item) => sum + priceNumber(item.price), 0);
  const selectedWeekStart = startOfWeek(parseDateKey(selectedDate));
  const selectedWeek = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(selectedWeekStart, index);
    const key = dateKey(date);
    return {
      key,
      date,
      count: (appointmentsByDate[key] || []).filter(item => !['rejected', 'cancelled'].includes(item.status)).length,
      isClosed: Object.hasOwn(scheduleDatabase, key) && scheduleDatabase[key].length === 0
    };
  });
  const weekHours = Array.from({ length: 10 }, (_, index) => `${String(index + 10).padStart(2, '0')}:00`);
  const dayHours = Array.from({ length: 13 }, (_, index) => `${String(index + 10).padStart(2, '0')}:00`);
  const selectedWeekAppointments = selectedWeek.flatMap(day => (
    (appointmentsByDate[day.key] || []).filter(item => !['rejected', 'cancelled'].includes(item.status))
  ));
  const weekRevenue = selectedWeekAppointments
    .filter(item => ['approved', 'paid', 'completed'].includes(item.status))
    .reduce((sum, item) => sum + priceNumber(item.price), 0);
  const weekLabel = `${new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric' }).format(selectedWeek[0].date)} – ${new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric' }).format(selectedWeek[6].date)}`;

  const moveMonth = (offset) => {
    const next = new Date(year, month + offset, 1);
    setCursor(next);
    setSelectedDate(dateKey(next));
    setSelectedAppointment(null);
  };

  const goToday = () => {
    setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayKey);
    setSelectedAppointment(null);
  };

  const moveWeek = (offset) => {
    chooseDate(dateKey(addDays(parseDateKey(selectedDate), offset * 7)));
  };

  const chooseDate = (key) => {
    const date = parseDateKey(key);
    setSelectedDate(key);
    setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    setSelectedAppointment(null);
  };

  const askReschedule = (appointment) => {
    const nextDate = window.prompt('請輸入新的日期（YYYY-MM-DD）', appointment.date);
    if (!nextDate) return;
    const nextTime = window.prompt('請輸入新的時間（例如 14:30）', appointment.time);
    if (!nextTime) return;
    onReschedule?.(appointment.id, nextDate, nextTime);
    setSelectedAppointment(prev => prev ? { ...prev, date: nextDate, time: nextTime } : prev);
  };

  const renderSideCalendarPanel = () => (
    <aside className="week-side-panel">
      <div className="mini-calendar-card">
        <div className="mini-calendar-title">
          <button type="button" onClick={() => moveMonth(-1)}>‹</button>
          <strong>{monthLabel}</strong>
          <button type="button" onClick={() => moveMonth(1)}>›</button>
        </div>
        <div className="mini-calendar-grid">
          {['一', '二', '三', '四', '五', '六', '日'].map(day => <span key={day}>{day}</span>)}
          {calendarCells.map(cell => (
            <button
              key={cell.key}
              type="button"
              className={`${cell.isCurrentMonth ? '' : 'outside'}${cell.key === selectedDate ? ' selected' : ''}${cell.key === todayKey ? ' today' : ''}`}
              onClick={() => chooseDate(cell.key)}
            >
              {cell.date.getDate()}
            </button>
          ))}
        </div>
      </div>

      <div className="week-summary-card">
        <strong>今日 {new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' }).format(parseDateKey(selectedDate))}</strong>
        <div className="summary-statuses compact">
          <span><i className="summary-dot approved" />{selectedDateAppointments.length} 個預約</span>
          <span><i className="summary-dot confirmed" />{selectedDateAppointments.filter(item => ['approved', 'paid'].includes(item.status)).length} 已確認</span>
          <span><i className="summary-dot pending" />{selectedDateAppointments.filter(item => item.status === 'pending').length} 待確認</span>
        </div>
        <div className="week-money-row">
          <span>今日</span><strong>{formatMoney(selectedDateRevenue)}</strong>
          <span>本週</span><strong>{formatMoney(weekRevenue)}</strong>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="stylist-schedule">
      <div className="calendar-app-frame content-only">
        <main className="calendar-main-area">
          <div className="calendar-hero-row">
            <div>
              <span>{studioName || 'yyc nail'}</span>
              <h2>我的行程表</h2>
            </div>
          </div>

          <div className="calendar-controls">
            <div className="view-switch" aria-label="行程顯示方式">
              <button type="button" className={viewMode === 'agenda' ? 'active' : ''} onClick={() => setViewMode('agenda')}>行程</button>
              <button type="button" className={viewMode === 'day' ? 'active' : ''} onClick={() => setViewMode('day')}>日</button>
              <button type="button" className={viewMode === 'week' ? 'active' : ''} onClick={() => setViewMode('week')}>週</button>
              <button type="button" className={viewMode === 'month' ? 'active' : ''} onClick={() => setViewMode('month')}>月</button>
            </div>
            <div className="month-switcher week-nav">
              <button type="button" onClick={() => viewMode === 'week' ? moveWeek(-1) : moveMonth(-1)} aria-label="上一段">‹</button>
              <button type="button" className="today-button" onClick={goToday}>今天</button>
              <button type="button" onClick={() => viewMode === 'week' ? moveWeek(1) : moveMonth(1)} aria-label="下一段">›</button>
              <strong>{viewMode === 'week' ? weekLabel : monthLabel}</strong>
              {['day', 'week', 'month'].includes(viewMode) && (
                <button
                  type="button"
                  className={`side-calendar-toggle${showSideCalendar ? ' active' : ''}`}
                  onClick={() => setShowSideCalendar(prev => !prev)}
                >
                  月曆
                </button>
              )}
            </div>
          </div>

          {showSideCalendar && (
            <div className="calendar-popover-panel">
              {renderSideCalendarPanel()}
            </div>
          )}

          {viewMode === 'week' ? (
        <div className="week-calendar-layout">
          <div className="week-grid-card">
            <div className="week-schedule-grid">
              <div className="week-grid-corner" />
              {selectedWeek.map(day => (
                <button
                  key={day.key}
                  type="button"
                  className={`week-grid-head${day.key === selectedDate ? ' selected' : ''}${day.key === todayKey ? ' today' : ''}`}
                  onClick={() => chooseDate(day.key)}
                >
                  <span>{new Intl.DateTimeFormat('zh-TW', { weekday: 'short' }).format(day.date)}</span>
                  <strong>{day.date.getMonth() + 1}/{day.date.getDate()}</strong>
                </button>
              ))}
              {weekHours.map(hour => (
                <React.Fragment key={hour}>
                  <div className="week-time-cell">{hour}</div>
                  {selectedWeek.map(day => {
                    const isClosed = day.isClosed || day.date.getDay() === 0;
                    const hourAppointments = (appointmentsByDate[day.key] || [])
                      .filter(item => !['rejected', 'cancelled'].includes(item.status))
                      .filter(item => item.time?.slice(0, 2) === hour.slice(0, 2));
                    return (
                      <div key={`${day.key}-${hour}`} className={`week-slot-cell${isClosed ? ' closed' : ''}`}>
                        {isClosed ? <span className="week-closed-text">公休</span> : hourAppointments.map(item => {
                          const meta = statusMeta[item.status] || statusMeta.pending;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              className={`week-event-pill ${meta.className}`}
                              onClick={() => { chooseDate(day.key); setSelectedAppointment(item); }}
                            >
                              <span>{item.time}</span>
                              <strong>{item.service || '美甲預約'}</strong>
                              <small>{item.customerName} · {meta.label}</small>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>
      ) : viewMode === 'day' ? (
        <div className="single-day-timeline-card">
          <div className="single-day-grid">
            <div className="single-day-corner" />
            <div className="single-day-heading">
              {new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', weekday: 'short' }).format(parseDateKey(selectedDate))}
            </div>
            {Object.hasOwn(scheduleDatabase, selectedDate) && scheduleDatabase[selectedDate].length === 0 && (
              <div className="single-day-closed-banner">公休</div>
            )}
            {dayHours.map(hour => {
              const hourAppointments = selectedDateAppointments.filter(item => item.time?.slice(0, 2) === hour.slice(0, 2));
              return (
                <React.Fragment key={hour}>
                  <div className="single-day-time"><span>{hour}</span></div>
                  <div className="single-day-slot">
                    {hourAppointments.map(item => {
                      const meta = statusMeta[item.status] || statusMeta.pending;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`single-day-event ${meta.className}`}
                          onClick={() => setSelectedAppointment(item)}
                        >
                          <strong>{item.time} {item.customerName}</strong>
                          <span>{item.service}</span>
                        </button>
                      );
                    })}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'month' ? (
        <div className="month-calendar-wrap">
          <div className="month-calendar">
            {['週一', '週二', '週三', '週四', '週五', '週六', '週日'].map(day => (
              <div className="calendar-weekday" key={day}>{day}</div>
            ))}
            {calendarCells.map(cell => {
              const dayAppointments = appointmentsByDate[cell.key] || [];
              const isClosed = Object.hasOwn(scheduleDatabase, cell.key) && scheduleDatabase[cell.key].length === 0;
              const isSelected = selectedDate === cell.key;
              return (
                <div
                  key={cell.key}
                  className={`calendar-day${cell.isCurrentMonth ? '' : ' outside'}${cell.key === todayKey ? ' today' : ''}${isClosed ? ' closed' : ''}${isSelected ? ' selected' : ''}`}
                  onClick={() => chooseDate(cell.key)}
                >
                  <div className="calendar-day-number">
                    <span>{cell.date.getDate()}</span>
                    {cell.key === todayKey && <small>今天</small>}
                  </div>
                  {isClosed && <div className="closed-label">休息</div>}
                  <div className="calendar-events">
                    {dayAppointments.slice(0, 3).map(item => {
                      const meta = statusMeta[item.status] || statusMeta.pending;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`calendar-event ${meta.className}`}
                          onClick={event => { event.stopPropagation(); chooseDate(cell.key); setSelectedAppointment(item); }}
                        >
                          <span>{item.time}</span>
                          <strong>{item.customerName}</strong>
                        </button>
                      );
                    })}
                    {dayAppointments.length > 3 && <span className="more-events">+{dayAppointments.length - 3} 更多</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="agenda-list">
          {agendaGroups.length > 0 ? agendaGroups.map(([date, items]) => (
            <section className="agenda-day" key={date}>
              <div className="agenda-date">
                <strong>{new Intl.DateTimeFormat('zh-TW', { month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00`))}</strong>
                <span>{new Intl.DateTimeFormat('zh-TW', { weekday: 'long' }).format(new Date(`${date}T12:00:00`))}</span>
              </div>
              <div className="agenda-items">
                {items.map(item => {
                  const meta = statusMeta[item.status] || statusMeta.pending;
                  return (
                    <button key={item.id} type="button" className={`agenda-item ${meta.className}`} onClick={() => { chooseDate(date); setSelectedAppointment(item); }}>
                      <span className="agenda-time">{item.time}</span>
                      <span className="agenda-copy"><strong>{item.customerName}</strong><small>{item.service}</small></span>
                      <span className="agenda-status">{meta.label}</span>
                      <strong className="agenda-price">{item.price}</strong>
                    </button>
                  );
                })}
              </div>
            </section>
          )) : <div className="calendar-empty">這個月目前沒有預約。</div>}
        </div>
      )}

      {viewMode !== 'day' && (
      <aside className="day-detail-panel">
        <div className="detail-panel-heading">
          <div>
            <span>選取日期</span>
            <strong>{selectedDate}</strong>
          </div>
          <span>{(appointmentsByDate[selectedDate] || []).length} 筆</span>
        </div>

        {selectedAppointment ? (
          <div className="appointment-detail">
            <div className="appointment-detail-top">
              <div>
                <span className={`detail-status ${(statusMeta[selectedAppointment.status] || statusMeta.pending).className}`}>
                  {(statusMeta[selectedAppointment.status] || statusMeta.pending).label}
                </span>
                <h3>{selectedAppointment.customerName}</h3>
              </div>
              <strong>{selectedAppointment.price}</strong>
            </div>
            <dl>
              <div><dt>時間</dt><dd>{selectedAppointment.date} {selectedAppointment.time}</dd></div>
              <div><dt>服務</dt><dd>{selectedAppointment.service}</dd></div>
              {selectedAppointment.depositAmount && <div><dt>訂金</dt><dd>{selectedAppointment.depositAmount}</dd></div>}
              {selectedAppointment.remainingAmount && <div><dt>尾款</dt><dd>{selectedAppointment.remainingAmount}</dd></div>}
              {selectedAppointment.styleRequest && <div><dt>款式</dt><dd>{selectedAppointment.styleRequest}</dd></div>}
              {selectedAppointment.needsRemoval && <div><dt>卸甲</dt><dd>需要卸甲</dd></div>}
              {selectedAppointment.allergyNote && <div><dt>過敏</dt><dd>{selectedAppointment.allergyNote}</dd></div>}
              {selectedAppointment.contactInfo && <div><dt>聯絡</dt><dd>{selectedAppointment.contactInfo}</dd></div>}
              {selectedAppointment.customerNote && <div><dt>備註</dt><dd>{selectedAppointment.customerNote}</dd></div>}
              <div><dt>預約編號</dt><dd>NL-{selectedAppointment.id.slice(0, 8).toUpperCase()}</dd></div>
            </dl>
            <div className="appointment-actions">
              {['pending', 'paid'].includes(selectedAppointment.status) && <button type="button" onClick={onGoToRequests}>前往預約審核</button>}
              {selectedAppointment.status === 'approved' && <button type="button" onClick={() => onUpdateStatus?.(selectedAppointment.id, 'completed')}>標記完成</button>}
              {['approved', 'paid'].includes(selectedAppointment.status) && <button type="button" onClick={() => askReschedule(selectedAppointment)}>改期</button>}
              {selectedAppointment.status === 'refunding' && <button type="button" onClick={() => onUpdateStatus?.(selectedAppointment.id, 'refunded')}>標記已退款</button>}
            </div>
          </div>
        ) : (
          <div className="detail-placeholder">點選月曆中的預約，可以查看完整內容。</div>
        )}
      </aside>
      )}

        </main>
      </div>
    </div>
  );
}
