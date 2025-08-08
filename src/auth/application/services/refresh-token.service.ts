import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { RefreshToken } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new refresh token for a user
   * @param userId The user ID
   * @param expiresIn Expiration time in seconds
   * @returns The created refresh token
   */
  async createRefreshToken(userId: number, expiresIn: number): Promise<RefreshToken> {
    const token = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  /**
   * Finds a refresh token by its token value
   * @param token The refresh token string
   * @returns The refresh token with user data or null
   */
  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Revokes a specific refresh token
   * @param token The refresh token to revoke
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Revokes all refresh tokens for a specific user
   * @param userId The user ID
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { 
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Checks if a refresh token is valid (not revoked and not expired)
   * @param refreshToken The refresh token to validate
   * @returns True if valid, false otherwise
   */
  async isTokenValid(refreshToken: RefreshToken): Promise<boolean> {
    return (
      refreshToken.revokedAt === null &&
      refreshToken.expiresAt > new Date()
    );
  }

  /**
   * Cleans up expired refresh tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Generates a cryptographically secure random token
   * @returns A random hex string
   */
  private generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }
} 