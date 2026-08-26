import { NestFactory } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableCors();
  // NEST_PORT is set by scripts/dev.mjs, which allocates ports for every
  // service together; PORT is the standalone fallback.
  await app.listen(process.env.NEST_PORT ?? process.env.PORT ?? 3001);
}

bootstrap();
