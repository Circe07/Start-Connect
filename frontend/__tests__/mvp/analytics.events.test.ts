import { kpiEvents } from '../../src/mvp/analytics/events';

describe('mvp kpi events', () => {
  test('contains primary funnel events', () => {
    expect(kpiEvents.homeCtaPrimaryClicked).toBe('home_cta_primary_clicked');
    expect(kpiEvents.experiencesCardClicked).toBe('experiences_card_clicked');
    expect(kpiEvents.experienceDetailViewed).toBe('experience_detail_viewed');
    expect(kpiEvents.bookingFormStarted).toBe('booking_form_started');
    expect(kpiEvents.bookingFormSubmitted).toBe('booking_form_submitted');
  });

  test('contains post-confirmation conversion events', () => {
    expect(kpiEvents.bookingConfirmedViewed).toBe('booking_confirmed_viewed');
    expect(kpiEvents.bookingWhatsappClicked).toBe('booking_whatsapp_clicked');
    expect(kpiEvents.paymentStepStarted).toBe('payment_step_started');
  });
});
