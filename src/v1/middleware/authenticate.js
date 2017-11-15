import wrap from '../middleware/async-wrap';
import * as Errors from '../errors';
import UserService from '../services/user-service';
import TokenService from '../services/token-service';

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
