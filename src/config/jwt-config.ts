import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.SECRET || 'default-secret-key',
  global: true,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '48h',
  },
};
