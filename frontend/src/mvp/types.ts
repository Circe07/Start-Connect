export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'cancelled'
  | 'attended'
  | 'no-show';

export type TimesPlayedOption =
  | 'never'
  | '1-3'
  | '4-10'
  | '10-25'
  | 'occasional_no_fixed_group';

export interface Experience {
  id: string;
  name: string;
  club: string;
  area: string;
  address: string;
  dateLabel: string;
  timeLabel: string;
  durationLabel: string;
  levelLabel: string;
  spotsAvailable: number;
  spotsTotal: number;
  priceLabel: string;
  included: string[];
  hostName?: string;
  promise: string;
  whoIsFor: string[];
  whoIsNotFor: string[];
  cancellationPolicy: string;
}

export interface Booking {
  id: string;
  experienceId: string;
  experienceName: string;
  club: string;
  dateLabel: string;
  timeLabel: string;
  hostName?: string;
  instructions: string;
  status: BookingStatus;
}

export interface BookingFormValues {
  name: string;
  age: string;
  barcelonaArea: string;
  timesPlayed: TimesPlayedOption;
  whatsapp: string;
  comingMode: 'alone' | 'with_someone';
}
