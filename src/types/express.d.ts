import { IAuthUser } from '../app/modules/Auth/auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
    }
  }
}
