import {
  createMap,
  forMember,
  mapFrom,
  ignore,
  mapWith,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';

import { Prisma, Role, TripStatus, VehicleType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { UserRoleDetailDto } from '../../application/dtos/user-role-detail.dto';
import { VehicleSummaryDto } from '../../application/dtos/vehicle-summary.dto';
import { CarrierAccountSummaryDto } from '../../application/dtos/carrier-account-summary.dto';
import { RatingDetailDto } from '../../application/dtos/rating-detail.dto';
import { UserResponseDto } from '../../application/dtos/user-response.dto';
import { userSelectWithoutPassword } from '../prisma/user.select';
import { TripSummaryDto } from '../../application/dtos/trip-summary.dto';

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
type TripPayload = { id: number; status: TripStatus; totalAmount: Decimal };
type VehiclePayload = { id: number; plate: string; type: VehicleType };
type CarrierAccountPayload = { id: number; balance: Decimal; currency: string };
type RatingPayload = { id: number; stars: number; comment: string | null };

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

      createMap<TripPayload, TripSummaryDto>(
        mapper,
        'Trip',
        TripSummaryDto,
        forMember(
          (d) => d.totalAmount,
          mapFrom((s) => s.totalAmount.toNumber()),
        ),
      );

      createMap<VehiclePayload, VehicleSummaryDto>(
        mapper,
        'Vehicle',
        VehicleSummaryDto,
      );

      createMap<CarrierAccountPayload, CarrierAccountSummaryDto>(
        mapper,
        'CarrierAccount',
        CarrierAccountSummaryDto,
        forMember(
          (d) => d.balance,
          mapFrom((s) => s.balance.toNumber()),
        ),
      );

      createMap<RatingPayload, RatingDetailDto>(
        mapper,
        'Rating',
        RatingDetailDto,
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
