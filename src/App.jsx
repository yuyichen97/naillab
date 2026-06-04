import React, { useState, useEffect } from 'react';
import './App.css';
import CustomerHome from './pages/Customer/Home';
import CustomerBookingFlow from './pages/Customer/BookingFlow';
import CustomerRegisterFlow from './pages/Customer/RegisterFlow';
import StylistDashboard from './pages/Stylist/Dashboard';
import StylistPortfolio from './pages/Stylist/Portfolio';
import StylistCalendarSetting from './pages/Stylist/CalendarSetting';
import AppointmentRequests from './pages/Stylist/AppointmentRequests';

const colors = {
  primary: '#560A0C',
  secondary: '#A45D65',
  accent: '#CCA2A4',
  background: '#EAD4D6',
  white: '#ffffff',
  dark: '#2c0506'
};

function App() {
  const [role, setRole] = useState('customer');
  const [customerTab, setCustomerTab] = useState('home');
  const [stylistTab, setStylistTab] = useState('dashboard');

  // 全局排班數據庫
  const [scheduleDatabase, setScheduleDatabase] = useState({
    '2026-06-04': ['09:00', '10:00', '11:00'],
    '2026-06-05': ['14:00', '15:00'],
  });

  // 美甲師已確定的行程表
  const [appointments, setAppointments] = useState([
    { id: 1, time: '11:00', customerName: '陳圓圓', service: '法式優雅緣條', price: '$1500', status: '已付款' }
  ]);

  // 待處理預約請求
  const [requests, setRequests] = useState([
    { id: 101, customerName: '王筑筑', date: '2026-06-04', time: '11:00', service: '精緻微奢晶石貓眼', price: '$1600' }
  ]);

  // 持久化數據
  useEffect(() => {
    const saved = localStorage.getItem('naillab_data');
    if (saved) {
      const data = JSON.parse(saved);
      setScheduleDatabase(data.schedule || scheduleDatabase);
      setAppointments(data.appointments || appointments);
      setRequests(data.requests || requests);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('naillab_data', JSON.stringify({
      schedule: scheduleDatabase,
      appointments,
      requests
    }));
  }, [scheduleDatabase, appointments, requests]);

  const handleApprove = (id) => {
    const target = requests.find(r => r.id === id);
    if (target) {
      setAppointments([...appointments, {
        id: Date.now(),
        time: target.time,
        customerName: target.customerName,
        service: target.service,
        price: target.price,
        status: '已付款'
      }]);
      setRequests(requests.filter(r => r.id !== id));
      alert('✅ 已接受預約！');
      setStylistTab('dashboard');
    }
  };

  const handleReject = (id) => {
    setRequests(requests.filter(r => r.id !== id));
    alert('❌ 已拒絕該預約。');
    setStylistTab('dashboard');
  };

  const handleNewBooking = (newOrder) => {
    const newRequest = {
      id: Date.now(),
      ...newOrder
    };
    setRequests([...requests, newRequest]);
    alert('✅ 預約申請已送出！請靜待美甲師審核。');
    setCustomerTab('home');
  };

  return (
    <div className="app-container">
      {/* Header with role toggle */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">💅 NailLab 美甲預約平台</h1>
          <div className="role-toggle">
            <button 
              className={`role-btn ${role === 'customer' ? 'active' : ''}`}
              onClick={() => setRole('customer')}
            >
              📱 客戶端
            </button>
            <button 
              className={`role-btn ${role === 'stylist' ? 'active' : ''}`}
              onClick={() => setRole('stylist')}
            >
              💅 美甲師
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        
        {/* ================= 消費者端 ================= */}
        {role === 'customer' && (
          <>
            {/* Navigation */}
            <nav className="customer-nav">
              <button 
                className={`nav-btn ${customerTab === 'home' ? 'active' : ''}`}
                onClick={() => setCustomerTab('home')}
              >
                🧭 探索
              </button>
              <button 
                className={`nav-btn ${customerTab === 'booking' ? 'active' : ''}`}
                onClick={() => setCustomerTab('booking')}
              >
                ✨ 預約
              </button>
              <button 
                className={`nav-btn ${customerTab === 'favorite' ? 'active' : ''}`}
                onClick={() => setCustomerTab('favorite')}
              >
                💖 收藏
              </button>
              <button 
                className={`nav-btn ${customerTab === 'profile' ? 'active' : ''}`}
                onClick={() => setCustomerTab('profile')}
              >
                👤 帳戶
              </button>
            </nav>

            {/* Content */}
            <div className="content-area">
              {customerTab === 'home' && <CustomerHome />}
              {customerTab === 'booking' && (
                <CustomerBookingFlow 
                  stylistSchedule={scheduleDatabase}
                  onSubmitBooking={handleNewBooking}
                  onBack={() => setCustomerTab('home')}
                />
              )}
              {customerTab === 'favorite' && (
                <div className="content-section">
                  <h2>💖 我的收藏</h2>
                  <p>暫無收藏內容</p>
                </div>
              )}
              {customerTab === 'profile' && <CustomerRegisterFlow />}
            </div>
          </>
        )}

        {/* ================= 美甲師端 ================= */}
        {role === 'stylist' && (
          <>
            {/* Navigation */}
            <nav className="stylist-nav">
              <button 
                className={`nav-btn ${stylistTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setStylistTab('dashboard')}
              >
                📊 工作台
              </button>
              <button 
                className={`nav-btn ${stylistTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setStylistTab('calendar')}
              >
                📅 排班
              </button>
              <button 
                className={`nav-btn ${stylistTab === 'portfolio' ? 'active' : ''}`}
                onClick={() => setStylistTab('portfolio')}
              >
                🖼️ 作品
              </button>
              <button 
                className={`nav-btn ${stylistTab === 'requests' ? 'active' : ''}`}
                onClick={() => setStylistTab('requests')}
              >
                📬 預約請求 ({requests.length})
              </button>
            </nav>

            {/* Content */}
            <div className="content-area">
              {stylistTab === 'dashboard' && (
                <StylistDashboard 
                  appointments={appointments} 
                  requestCount={requests.length} 
                  onGoToRequests={() => setStylistTab('requests')} 
                />
              )}
              {stylistTab === 'calendar' && (
                <StylistCalendarSetting 
                  scheduleDatabase={scheduleDatabase}
                  setScheduleDatabase={setScheduleDatabase}
                />
              )}
              {stylistTab === 'portfolio' && <StylistPortfolio />}
              {stylistTab === 'requests' && (
                <AppointmentRequests 
                  requests={requests}
                  handleApprove={handleApprove}
                  handleReject={handleReject}
                  onBack={() => setStylistTab('dashboard')}
                />
              )}
            </div>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2026 NailLab 美甲預約平台 | 響應式設計 RWD</p>
      </footer>
    </div>
  );
}

export default App;