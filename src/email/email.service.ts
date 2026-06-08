import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Appointment } from '../generated/prisma/client';

type SendAppointmentConfirmationParams = {
  to: string;
  userName: string;
  appointment: Appointment;
};

type SendEmailVerificationParams = {
  to: string;
  userName: string;
  verificationUrl: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY')?.trim();
    const fromEmail = this.configService.get<string>('EMAIL_FROM')?.trim();

    if (apiKey && fromEmail) {
      this.resend = new Resend(apiKey);
      this.fromEmail = fromEmail;
      this.logger.log(`Email delivery enabled (from: ${fromEmail})`);
    } else {
      this.resend = null;
      this.fromEmail = null;
      this.logger.warn(
        'Email delivery disabled: RESEND_API_KEY or EMAIL_FROM not configured',
      );
    }
  }

  async sendAppointmentConfirmationEmail(
    params: SendAppointmentConfirmationParams,
  ): Promise<void> {
    if (!this.resend || !this.fromEmail) {
      return;
    }

    if (!params.to?.trim()) {
      return;
    }

    const formattedDate = new Intl.DateTimeFormat('es', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(params.appointment.appointmentDate);

    const subject = `Cita confirmada: ${params.appointment.title}`;
    const text = [
      `Hola ${params.userName},`,
      '',
      'Tu cita fue registrada correctamente.',
      '',
      `Título: ${params.appointment.title}`,
      `Cliente: ${params.appointment.clientName}`,
      `Fecha: ${formattedDate}`,
      `Estado: ${params.appointment.status}`,
      params.appointment.description
        ? `Descripción: ${params.appointment.description}`
        : undefined,
      '',
      '— Agenda.lo',
    ]
      .filter(Boolean)
      .join('\n');

    const html = `
      <p>Hola <strong>${params.userName}</strong>,</p>
      <p>Tu cita fue registrada correctamente.</p>
      <ul>
        <li><strong>Título:</strong> ${params.appointment.title}</li>
        <li><strong>Cliente:</strong> ${params.appointment.clientName}</li>
        <li><strong>Fecha:</strong> ${formattedDate}</li>
        <li><strong>Estado:</strong> ${params.appointment.status}</li>
        ${
          params.appointment.description
            ? `<li><strong>Descripción:</strong> ${params.appointment.description}</li>`
            : ''
        }
      </ul>
      <p>— Agenda.lo</p>
    `.trim();

    try {
      this.logger.log(
        `Sending appointment confirmation email to ${params.to} (appointment: ${params.appointment.title})`,
      );

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject,
        text,
        html,
      });

      if (error) {
        this.logger.error(
          `Failed to send appointment confirmation email to ${params.to}: ${error.message} (code: ${error.name})`,
        );
        return;
      }

      this.logger.log(
        `Appointment confirmation email sent to ${params.to} (resendId: ${data?.id ?? 'unknown'})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send appointment confirmation email to ${params.to}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async sendEmailVerificationEmail(
    params: SendEmailVerificationParams,
  ): Promise<boolean> {
    if (!this.resend || !this.fromEmail) {
      this.logger.warn(
        `Email verification skipped for ${params.to}: email not configured`,
      );
      return false;
    }

    const subject = 'Confirma tu correo en Agenda.lo';
    const text = [
      `Hola ${params.userName},`,
      '',
      'Gracias por registrarte en Agenda.lo.',
      'Confirma tu correo haciendo clic en este enlace:',
      params.verificationUrl,
      '',
      'El enlace expira en 24 horas.',
      '',
      'Si no creaste esta cuenta, ignora este mensaje.',
      '',
      '— Agenda.lo',
    ].join('\n');

    const html = `
      <p>Hola <strong>${params.userName}</strong>,</p>
      <p>Gracias por registrarte en <strong>Agenda.lo</strong>.</p>
      <p>Confirma tu correo haciendo clic en el botón:</p>
      <p>
        <a href="${params.verificationUrl}" style="background:#2563EB;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">
          Confirmar correo
        </a>
      </p>
      <p>O copia este enlace en tu navegador:</p>
      <p><a href="${params.verificationUrl}">${params.verificationUrl}</a></p>
      <p>El enlace expira en 24 horas.</p>
      <p>— Agenda.lo</p>
    `.trim();

    try {
      this.logger.log(`Sending email verification to ${params.to}`);

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject,
        text,
        html,
      });

      if (error) {
        this.logger.error(
          `Failed to send verification email to ${params.to}: ${error.message} (code: ${error.name})`,
        );
        return false;
      }

      this.logger.log(
        `Verification email sent to ${params.to} (resendId: ${data?.id ?? 'unknown'})`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${params.to}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }
}
