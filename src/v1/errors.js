import util from 'util';

export default function HttpError(msg, status) {
  this.statusCode = status;
  this.message = msg;
}

export function BadRequestError(msg) {
  return new HttpError(msg, 400);
}

export function BadCredentialsError(msg) {
  return new HttpError(msg, 401);
}

export function BadTokenError() {
  return new BadCredentialsError(
    "The token provided has either expired or doesn't exist."
  );
}

export function BadUserCredentialsError() {
  return new BadCredentialsError('Username/email or password is incorrect.');
}

export function AccountNotActivatedError() {
  return new BadCredentialsError('Account is not activated.');
}

export function ForbiddenError(msg) {
  return new HttpError(msg, 403);
}

export function NotFoundError(msg) {
  return new HttpError(msg, 404);
}

export function RoomNotFoundError() {
  return new NotFoundError('Room with given id not found.');
}

util.inherits(HttpError, Error);
