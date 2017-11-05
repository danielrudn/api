import { Router } from 'express';
import Fingerprint from 'express-fingerprint';
import wrap from '../../wrap';
import * as Errors from '../errors';
import UserService from '../services/user-service';
import TokenService from '../services/token-service';

const authRouter = Router();

export const authenticate = wrap(async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader || authHeader.match(/Bearer .*[.].*[.].*$/i) === null) {
    throw Errors.BadCredentialsError(
      'Missing Authorization header in the form: "Authorization: Bearer <jwt>"'
    );
  }
  const token = authHeader.substring('Bearer '.length);
  const verifiedUser = TokenService.verifyToken(token);
  try {
    req.user = (await UserService.findById(verifiedUser.id)).toJSON();
    delete req.user.password;
  } catch (err) {
    throw Errors.BadTokenError();
  }
  if (req.user.isGuest || req.user.activated) {
    next();
  } else {
    throw Errors.AccountNotActivatedError();
  }
});

const getUserAccessToken = user => {
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      city: user.city
    },
    accessToken: TokenService.signToken(
      { id: user.id, username: user.username },
      '30m'
    )
  };
};

const getUserRefreshToken = (user, fingerprint) => {
  return TokenService.signOneUseToken({
    id: user.id,
    username: user.username
  });
};

const generateUserResult = (user, fingerprint) => {
  return Object.assign(getUserAccessToken(user), {
    refreshToken: getUserRefreshToken(user, fingerprint)
  });
};

authRouter.post(
  '/',
  Fingerprint(),
  wrap(async (req, res) => {
    const { email, username, password } = req.body;
    if (!email && !username && !password) {
      const guest = await UserService.createGuest(req.fingerprint, req.ip);
      res.status(201).json(guest);
    } else {
      const data = await UserService.createUser(
        email,
        username,
        password,
        req.ip
      );
      const activationToken = TokenService.signOneUseToken({
        id: data.user.id
      });
      // TODO: send activation email
      res.status(201).json({
        message:
          "Account Created. We've sent an email to you containing activation instructions."
      });
    }
  })
);

authRouter.post(
  '/activate',
  Fingerprint(),
  wrap(async (req, res) => {
    const { token } = req.body;
    const user = await UserService.activateUser(token);
    res.status(200).json(generateUserResult(user, req.fingerprint));
  })
);

authRouter.post(
  '/login',
  Fingerprint(),
  wrap(async (req, res) => {
    const { emailOrUsername, password } = req.body;
    const user = await UserService.findByEmailOrUsername(emailOrUsername);
    if (!user.isGuest && (await user.comparePassword(password))) {
      if (user.activated) {
        res.status(200).json(generateUserResult(user, req.fingerprint));
      } else {
        throw Errors.AccountNotActivatedError();
      }
    } else {
      throw Errors.BadUserCredentialsError();
    }
  })
);

authRouter.post(
  '/refresh',
  Fingerprint(),
  wrap(async (req, res) => {
    const { refreshToken } = req.body;
    const verifiedUser = await TokenService.verifyOneUseToken(refreshToken);
    const user = await UserService.findById(verifiedUser.id);
    if (user.updatedAt - verifiedUser.iat < 0) {
      res.status(200).json(generateUserResult(user, req.fingerprint));
    } else {
      throw Errors.BadCredentialsError(
        'This user has been updated since their last login. Please login again.'
      );
    }
  })
);

authRouter.post(
  '/forgot',
  wrap(async (req, res) => {
    const { email } = req.body;
    try {
      const user = await UserService.findByEmail(email);
      const resetToken = TokenService.signOneUseToken({ id: user.id }, '1d');
      // TODO: send reset email
    } finally {
      res.status(200).json({
        message: `If an account for "${email ||
          ''}" exists, an email to reset the password has been sent.`
      });
    }
  })
);

authRouter.post(
  '/reset/:token',
  wrap(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const verifiedUser = await TokenService.verifyOneUseToken(token);
    const user = await UserService.findById(verifiedUser.id);
    user.password = password;
    await user.save();
    res.status(200).json({
      message: 'Password updated. Login with new password.'
    });
  })
);

authRouter.get('/me', authenticate, (req, res) => {
  res.status(200).json(req.user);
});

export default authRouter;
