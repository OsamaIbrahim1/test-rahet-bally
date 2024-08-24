import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Role } from "../../utils";
import { Resource } from "./resource.model";

@Table({
    tableName: 'Admin',
    timestamps: true,
})
export class Admin extends Model<Admin> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: Role.ADMIN,
    })
    role: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    token: string;

    @HasMany(() => Resource, {
        foreignKey: 'adminId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    resources: Resource[];
}