import models from '../../src/models';
import TokenService from '../../src/v1/services/token-service';

const activationToken = TokenService.signOneUseToken({ id: 'activateme' });
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
const guestAccessToken = TokenService.signToken(
  { id: 'guest_1111', username: 'guest_1111' },
  '30m'
);

let userTokens = {};

export const initTokens = async () => {
  const users = await models.User.findAll();
  users.forEach(user => {
    const access = TokenService.signToken(
      { id: user.id, username: user.username },
      '30m'
    );
    userTokens[user.id] = access;
  });
};

export default {
  activationToken,
  resetToken,
  refreshToken,
  refreshToken2,
  oldRefreshToken,
  accessToken,
  guestAccessToken,
  userTokens
};
