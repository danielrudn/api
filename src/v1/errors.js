import util from 'util';

export default function HttpError(msg, status) {
  this.statusCode = status;
  this.message = msg;
}

export function BadRequestError(msg) {
  this.statusCode = 400;
  this.message = msg;
}

export function BadCredentialsError(msg) {
  this.statusCode = 401;
  this.message = msg;
}

export function ForbiddenError(msg) {
  this.statusCode = 403;
  this.message = msg;
}

export function NotFoundError(msg) {
  this.statusCode = 404;
  this.message = msg;
}

util.inherits(HttpError, Error);
util.inherits(BadRequestError, HttpError);
util.inherits(BadCredentialsError, HttpError);
util.inherits(ForbiddenError, HttpError);
util.inherits(NotFoundError, HttpError);
