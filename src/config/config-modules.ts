import { UsersModule } from 'src/modules/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { QueueModule } from 'src/shared/infrastructure/bull/queue.module';

export const MODULES = [UsersModule, AuthModule, NotificationsModule, QueueModule];
