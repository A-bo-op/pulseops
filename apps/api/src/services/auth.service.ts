import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { AuthResponse } from '@pulseops/shared';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError, notFound } from '../utils/app-error.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';

function signToken(user: { id: string; email: string }) {
  return jwt.sign({ email: user.email }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    if (await userRepository.findByEmail(input.email)) {
      throw new AppError(409, 'EMAIL_ALREADY_REGISTERED', 'An account already uses this email');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return { token: signToken(user), user: { ...user, createdAt: user.createdAt.toISOString() } };
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
    }

    return {
      token: signToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    };
  },

  async me(userId: string) {
    const user = await userRepository.findPublicById(userId);
    if (!user) throw notFound('USER_NOT_FOUND', 'User not found');
    return user;
  },
};
