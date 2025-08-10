import { UsersModule } from 'src/modules/users/users.module';
import { UserRoleModule } from 'src/modules/user-roles/user-roles.module';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

export const MODULES = [UsersModule, UserRoleModule, AuthModule, NotificationsModule];
