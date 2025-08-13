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
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Authenticates a user.
   * @param loginDto DTO containing the user's login credentials.
   * @returns The authentication token and user information.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(
    genericSwagger(LoginResponseDto, 'Login', 'Return access token and user information'),
  )
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Registers a new user.
   * @param signUpDto DTO containing the user's registration information.
   * @returns The created user information with tokens.
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
   * @param refreshTokenDto DTO containing the refresh token.
   * @returns New access and refresh tokens.
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
   * @returns Success message.
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
   * Retrieves the user profile.
   * @param req Request object containing user information.
   * @returns The user profile information.
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(
    genericSwagger(SignUpResponseDto, 'Profile', 'Return user profile'),
  )
  @Get('profile')
  getProfile(@Request() req: RequestWithUser): IPayload {
    return req.user;
  }

  /**
   * Changes the role of the current user.
   * @param req Request object containing user information.
   * @param changeUserDto DTO containing the new role.
   * @returns Success message.
   */
  @HttpCode(HttpStatus.OK)
  @ApiResponseSwagger(
    genericSwagger(SignUpResponseDto, 'Change Role', 'Role updated successfully'),
  )
  @Post('change_role')
  changeRole(
    @Request() req: RequestWithUser,
    @Body() changeUserDto: ChangeUserDto,
  ) {
    return this.authService.changeUser(req.user.id, changeUserDto.role);
  }
}
