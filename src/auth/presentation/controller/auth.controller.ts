import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { Public } from '../../application/decorators/public.decorator';
import { LoginDto } from '../../application/dtos/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { LoginResponseDto } from '../../application/dtos/login-response.dto';
import { SignUpResponseDto } from '../../application/dtos/sign-up-response.dto';
import { LogoutResponseDto } from '../../application/dtos/logout-response.dto';
import { ApiResponseSwagger } from 'src/shared/domain/swagger/response.swagger';
import { genericSwagger } from 'src/shared/domain/swagger/http.swagger';
import { IPayload } from 'src/shared/domain/interfaces/payload.interface';
import { SignUpDto } from '../../application/dtos/sign-up.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { ChangeUserDto } from '../../application/dtos/chance-role.dto';
import { RequestWithUser } from 'src/shared/domain/interfaces/request-id.interface';
import { AuthService } from '../../application/services/auth.service';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Authenticates a user.
   * @param credentials DTO containing the user's login credentials.
   * @returns The authentication token and user information or an error.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(
    genericSwagger(LoginResponseDto, 'Login', 'Return accesstoken'),
  )
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Registers a new user.
   * @param body DTO containing the user's registration information.
   * @returns The created user information with tokens or an error.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(
    genericSwagger(LoginResponseDto, 'Sign Up', 'Return access token and refresh token'),
  )
  @Post('signUp')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  /**
   * Refreshes the access token using a refresh token.
   * @param body DTO containing the refresh token.
   * @returns New access and refresh tokens or an error.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(
    genericSwagger(LoginResponseDto, 'Refresh Token', 'Return new access and refresh tokens'),
  )
  @Post('refresh')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  /**
   * Logs out the current user by revoking all refresh tokens.
   * @param req Request object containing user information.
   * @returns Success message or an error.
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(
    genericSwagger(LogoutResponseDto, 'Logout', 'User logged out successfully'),
  )
  @Post('logout')
  logout(@Request() req: RequestWithUser) {
    return this.authService.logout(req.user.id);
  }

  /**
   * Retrieves or updates the user profile.
   * @param userId The ID of the user whose profile is being accessed or updated.
   * @param body Optional DTO containing the updated profile information.
   * @returns The user profile information or an error.
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(
    genericSwagger(SignUpResponseDto, 'Profile', 'Return Profile'),
  )
  @Get('profile')
  getProfile(@Request() req: RequestWithUser): IPayload {
    return req.user;
  }

  /**
   * Retrieves or updates the user profile.
   * @param userId The ID of the user whose profile is being accessed or updated.
   * @param body Optional DTO containing the updated profile information.
   * @returns The user profile information or an error.
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(
    genericSwagger(SignUpResponseDto, 'Profile', 'Return Profile'),
  )
  @Post('change_role')
  changeRole(
    @Request() req: RequestWithUser,
    @Body() changeUserDto: ChangeUserDto,
  ) {
    return this.authService.changeUser(req.user.id, changeUserDto.role);
  }
}
