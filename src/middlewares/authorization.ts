const errorsFactory = require('../utils/errorsHandling').factory;

// Middleware that enforces and verifies 'Authorization' header or 'auth' query parameter.
// 
module.exports = (settings: any) => {
  return (req: express$Request, res: express$Response, next: express$NextFunction) => {
    const auth = req.headers.authorization || req.query.auth;
    if (auth == null) {
      return next(errorsFactory.unauthorized("Missing 'Authorization' header or 'auth' query parameter."));
    }
    
    const validAuth = settings.get('leader:auth');
    if (validAuth == null || auth !== validAuth) {
      return next(errorsFactory.unauthorized('Invalid authorization key.'));
    }

    next();
  };
};
