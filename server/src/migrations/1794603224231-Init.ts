import type { MigrationInterface, QueryRunner } from 'typeorm'

export class Init1794603224231 implements MigrationInterface {
  name = 'Init1794603224231'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "newsposts" ("id" SERIAL NOT NULL, "title" character varying(50) NOT NULL, "text" character varying(256) NOT NULL, "genre" character varying NOT NULL, "isPrivate" boolean NOT NULL DEFAULT false, "createDate" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer NOT NULL, CONSTRAINT "PK_7f2d8d3f0349de4143071a05ba2" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "newsposts" ADD CONSTRAINT "FK_99384b093935b597caf4e988ee0" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "newsposts" DROP CONSTRAINT "FK_99384b093935b597caf4e988ee0"`
    )
    await queryRunner.query(`DROP TABLE "newsposts"`)
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
