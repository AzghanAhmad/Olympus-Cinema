import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private from: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) this.resend = new Resend(apiKey);
    this.from = this.config.get<string>('EMAIL_FROM', 'Cinema <noreply@cinema.local>');
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.log(`[Email stub] To: ${to} | Subject: ${subject}`);
      return;
    }
    await this.resend.emails.send({ from: this.from, to, subject, html });
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
       <p>Your reservation for <strong>${data.movieTitle}</strong> is confirmed.</p>
       <p>Date: ${data.date} at ${data.time}<br/>Hall: ${data.hall}<br/>Seats: ${data.seats.join(', ')}</p>
       <p>Booking code: <strong>${data.bookingCode}</strong></p>
       <p>We will contact you as soon as the reservation is confirmed. Ticket issued after payment.</p>`,
    );
  }

  async sendBookingCancellation(email: string, bookingCode: string) {
    await this.send(email, `Booking Cancelled — ${bookingCode}`, `<p>Your booking ${bookingCode} has been cancelled.</p>`);
  }

  async sendBookingReminder(email: string, movieTitle: string, startTime: string) {
    await this.send(email, `Reminder: ${movieTitle}`, `<p>Your screening starts at ${startTime}.</p>`);
  }
}
