import { type LoginDto } from '../dtos/login.dto';
import { type LoginResponseDto } from '../dtos/login-response.dto';
import { type SignUpDto } from '../dtos/sign-up.dto';
import { type RefreshTokenDto } from '../dtos/refresh-token.dto';
import { type Role } from '@prisma/client';

/**
 * Interface for the application's authentication service.
 * Defines the high-level operations that the presentation layer
 * can invoke to manage user authentication and registration.
 */
export interface AuthServicePort {
  /**
   * Authenticates a user with the provided credentials.
   * @param loginDto DTO containing email and password.
   * @returns A promise that resolves with the access token and user information.
   * @throws UnauthorizedException if credentials are invalid.
   * @throws NotFoundException if the user does not exist (though login should be more generic to prevent user enumeration).
   */
  login(loginDto: LoginDto): Promise<LoginResponseDto>;

  /**
   * Registers a new user in the system.
   * @param signUpDto DTO containing the user's registration information.
   * @returns A promise that resolves with the access token and refresh token.
   */
  signUp(signUpDto: SignUpDto): Promise<LoginResponseDto>;

  /**
   * Refreshes the access token using a refresh token.
   * @param refreshTokenDto DTO containing the refresh token.
   * @returns A promise that resolves with new access and refresh tokens.
   * @throws UnauthorizedException if the refresh token is invalid or expired.
   */
  refreshToken(refreshTokenDto: RefreshTokenDto): Promise<LoginResponseDto>;

  /**
   * Logs out a user by revoking all their refresh tokens.
   * @param userId The ID of the user to logout.
   * @returns A promise that resolves when the logout is complete.
   */
  logout(userId: number): Promise<void>;

  /**
   * Changes the role of an existing user.
   * @param userId The ID of the user whose role is to be changed.
   * @param role The new role to assign.
   * @returns A promise that resolves when the role has been updated.
   * @throws NotFoundException if the user does not exist.
   */
  changeUser(userId: number, role: Role): Promise<void>;
}
