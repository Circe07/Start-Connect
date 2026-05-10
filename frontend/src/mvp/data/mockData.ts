import { Booking, Experience } from '../types';

export const mvpExperiences: Experience[] = [
  {
    id: 'primer-set-sun-1700',
    name: 'Primer Set — Beginner Padel',
    club: 'Club X',
    area: 'Eixample, Barcelona',
    address: 'Carrer de Mallorca 123, Barcelona',
    dateLabel: 'Sunday',
    timeLabel: '17:00',
    durationLabel: '90 min',
    levelLabel: '0-10 games played',
    spotsAvailable: 2,
    spotsTotal: 4,
    priceLabel: '€19.99 all included',
    included: [
      'Court included',
      'In-person host',
      'Beginner-level group',
      'Pair rotation',
      'Zero pressure',
      'Possibility to repeat with similar group',
    ],
    hostName: 'Laura',
    promise:
      'For people who have played very little, do not have a group, or feel awkward joining a random match.',
    whoIsFor: [
      'You have played 0-10 times',
      'You want to start without pressure',
      'You do not have a group',
      'You want to meet people while playing',
      'You do not want to join a random match where everyone is better',
    ],
    whoIsNotFor: [
      'You already compete',
      'You are looking for an intense match',
      'You do not want to play with beginners',
      'You only want a high-performance session',
    ],
    cancellationPolicy: 'Free cancellation up to 24 hours before session start.',
  },
];

export const mvpBookings: Booking[] = [
  {
    id: 'booking-1',
    experienceId: 'primer-set-sun-1700',
    experienceName: 'Primer Set — Beginner Padel',
    club: 'Club X',
    dateLabel: 'Sunday',
    timeLabel: '17:00',
    hostName: 'Laura',
    instructions: 'Bring sports shoes and water. Arrive 15 minutes early.',
    status: 'pending',
  },
];
