import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/application/decorators/roles.decorator';
import { UsersService } from 'src/modules/users/application/services/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoleNames = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoleNames || requiredRoleNames.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = await this.usersService.findOne({
      where: { id: request.user.eamil },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return requiredRoleNames.some((role) => user.lastUsedRole?.includes(role));
  }
}
