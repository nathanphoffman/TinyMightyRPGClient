import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AuthModule } from "./auth/auth.module.js";
import { CampaignsModule } from "./campaigns/campaigns.module.js";
import { CharactersModule } from "./characters/characters.module.js";
import { DatabaseModule } from "./common/database/database.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule, CharactersModule, CampaignsModule],
  controllers: [AppController],
})
export class AppModule {}
