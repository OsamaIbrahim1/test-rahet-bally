import { BelongsTo, Column, DataType, Model, Table } from "sequelize-typescript";
import { Admin } from "./admin.model";

@Table({
    tableName: 'Resource',
    timestamps: true
})
export class Resource extends Model<Resource> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true
    })
    title: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    description: string;

    @Column({
        type: DataType.JSON,
        allowNull: true
    })
    Image: Array<{ secure_url: string; public_id: string }>;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    folderId: string  // folder of images in cloudinary

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    adminId: number

    @BelongsTo(() => Admin, {
        foreignKey: 'adminId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    admin: Admin;
}
