import { Prisma } from '@prisma/client';

export const userSelectWithoutPassword: Prisma.UserSelect = {
  id: true,
  email: true,
  phone: true,
  roles: {
    select: {
      role: true,
    },
  },
  lastUsedRole: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;
