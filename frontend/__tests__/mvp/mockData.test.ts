import { mvpBookings, mvpExperiences } from '../../src/mvp/data/mockData';

describe('mvp mock data', () => {
  test('has at least one beginner experience with required booking fields', () => {
    const exp = mvpExperiences[0];
    expect(exp).toBeDefined();
    expect(exp.name).toContain('Beginner');
    expect(exp.club.length).toBeGreaterThan(0);
    expect(exp.spotsTotal).toBeGreaterThan(0);
    expect(exp.included.length).toBeGreaterThan(0);
  });

  test('has booking status represented', () => {
    const booking = mvpBookings[0];
    expect(booking).toBeDefined();
    expect(['pending', 'confirmed', 'paid', 'cancelled', 'attended', 'no-show']).toContain(
      booking.status
    );
  });
});
