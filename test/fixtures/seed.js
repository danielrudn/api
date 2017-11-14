import fs from 'fs';
import path from 'path';
import models from '../../src/models';
import TokenService from '../../src/v1/services/token-service';

let tokens = {},
  userTokens = {};

const initTokens = async () => {
  tokens.activationToken = TokenService.signOneUseToken({ id: 'activateme' });
  tokens.resetToken = TokenService.signOneUseToken({ id: 'reset' });
  tokens.refreshToken = TokenService.signOneUseToken(
    { id: 'refresh' },
    '365d',
    Date.now() + 10000
  );
  tokens.refreshToken2 = TokenService.signOneUseToken(
    { id: '11111111-111-11111111' },
    '365d',
    Date.now() + 10000
  );
  tokens.oldRefreshToken = TokenService.signOneUseToken(
    { id: 'refresh' },
    '365d',
    Date.now() - 100000
  );
  tokens.accessToken = TokenService.signToken(
    { id: '11111111-111-11111111', username: 'tester' },
    '30m'
  );
  tokens.guestAccessToken = TokenService.signToken(
    { id: 'guest_1111', username: 'guest_1111' },
    '30m'
  );
  const users = await models.User.findAll();
  users.forEach(user => {
    const access = TokenService.signToken(
      { id: user.id, username: user.username },
      '30m'
    );
    userTokens[user.id] = access;
  });
};

export const init = async () => {
  await initTokens();
};

export default {
  tokens,
  userTokens
};
