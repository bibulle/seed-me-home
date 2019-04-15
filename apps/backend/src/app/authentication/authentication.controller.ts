import { Controller, Get, HttpException, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('authentication')
export class AuthenticationController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req) {
    const jwt: string = req.user.jwt;
    if (jwt) {
      return {
        id_token: jwt
      };
    } else {
      throw new HttpException('Something go wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //  @Get('protected')
  //  @UseGuards(AuthGuard('jwt'))
  //  protectedResource() {
  //    return 'JWT is working!';
  //  }
}
