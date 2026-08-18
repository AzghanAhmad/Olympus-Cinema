import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { ScreensModule } from './screens/screens.module';
import { ScreeningsModule } from './screenings/screenings.module';
import { SeatHoldsModule } from './seat-holds/seat-holds.module';
import { BookingsModule } from './bookings/bookings.module';
import { TicketsModule } from './tickets/tickets.module';
import { WebsocketModule } from './websocket/websocket.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NewsModule } from './news/news.module';
import { EventsModule } from './events/events.module';
import { UploadsModule } from './uploads/uploads.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: Number(process.env.THROTTLE_TTL ?? 60) * 1000,
            limit: Number(process.env.THROTTLE_LIMIT ?? 100),
          },
        ],
      }),
    }),
    PrismaModule,
    BootstrapModule,
    RedisModule,
    EmailModule,
    AuthModule,
    UsersModule,
    MoviesModule,
    ScreensModule,
    ScreeningsModule,
    SeatHoldsModule,
    BookingsModule,
    TicketsModule,
    WebsocketModule,
    SettingsModule,
    DashboardModule,
    NewsModule,
    EventsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}