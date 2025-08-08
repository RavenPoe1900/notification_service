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

/* Alias tipado que siempre reflejará el SELECT */
export type UserPrismaPayload = Prisma.UserGetPayload<
  typeof userArgsWithoutPassword
>;

/* --- Tipos planos para relaciones --- */
type UserRolePayload = { role: Role };

@Injectable()
export class PrismaUserToDtoProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      /* ───── Sub-mapas (relaciones) ───── */
      createMap<UserRolePayload, UserRoleDetailDto>(
        mapper,
        'UserRole',
        UserRoleDetailDto,
      );      

      /* ───── Mapa principal Prisma → DTO ───── */
      createMap<UserPrismaPayload, UserResponseDto>(
        mapper,
        'User',
        UserResponseDto,

        // (opcional) ignorar password si alguna vez se incluyera
        forMember(() => (({}) as any).password, ignore()),

        forMember(
          (d) => d.roles,
          mapWith(UserRoleDetailDto, 'UserRole', (s) => s.roles),
        ),
      );
    };
  }
}
