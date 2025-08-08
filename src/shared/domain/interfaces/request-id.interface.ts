import type { Request } from 'express';
import { IPayload } from './payload.interface';

export interface RequestWithUser extends Request {
  user: IPayload;
}
