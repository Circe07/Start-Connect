export const kpiEvents = {
  homeCtaPrimaryClicked: 'home_cta_primary_clicked',
  experiencesCardClicked: 'experiences_card_clicked',
  experienceDetailViewed: 'experience_detail_viewed',
  bookingFormStarted: 'booking_form_started',
  bookingFormSubmitted: 'booking_form_submitted',
  bookingConfirmedViewed: 'booking_confirmed_viewed',
  bookingWhatsappClicked: 'booking_whatsapp_clicked',
  paymentStepStarted: 'payment_step_started',
} as const;

type EventName = (typeof kpiEvents)[keyof typeof kpiEvents];

export async function trackKpiEvent(
  eventName: EventName,
  params?: Record<string, string | number | boolean>
) {
  try {
    const analytics = (await import('@react-native-firebase/analytics')).default;
    await analytics().logEvent(eventName, params);
  } catch {
    // Keep UX flow resilient even if analytics provider is unavailable.
    // eslint-disable-next-line no-console
    console.log(`[kpi-event] ${eventName}`, params || {});
  }
}
