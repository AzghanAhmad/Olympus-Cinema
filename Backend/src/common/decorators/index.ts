import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../constants';
import { UserRole } from '@prisma/client';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export { CurrentUser, ClientIp } from './current-user.decorator';
export type { JwtPayloadUser } from './current-user.decorator';
