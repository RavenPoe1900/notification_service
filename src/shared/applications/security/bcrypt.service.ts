import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PasswordHasherPort } from '../../domain/interfaces/password-hasher.port';

@Injectable()
export class BcryptHasherService implements PasswordHasherPort {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS ?? '10', 10),
    );
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
