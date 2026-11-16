import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddIndexes1794603997276 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_99384b093935b597caf4e988ee" ON "newsposts" ("authorId")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_99384b093935b597caf4e988ee"`)
  }
}
