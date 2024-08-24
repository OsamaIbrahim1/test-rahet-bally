import { SequelizeModule } from "@nestjs/sequelize";
import { Admin, Resource, User } from "./models";

export const models = SequelizeModule.forFeature([User, Admin, Resource])
