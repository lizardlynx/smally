import { Column, Table, Model, DataType } from 'sequelize-typescript';

@Table
export class Url extends Model {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING(2048), allowNull: false })
  origUrl: string;

  @Column({ type: DataType.STRING(2048), allowNull: false })
  shortUrl: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0, allowNull: false })
  clicks?: number;
}
