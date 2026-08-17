import { prisma } from '../config/prisma.js';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findPublicById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  },

  create(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({ data, select: publicUserSelect });
  },
};
