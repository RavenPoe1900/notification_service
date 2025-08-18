import type { Request } from 'express';
import { type IPayload } from './payload.interface';

export interface RequestWithUser extends Request {
  user: IPayload;
}
