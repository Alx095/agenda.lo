import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role, User } from '../generated/prisma/client';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: SafeUser;
};

export type RegisterResponse = {
  message: string;
  email: string;
  emailSent: boolean;
};

export type MessageResponse = {
  message: string;
};

type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
  type: 'access';
};

type RefreshTokenPayload = {
  sub: string;
  type: 'refresh';
};

type EmailVerificationPayload = {
  sub: string;
  type: 'email_verification';
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;
  private readonly emailVerificationExpiresIn = '24h';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.accessTokenExpiresIn = this.configService.getOrThrow<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    this.refreshTokenExpiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const email = registerDto.email.toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.saltRounds,
    );

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email,
        password: hashedPassword,
        emailVerified: false,
      },
    });

    const emailSent = await this.sendVerificationEmailSafe(user);

    return {
      message: emailSent
        ? 'Registro exitoso. Revisa tu correo y confirma tu cuenta antes de iniciar sesión.'
        : 'Registro exitoso, pero no pudimos enviar el correo de verificación. Usa "Reenviar correo" o contacta soporte.',
      email: user.email,
      emailSent,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const email = loginDto.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.assertEmailVerified(user);

    return this.buildAuthResponse(user);
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    const payload = this.verifyEmailVerificationToken(token);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (user.emailVerified) {
      return this.buildAuthResponse(user);
    }

    const verifiedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    return this.buildAuthResponse(verifiedUser);
  }

  async resendVerificationEmail(email: string): Promise<MessageResponse> {
    const normalizedEmail = email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.emailVerified) {
      return {
        message:
          'Si el correo existe y no está verificado, recibirás un nuevo enlace.',
      };
    }

    await this.sendVerificationEmailSafe(user);

    return {
      message:
        'Si el correo existe y no está verificado, recibirás un nuevo enlace.',
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const payload = this.verifyRefreshToken(refreshTokenDto.refresh_token);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshTokenDto.refresh_token,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.assertEmailVerified(user);

    return this.buildAuthResponse(user);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  private async sendVerificationEmailSafe(user: User): Promise<boolean> {
    const token = this.signEmailVerificationToken(user.id);
    const verificationUrl = this.buildVerificationUrl(token);

    const sent = await this.emailService.sendEmailVerificationEmail({
      to: user.email,
      userName: user.name,
      verificationUrl,
    });

    if (!sent) {
      this.logger.warn(
        `Verification email not sent to ${user.email}. Link: ${verificationUrl}`,
      );
    }

    return sent;
  }

  private buildVerificationUrl(token: string): string {
    const appUrl =
      this.configService.get<string>('APP_URL')?.trim() ||
      `http://localhost:${this.configService.get<string>('PORT') ?? '3000'}`;

    return `${appUrl.replace(/\/$/, '')}/auth/verify-email?token=${encodeURIComponent(token)}`;
  }

  private signEmailVerificationToken(userId: string): string {
    const payload: EmailVerificationPayload = {
      sub: userId,
      type: 'email_verification',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.emailVerificationExpiresIn as JwtSignOptions['expiresIn'],
    });
  }

  private verifyEmailVerificationToken(
    token: string,
  ): EmailVerificationPayload {
    try {
      const payload = this.jwtService.verify<EmailVerificationPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid or expired verification token');
      }

      return payload;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  private assertEmailVerified(user: User): void {
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Debes confirmar tu correo antes de iniciar sesión',
      );
    }
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const accessToken = this.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    });

    const refreshToken = this.signRefreshToken(user.id);
    const refreshTokenHash = await bcrypt.hash(refreshToken, this.saltRounds);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: this.toSafeUser(user),
    };
  }

  private signAccessToken(payload: AccessTokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.accessTokenExpiresIn as JwtSignOptions['expiresIn'],
    });
  }

  private signRefreshToken(userId: string): string {
    const payload: RefreshTokenPayload = {
      sub: userId,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.refreshTokenExpiresIn as JwtSignOptions['expiresIn'],
    });
  }

  private verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
