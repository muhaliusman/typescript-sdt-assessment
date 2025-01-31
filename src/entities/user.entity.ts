import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm";

@Entity({
  name: "users",
})
export default class User {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({
    name: "first_name",
  })
  firstName!: string;

  @Column({
    name: "last_name",
  })
  lastName!: string;

  @Column({
    unique: true,
    name: "email",
  })
  email!: string;

  @Column({
    name: "birthday",
    type: "date",
  })
  birthday!: Date;

  @Column({
    name: "location",
  })
  location!: string;

  @Column({
    nullable: true,
    type: "datetime",
    name: "notification_sent_at",
  })
  notificationSentAt: Date | null;

  @Column({
    nullable: true,
    type: "datetime",
    name: "notification_failed_at",
  })
  notificationFailedAt: Date | null;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  readonly updatedAt!: Date;
}
