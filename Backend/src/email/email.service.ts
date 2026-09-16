import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private smtp: Transporter | null = null;
  private from: string;

  constructor(private config: ConfigService) {
    this.from = this.config.get<string>(
      'EMAIL_FROM',
      'Crystal Entertainment <crystalmaldives@gmail.com>',
    );

    const smtpUser = this.config.get<string>('SMTP_USER');
    const smtpPass = this.config.get<string>('SMTP_PASS');
    const smtpHost = this.config.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const smtpPort = Number(this.config.get<string>('SMTP_PORT') ?? 587);

    if (smtpUser && smtpPass) {
      this.smtp = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ''),
        },
      });
      this.logger.log(`SMTP email configured via ${smtpHost}:${smtpPort}`);
    }

    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) this.resend = new Resend(apiKey);
  }

  private async send(to: string, subject: string, html: string) {
    if (this.smtp) {
      try {
        await this.smtp.sendMail({
          from: this.from,
          to,
          subject,
          html,
        });
        this.logger.log(`Email sent via SMTP to ${to}: ${subject}`);
      } catch (err) {
        this.logger.error(
          `SMTP send failed to ${to}: ${err instanceof Error ? err.message : String(err)}`,
        );
        throw err;
      }
      return;
    }

    if (this.resend) {
      await this.resend.emails.send({ from: this.from, to, subject, html });
      this.logger.log(`Email sent via Resend to ${to}: ${subject}`);
      return;
    }

    this.logger.warn(`[Email stub] To: ${to} | Subject: ${subject}`);
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    await this.send(
      email,
      'Welcome to Crystal Entertainment',
      `<p>Hi ${firstName}, welcome to our cinema platform!</p>`,
    );
  }

  async sendPasswordReset(email: string, token: string) {
    const frontend = this.config.get<string>('FRONTEND_URL');
    await this.send(
      email,
      'Password Reset',
      `<p>Reset your password: <a href="${frontend}/reset-password?token=${token}">Click here</a></p>`,
    );
  }

  async sendOtpCode(data: {
    email: string;
    code: string;
    purpose?: string;
  }) {
    const purpose = data.purpose || 'verification';
    await this.send(
      data.email,
      `Your Crystal Entertainment verification code`,
      `<p>Your ${purpose} code is:</p>
       <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${data.code}</p>
       <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`,
    );
  }

  async sendBookingConfirmation(data: {
    email: string;
    customerName: string;
    movieTitle: string;
    date: string;
    time: string;
    hall: string;
    seats: string[];
    bookingCode: string;
  }) {
    await this.send(
      data.email,
      `Booking Confirmation — ${data.bookingCode}`,
      `<p>Hi ${data.customerName},</p>
       <p>Your booking for <strong>${data.movieTitle}</strong> has been confirmed.</p>
       <p>Date: ${data.date} at ${data.time}<br/>Hall: ${data.hall}<br/>Seats: ${data.seats.join(', ')}</p>
       <p>Booking code: <strong>${data.bookingCode}</strong></p>
       <p>Your tickets are ready. Present your ticket QR code at the cinema entrance.</p>`,
    );
  }

  async sendBookingCancellation(email: string, bookingCode: string) {
    await this.send(
      email,
      `Booking Cancelled — ${bookingCode}`,
      `<p>Your booking ${bookingCode} has been cancelled.</p>`,
    );
  }

  async sendBookingReminder(email: string, movieTitle: string, startTime: string) {
    await this.send(
      email,
      `Reminder: ${movieTitle}`,
      `<p>Your screening starts at ${startTime}.</p>`,
    );
  }
}
