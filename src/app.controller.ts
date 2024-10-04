// src/app.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // Root route handler for GET /
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
