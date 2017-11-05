import TokenService from '../src/v1/services/token-service';

const activationToken = TokenService.signOneUseToken({ id: 'unactivated' });
const resetToken = TokenService.signOneUseToken({ id: 'reset' });
const refreshToken = TokenService.signOneUseToken(
  { id: 'refresh' },
  '365d',
  Date.now() + 10000
);
const refreshToken2 = TokenService.signOneUseToken(
  { id: '11111111-111-11111111' },
  '365d',
  Date.now() + 10000
);
const oldRefreshToken = TokenService.signOneUseToken({ id: 'refresh' });
const accessToken = TokenService.signToken(
  { id: '11111111-111-11111111', username: 'tester' },
  '30m'
);
const unactivatedAccessToken = TokenService.signToken(
  { id: '22222222-222-22222222', username: 'tester2' },
  '30m'
);

const guestAccessToken = TokenService.signToken(
  { id: 'guest_1111', username: 'guest_1111' },
  '30m'
);

export default {
  activationToken,
  resetToken,
  refreshToken,
  refreshToken2,
  oldRefreshToken,
  accessToken,
  unactivatedAccessToken,
  guestAccessToken
};
