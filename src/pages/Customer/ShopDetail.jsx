import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import './ShopDetail.css';

const fallbackImage = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&auto=format&fit=crop';
const defaultReviews = [
  {
    id: 'default-review-1',
    name: '王小姐',
    rating: 5,
    comment: '溝通很細心，修型跟顏色都很乾淨，整體服務很舒服。',
    date: '2026-06-03'
  },
  {
    id: 'default-review-2',
    name: '林小姐',
    rating: 4.8,
    comment: '貓眼折射很漂亮，工作室氣氛安靜，會想再回訪。',
    date: '2026-06-01'
  }
];

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ShopDetail({ studio, onBack, onSubmitBooking }) {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [previewImageIndex, setPreviewImageIndex] = useState(null);
  const [slotAvailability, setSlotAvailability] = useState({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('LINE Pay');
  const [styleRequest, setStyleRequest] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [needsRemoval, setNeedsRemoval] = useState(false);
  const [allergyNote, setAllergyNote] = useState('');
  const [customerReviews, setCustomerReviews] = useState(defaultReviews);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const studioName = studio?.name || studio?.studioName || '美甲工作室';
  const studioAddress = studio?.address || studio?.location || '台北市大安區';
  const portfolioImages = studio?.portfolioImages || [];
  const services = studio?.services || [];
  const availableSchedule = studio?.schedule || {};
  const today = localDateString();
  const availableDates = Object.keys(availableSchedule)
    .filter(date => date >= today && (availableSchedule[date] || []).length > 0)
    .sort();
  const [calendarMonth, setCalendarMonth] = useState((availableDates[0] || today).slice(0, 7));

  const [calendarYear, calendarMonthNumber] = calendarMonth.split('-').map(Number);
  const monthDayCount = new Date(calendarYear, calendarMonthNumber, 0).getDate();
  const monthStartOffset = new Date(calendarYear, calendarMonthNumber - 1, 1).getDay();
  const monthDays = Array.from({ length: monthDayCount }, (_, index) => index + 1);
  const previewImage = previewImageIndex === null ? null : portfolioImages[previewImageIndex];
  const servicePrice = Number(selectedService?.price || 0);
  const depositSettings = studio?.depositSettings || {};
  const isDepositRequired = depositSettings.enabled !== false;
  const depositType = depositSettings.type || 'percent';
  const depositValue = Number(depositSettings.value || 30);
  const refundHours = Number(depositSettings.refundHours || 24);
  const depositAmount = selectedService && isDepositRequired
    ? Math.min(servicePrice, depositType === 'fixed'
      ? Math.max(0, depositValue)
      : Math.max(0, Math.round((servicePrice * depositValue / 100) / 50) * 50))
    : 0;
  const remainingAmount = Math.max(servicePrice - depositAmount, 0);
  const reviewStorageKey = `nail-lab-reviews-${studio?.id || studioName}`;
  const reviewCount = customerReviews.length;
  const averageRating = reviewCount > 0
    ? (customerReviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviewCount).toFixed(1)
    : (studio.rating || '4.9');

  useEffect(() => {
    if (!selectedService || !selectedDate) {
      setSlotAvailability({});
      return undefined;
    }

    let cancelled = false;
    const loadSlots = async () => {
      setIsLoadingSlots(true);
      const fallback = Object.fromEntries((availableSchedule[selectedDate] || []).map(slot => [slot, true]));
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_shop_id: studio.id,
        p_work_date: selectedDate,
        p_duration_minutes: Number(selectedService.duration || 60)
      });

      if (cancelled) return;
      setSlotAvailability(error
        ? fallback
        : Object.fromEntries((data || []).map(item => [item.slot, item.is_available]))
      );
      setIsLoadingSlots(false);
    };

    loadSlots();
    return () => { cancelled = true; };
  }, [availableSchedule, selectedDate, selectedService, studio.id]);

  useEffect(() => {
    try {
      const savedReviews = JSON.parse(window.localStorage.getItem(reviewStorageKey) || '[]');
      setCustomerReviews(savedReviews.length > 0 ? savedReviews : defaultReviews);
    } catch {
      setCustomerReviews(defaultReviews);
    }
  }, [reviewStorageKey]);

  const selectService = (service) => {
    setSelectedService(service);
    setSelectedTime('');
    if (!selectedDate && availableDates[0]) {
      setSelectedDate(availableDates[0]);
      setCalendarMonth(availableDates[0].slice(0, 7));
    }
  };

  const changeMonth = (offset) => {
    const nextMonth = new Date(calendarYear, calendarMonthNumber - 1 + offset, 1);
    setCalendarMonth(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`);
    setSelectedDate('');
    setSelectedTime('');
  };

  const submitBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    const didSubmit = await onSubmitBooking({
      serviceId: selectedService.id,
      service: selectedService.name,
      price: `$${Number(selectedService.price || 0).toLocaleString()}`,
      duration: Number(selectedService.duration || 60),
      depositAmount,
      remainingAmount,
      depositPaid: true,
      paymentMethod,
      styleRequest,
      customerNote,
      contactInfo,
      needsRemoval,
      allergyNote,
      date: selectedDate,
      time: selectedTime
    });
    setIsSubmitting(false);

    if (didSubmit) {
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
      setStyleRequest('');
      setCustomerNote('');
      setContactInfo('');
      setNeedsRemoval(false);
      setAllergyNote('');
      setIsDepositModalOpen(false);
    }
  };

  const submitReview = (event) => {
    event.preventDefault();
    const cleanComment = reviewComment.trim();
    if (!cleanComment) return;

    const nextReview = {
      id: `review-${Date.now()}`,
      name: reviewName.trim() || '匿名顧客',
      rating: Number(reviewRating),
      comment: cleanComment,
      date: localDateString()
    };
    const nextReviews = [nextReview, ...customerReviews];
    setCustomerReviews(nextReviews);
    window.localStorage.setItem(reviewStorageKey, JSON.stringify(nextReviews));
    setReviewName('');
    setReviewRating(5);
    setReviewComment('');
  };

  const canSubmit = selectedService && selectedDate && selectedTime && !isSubmitting;

  return (
    <div className="booking-page">
      <button className="back-link" type="button" onClick={onBack}>‹ 返回探索</button>

      <header className="studio-profile">
        <div className="studio-profile-copy">
          <div className="studio-kicker">精選美甲工作室</div>
          <h1>{studioName}</h1>
          <p>{studioAddress} · ★ {averageRating} · 預約審核制</p>
          <div className="studio-tags">
            {(studio.tags || []).map(tag => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      </header>

      <section className="booking-section gallery-section" aria-labelledby="gallery-title">
        <div className="booking-section-heading">
          <div>
            <span className="step-label">作品</span>
            <h2 id="gallery-title">現場作品精選</h2>
          </div>
          <span className="section-meta">{portfolioImages.length} 張</span>
        </div>

        {portfolioImages.length > 0 ? (
          <div className="portfolio-strip">
            {portfolioImages.map((url, index) => (
              <button key={url} type="button" onClick={() => setPreviewImageIndex(index)} aria-label={`查看作品 ${index + 1}`}>
                <img src={url} alt={`美甲作品 ${index + 1}`} onError={event => { event.currentTarget.src = fallbackImage; }} />
              </button>
            ))}
          </div>
        ) : (
          <div className="inline-empty">店家尚未上傳作品</div>
        )}
      </section>

      <section className="booking-section review-section" aria-labelledby="review-title">
        <div className="booking-section-heading">
          <div>
            <span className="step-label">評價</span>
            <h2 id="review-title">顧客評論</h2>
          </div>
          <span className="section-meta">{reviewCount} 則</span>
        </div>

        <div className="review-summary">
          <div className="review-score">
            <strong>{averageRating}</strong>
            <span>平均評分</span>
          </div>
          <div className="review-stars" aria-label={`平均 ${averageRating} 星`}>
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className={star <= Math.round(Number(averageRating)) ? 'active' : ''}>★</span>
            ))}
          </div>
        </div>

        <form className="review-form" onSubmit={submitReview}>
          <div className="rating-picker" aria-label="選擇評分">
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                type="button"
                className={reviewRating === rating ? 'selected' : ''}
                onClick={() => setReviewRating(rating)}
              >
                {rating} 星
              </button>
            ))}
          </div>
          <input
            value={reviewName}
            onChange={event => setReviewName(event.target.value)}
            placeholder="你的暱稱（可不填）"
          />
          <textarea
            value={reviewComment}
            onChange={event => setReviewComment(event.target.value)}
            rows="3"
            placeholder="分享這次服務、款式溝通或工作室感受"
          />
          <button className="review-submit" type="submit" disabled={!reviewComment.trim()}>
            送出評論
          </button>
        </form>

        <div className="review-list">
          {customerReviews.map(review => (
            <article className="review-card" key={review.id}>
              <header>
                <div>
                  <strong>{review.name}</strong>
                  <span>{Number(review.rating).toFixed(1)} 星</span>
                </div>
                <time>{review.date}</time>
              </header>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="booking-section" aria-labelledby="service-title">
        <div className="booking-section-heading">
          <div>
            <span className="step-label">步驟 1</span>
            <h2 id="service-title">選擇服務</h2>
          </div>
          <span className="section-meta">單選</span>
        </div>

        <div className="service-list">
          {services.map(service => {
            const isSelected = selectedService?.id === service.id;
            return (
              <button
                key={service.id}
                type="button"
                className={isSelected ? 'service-row selected' : 'service-row'}
                aria-pressed={isSelected}
                onClick={() => selectService(service)}
              >
                <span className="service-select-mark" aria-hidden="true">{isSelected ? '✓' : ''}</span>
                <span className="service-copy">
                  <strong>{service.name}</strong>
                  <small>約 {service.duration || 60} 分鐘</small>
                </span>
                <strong className="service-price">NT${Number(service.price || 0).toLocaleString()}</strong>
              </button>
            );
          })}
          {services.length === 0 && <div className="inline-empty">店家尚未設定服務項目</div>}
        </div>
      </section>

      <section className={selectedService ? 'booking-section' : 'booking-section muted-section'} aria-labelledby="date-title">
        <div className="booking-section-heading">
          <div>
            <span className="step-label">步驟 2</span>
            <h2 id="date-title">選擇日期與時段</h2>
          </div>
          {selectedService && <span className="section-meta">{selectedService.name}</span>}
        </div>

        {!selectedService ? (
          <div className="inline-empty">先選擇一個服務，才會顯示可預約時段。</div>
        ) : (
          <div className="schedule-layout">
            <div className="calendar-panel">
              <div className="calendar-toolbar">
                <button type="button" onClick={() => changeMonth(-1)} aria-label="上個月">‹</button>
                <strong>{calendarYear} 年 {calendarMonthNumber} 月</strong>
                <button type="button" onClick={() => changeMonth(1)} aria-label="下個月">›</button>
              </div>
              <div className="booking-calendar">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => <span className="weekday" key={day}>{day}</span>)}
                {Array.from({ length: monthStartOffset }, (_, index) => <span key={`blank-${index}`} />)}
                {monthDays.map(day => {
                  const date = `${calendarMonth}-${String(day).padStart(2, '0')}`;
                  const isAvailable = date >= today && (availableSchedule[date] || []).length > 0;
                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={!isAvailable}
                      className={selectedDate === date ? 'selected' : ''}
                      onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                      aria-label={`${date}${isAvailable ? ' 可預約' : ' 未開放'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {availableDates.length === 0 && <p className="schedule-note">店家目前尚未開放未來班表</p>}
            </div>

            <div className="time-panel">
              <strong>{selectedDate || '請先選擇日期'}</strong>
              <div className="time-grid">
                {(availableSchedule[selectedDate] || []).map(time => {
                  const isPast = new Date(`${selectedDate}T${time}:00`) <= new Date();
                  const isTaken = slotAvailability[time] === false;
                  const disabled = isPast || isTaken || isLoadingSlots;
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={disabled}
                      className={selectedTime === time ? 'selected' : ''}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}{isTaken ? ' 已滿' : ''}
                    </button>
                  );
                })}
              </div>
              {selectedDate && (availableSchedule[selectedDate] || []).length === 0 && <p className="schedule-note">這天沒有開放時段</p>}
            </div>
          </div>
        )}
      </section>

      <section className="booking-section rules-section" aria-labelledby="rules-title">
        <div className="booking-section-heading">
          <div>
            <span className="step-label">預約須知</span>
            <h2 id="rules-title">到店前請留意</h2>
          </div>
        </div>
        {studio.announcement && (
          <div className="shop-info-box">
            <strong>店家公告</strong>
            <p>{studio.announcement}</p>
          </div>
        )}
        <p>{studio.rules || '目前店家尚未設定預約須知。'}</p>
        <div className="shop-policy-grid">
          <div>
            <span>營業地址</span>
            <strong>{studioAddress}</strong>
          </div>
          <div>
            <span>付款方式</span>
            <strong>{studio.paymentMethods || 'LINE Pay、轉帳、現金'}</strong>
          </div>
          <div>
            <span>取消規則</span>
            <strong>{studio.cancellationPolicy || '預約前 24 小時可取消並退還訂金。'}</strong>
          </div>
        </div>
      </section>

      <section className="booking-section note-section" aria-labelledby="note-title">
        <div className="booking-section-heading">
          <div>
            <span className="step-label">步驟 3</span>
            <h2 id="note-title">預約備註</h2>
          </div>
          <span className="section-meta">讓美甲師提前準備</span>
        </div>

        <div className="booking-note-grid">
          <label>
            <span>想做的款式</span>
            <input value={styleRequest} onChange={event => setStyleRequest(event.target.value)} placeholder="例如：裸粉貓眼、法式、想參考某張作品" />
          </label>
          <label>
            <span>IG / LINE 聯絡方式</span>
            <input value={contactInfo} onChange={event => setContactInfo(event.target.value)} placeholder="例如：@naillab 或 LINE ID" />
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={needsRemoval} onChange={event => setNeedsRemoval(event.target.checked)} />
            <span>這次需要卸甲</span>
          </label>
          <label>
            <span>過敏提醒</span>
            <input value={allergyNote} onChange={event => setAllergyNote(event.target.value)} placeholder="例如：對凝膠、酒精或金屬飾品過敏" />
          </label>
          <label className="wide-field">
            <span>其他備註</span>
            <textarea value={customerNote} onChange={event => setCustomerNote(event.target.value)} rows="3" placeholder="例如：希望款式偏短、工作關係不能太亮、當天可能提早到" />
          </label>
        </div>
      </section>

      <section className={selectedService ? 'booking-section deposit-section' : 'booking-section deposit-section muted-section'} aria-labelledby="deposit-title">
        <div className="booking-section-heading">
          <div>
            <span className="step-label">步驟 4</span>
            <h2 id="deposit-title">支付預約訂金</h2>
          </div>
          <span className="section-meta">{isDepositRequired ? `取消 ${refundHours} 小時前可退` : '此店家未開啟訂金'}</span>
        </div>

        {selectedService ? (
          <div className="deposit-card">
            <div>
              <span>本次服務金額</span>
              <strong>NT${servicePrice.toLocaleString()}</strong>
            </div>
            <div>
              <span>需先支付訂金</span>
              <strong>{isDepositRequired ? `NT${depositAmount.toLocaleString()}` : '免訂金'}</strong>
            </div>
            <div>
              <span>到店尾款</span>
              <strong>NT${remainingAmount.toLocaleString()}</strong>
            </div>
          </div>
        ) : (
          <div className="inline-empty">選好服務後，會自動計算訂金。</div>
        )}
      </section>

      <div className="booking-summary-bar">
        <div className="booking-summary-copy">
          <span>{selectedService ? `${selectedService.name} · ${selectedService.duration || 60} 分鐘` : '尚未選擇服務'}</span>
          <strong>{selectedService ? `NT$${Number(selectedService.price || 0).toLocaleString()}` : '選好服務後繼續'}</strong>
        </div>
        <button type="button" disabled={!canSubmit} onClick={() => setIsDepositModalOpen(true)}>
          {isSubmitting ? '正在送出...' : selectedTime ? (isDepositRequired ? `確認並支付訂金 NT$${depositAmount.toLocaleString()}` : '確認預約申請') : '請選擇日期與時段'}
        </button>
      </div>

      {isDepositModalOpen && selectedService && (
        <div className="deposit-modal-backdrop" role="dialog" aria-modal="true" aria-label="訂金付款確認">
          <div className="deposit-modal">
            <button className="deposit-modal-close" type="button" onClick={() => setIsDepositModalOpen(false)} aria-label="關閉">×</button>
            <span className="deposit-kicker">DEPOSIT PAYMENT</span>
            <h2>確認預約內容</h2>
            <p>請確認店家、服務、時間、訂金與取消規則，送出後店家會收到預約申請。</p>

            <div className="deposit-total">
              <span>{isDepositRequired ? '本次需付訂金' : '本次預約訂金'}</span>
              <strong>{isDepositRequired ? `NT${depositAmount.toLocaleString()}` : '免訂金'}</strong>
            </div>

            <div className="payment-methods" aria-label="付款方式">
              {['LINE Pay', '信用卡', '轉帳'].map(method => (
                <button
                  key={method}
                  type="button"
                  className={paymentMethod === method ? 'selected' : ''}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="deposit-breakdown">
              <div><span>店家</span><strong>{studioName}</strong></div>
              <div><span>服務項目</span><strong>{selectedService.name}</strong></div>
              <div><span>預約時間</span><strong>{selectedDate} {selectedTime}</strong></div>
              <div><span>取消規則</span><strong>{isDepositRequired ? `預約前 ${refundHours} 小時可退訂金` : '不需訂金，依店家規則取消'}</strong></div>
              {styleRequest && <div><span>款式需求</span><strong>{styleRequest}</strong></div>}
              {needsRemoval && <div><span>卸甲</span><strong>需要卸甲</strong></div>}
              {allergyNote && <div><span>過敏提醒</span><strong>{allergyNote}</strong></div>}
              {contactInfo && <div><span>聯絡方式</span><strong>{contactInfo}</strong></div>}
              <div><span>到店尾款</span><strong>NT${remainingAmount.toLocaleString()}</strong></div>
            </div>

            <button className="deposit-pay-button" type="button" disabled={isSubmitting} onClick={submitBooking}>
              {isSubmitting ? '送出中...' : (isDepositRequired ? '完成訂金付款並送出' : '送出預約申請')}
            </button>
            <small>目前為專題展示版付款流程，正式上線時可串接綠界、藍新或 Stripe。</small>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="image-viewer" role="dialog" aria-modal="true" aria-label="作品圖片預覽" onClick={() => setPreviewImageIndex(null)}>
          <button className="viewer-close" type="button" onClick={() => setPreviewImageIndex(null)} aria-label="關閉圖片">×</button>
          {portfolioImages.length > 1 && (
            <>
              <button className="viewer-prev" type="button" onClick={event => { event.stopPropagation(); setPreviewImageIndex((previewImageIndex - 1 + portfolioImages.length) % portfolioImages.length); }} aria-label="上一張">‹</button>
              <button className="viewer-next" type="button" onClick={event => { event.stopPropagation(); setPreviewImageIndex((previewImageIndex + 1) % portfolioImages.length); }} aria-label="下一張">›</button>
            </>
          )}
          <img src={previewImage} alt="作品大圖" onClick={event => event.stopPropagation()} onError={event => { event.currentTarget.src = fallbackImage; }} />
          <span className="viewer-count">{previewImageIndex + 1} / {portfolioImages.length}</span>
        </div>
      )}
    </div>
  );
}
