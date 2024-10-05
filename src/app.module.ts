import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

//모듈 쓸 때는 여기서 import
//isGlobal을 사용하면 전역으로 캐시를 사용할 수 있음
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 86400,
      max: 1000,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
