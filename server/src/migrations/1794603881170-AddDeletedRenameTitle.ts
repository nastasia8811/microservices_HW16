import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDeletedRenameTitle1794603881170 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "newsposts" ADD "deleted" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "users" ADD "deleted" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(`ALTER TABLE "newsposts" RENAME COLUMN "title" TO "header"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "newsposts" RENAME COLUMN "header" TO "title"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted"`)
    await queryRunner.query(`ALTER TABLE "newsposts" DROP COLUMN "deleted"`)
  }
}
