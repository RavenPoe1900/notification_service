import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Prisma, Role, User } from '@prisma/client';
import { LoginResponseDto } from 'src/auth/application/dtos/login-response.dto';
import { LoginDto } from 'src/auth/application/dtos/login.dto';
import { SignUpDto } from 'src/auth/application/dtos/sign-up.dto';
import { UsersService } from 'src/modules/users/application/services/users.service';
import { BcryptHasherService } from 'src/shared/applications/security/bcrypt.service';
import { IPayload } from 'src/shared/domain/interfaces/payload.interface';
import { AuthServicePort } from './auth.service.port';

@Injectable()
export class AuthService implements AuthServicePort{
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly bcryptHasherService: BcryptHasherService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const findUser: Prisma.UserFindUniqueArgs = {
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
      if (e instanceof Error && e.message === 'Entity not found') {
        throw new UnauthorizedException();
      }
      throw e;
    }

    const ok = await this.bcryptHasherService.compare(loginDto.password, user.password);
    if (!ok) throw new UnauthorizedException();

    const payload: IPayload = { id: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<void> {
    const role: Role = signUpDto.role ?? Role.SHIPPER;

    const data: Prisma.UserCreateArgs = {
      data: {
        email: signUpDto.email,
        password: await this.bcryptHasherService.hash(signUpDto.password),
        lastUsedRole: role,
        roles: { create: { role } },
      },
    };

    await this.usersService.create(data);
  }

  async changeUser(userId: number, role: Role): Promise<void> {
    const whereById: Prisma.UserWhereUniqueInput = { id: userId };

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
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw e;
    }
  }
}
