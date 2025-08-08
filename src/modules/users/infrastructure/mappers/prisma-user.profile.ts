import {
  createMap,
  forMember,
  ignore,
  mapWith,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';

import { Prisma, Role } from '@prisma/client';
import { UserRoleDetailDto } from '../../application/dtos/user-role-detail.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { userSelectWithoutPassword } from '../prisma/user.select';

export const userArgsWithoutPassword =
  Prisma.validator<Prisma.UserDefaultArgs>()({
    select: userSelectWithoutPassword,
  });

/* Typed alias that will always reflect the SELECT */
export type UserPrismaPayload = Prisma.UserGetPayload<
  typeof userArgsWithoutPassword
>;

/* --- Plain types for relations --- */
type UserRolePayload = { role: Role };

@Injectable()
export class PrismaUserToDtoProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      /* ───── Sub-maps (relations) ───── */
      createMap<UserRolePayload, UserRoleDetailDto>(
        mapper,
        'UserRole',
        UserRoleDetailDto,
      );      

      /* ───── Main map Prisma → DTO ───── */
      createMap<UserPrismaPayload, UserResponseDto>(
        mapper,
        'User',
        UserResponseDto,

        // (optional) ignore password if it were ever included
        forMember(() => (({}) as any).password, ignore()),

        forMember(
          (d) => d.roles,
          mapWith(UserRoleDetailDto, 'UserRole', (s) => s.roles),
        ),
      );
    };
  }
}