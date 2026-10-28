import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Req,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginInput, RegisterTenantInput } from "@hishab/shared";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { LoginSchema, RegisterTenantSchema } from "@hishab/shared";
import { Public } from "../../common/decorators/auth.decorators";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(LoginSchema)) input: LoginInput, @TenantId() tenantId: string | undefined) {
    return this.authService.login(input, tenantId);
  }

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Body(new ZodValidationPipe(RegisterTenantSchema)) input: RegisterTenantInput) {
    return this.authService.register(input);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) {
    return this.authService.logout(req.user?.sub);
  }

  @Get("me")
  me(@Req() req: any) {
    return req.user;
  }
}
