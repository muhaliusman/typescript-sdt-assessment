import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export default class CreateUsersTable1738161370331
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
            length: "100",
          },
          {
            name: "first_name",
            type: "varchar",
            length: "200",
          },
          {
            name: "last_name",
            type: "varchar",
            length: "200",
          },
          {
            name: "birthday",
            type: "date",
          },
          {
            name: "location",
            type: "varchar",
            length: "30",
          },
          {
            name: "next_notification_at",
            type: "timestamp",
          },
          {
            name: "notification_sent_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "birthday_notif_locked",
            type: "boolean",
            default: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );

    await queryRunner.createIndex(
      "users",
      new TableIndex({
        name: "IDX_USERS_EMAIL",
        columnNames: ["email"],
      })
    );

    await queryRunner.createIndex(
      "users",
      new TableIndex({
        name: "IDX_USERS_NEXT_NOTIFICATION_AT",
        columnNames: ["next_notification_at"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}
