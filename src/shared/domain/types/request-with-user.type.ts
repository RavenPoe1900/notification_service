import { IPayload } from '../interfaces/payload.interface';

export type RequestWithUser = Request & {
  user: IPayload;
};
