import { BadRequestError } from '../errors';

export default (minLimit = 5, maxLimit = 50) => {
  return (req, res, next) => {
    let { page, limit } = req.query;
    page = parseInt(page || 1);
    limit = parseInt(limit || minLimit);
    if (page < 1 || Number.isNaN(page)) {
      throw BadRequestError('Page number must be positive.');
    } else if (limit < minLimit || Number.isNaN(limit)) {
      throw BadRequestError(
        `Limit must be greater than or equal to ${minLimit}.`
      );
    } else if (limit > maxLimit) {
      throw new BadRequestError(
        `Limit must be less than or equal to ${maxLimit}.`
      );
    }

    const prevQuery = Object.keys(req.query)
      .filter(key => key !== 'page')
      .map(key => `&${key}=${req.query[key]}`)
      .reduce((a, b) => a + b, '');
    req.query.page = page;
    req.query.limit = limit;
    let path = req.originalUrl;
    if (path.includes('?')) {
      path = path.substring(0, path.indexOf('?'));
    }
    req.query.nextPageUrl = `${path}?page=${page + 1}${prevQuery}`;
    next();
  };
};
