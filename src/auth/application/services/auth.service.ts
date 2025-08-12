import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Role, User } from '@prisma/client';
import { LoginResponseDto } from 'src/auth/application/dtos/login-response.dto';
import { LoginDto } from 'src/auth/application/dtos/login.dto';
import { SignUpDto } from 'src/auth/application/dtos/sign-up.dto';
import { RefreshTokenDto } from 'src/auth/application/dtos/refresh-token.dto';
import { UsersService } from 'src/modules/users/application/services/users.service';
import { BcryptHasherService } from 'src/shared/applications/security/bcrypt.service';
import { RefreshTokenService } from './refresh-token.service';
import { IPayload } from 'src/shared/domain/interfaces/payload.interface';
import { AuthServicePort } from './auth.service.port';

@Injectable()
export class AuthService implements AuthServicePort {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly bcryptHasherService: BcryptHasherService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const findUser = {
      where: { email: loginDto.email },
      select: {
        id: true,
        password: true,
        roles: { select: { role: true } },
      },
    };

    let user: User;
    try {
      user = await this.usersService.findOne(findUser);
    } catch (e: unknown) {
      if (e instanceof Error && (e.message === 'Entity not found' || e.message === 'Item not found') ) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw e;
    }

    const isPasswordValid = await this.bcryptHasherService.compare(
      loginDto.password,
      user.password,
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: IPayload = { id: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    
    // Create refresh token
    const refreshTokenExpiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800); // 7 days
    const { token: refreshToken } = await this.refreshTokenService.createRefreshToken(
      user.id,
      refreshTokenExpiresIn,
    );

    const accessTokenExpiresIn = this.configService.get<number>('JWT_EXPIRES_IN', 3600); // 1 hour

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: accessTokenExpiresIn,
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<LoginResponseDto> {
    const role: Role = Role.USER;

    const data = {
      data: {
        email: signUpDto.email,
        password: await this.bcryptHasherService.hash(signUpDto.password),
        lastUsedRole: role,
        roles: { create: { role } },
      },
    };

    const user = await this.usersService.create(data);
    
    // Generate tokens for new user
    const payload: IPayload = { id: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    
    const refreshTokenExpiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800);
    const { token: refreshToken } = await this.refreshTokenService.createRefreshToken(
      user.id,
      refreshTokenExpiresIn,
    );

    const accessTokenExpiresIn = this.configService.get<number>('JWT_EXPIRES_IN', 3600);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: accessTokenExpiresIn,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<LoginResponseDto> {
    const { refresh_token } = refreshTokenDto;

    const tokenRecord = await this.refreshTokenService.findRefreshToken(refresh_token);
    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await this.refreshTokenService.isTokenValid(tokenRecord);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token is expired or revoked');
    }

    // Revoke the current refresh token
    await this.refreshTokenService.revokeRefreshToken(refresh_token);

    // Generate new tokens
    const payload: IPayload = { id: tokenRecord.userId };
    const accessToken = await this.jwtService.signAsync(payload);
    
    const refreshTokenExpiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800);
    const { token: newRefreshToken } = await this.refreshTokenService.createRefreshToken(
      tokenRecord.userId,
      refreshTokenExpiresIn,
    );

    const accessTokenExpiresIn = this.configService.get<number>('JWT_EXPIRES_IN', 3600);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      expires_in: accessTokenExpiresIn,
    };
  }

  async logout(userId: number): Promise<void> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  async changeUser(userId: number, role: Role): Promise<void> {
    const whereById = { id: userId };

    try {
      await this.usersService.update(
        { where: whereById },
        {
          where: whereById,
          data: { lastUsedRole: role },
        },
      );
    } catch (e: unknown) {
      if (
        e instanceof Error && e.message.includes('P2025')
      ) {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }
}
