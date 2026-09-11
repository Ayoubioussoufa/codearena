import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../users/domain/user.entity';

export const ROLES_KEY = 'roles';

/** Writes the required roles onto the route; RolesGuard reads them back. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
