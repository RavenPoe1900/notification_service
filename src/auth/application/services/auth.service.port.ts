import { LoginDto } from '../dtos/login.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { Role } from '@prisma/client';

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
   * @returns A promise that resolves when the user has been registered.
   */
  signUp(signUpDto: SignUpDto): Promise<void>;

  /**
   * Changes the role of an existing user.
   * @param userId The ID of the user whose role is to be changed.
   * @param role The new role to assign.
   * @returns A promise that resolves when the role has been updated.
   * @throws NotFoundException if the user does not exist.
   */
  changeUser(userId: number, role: Role): Promise<void>;
}
