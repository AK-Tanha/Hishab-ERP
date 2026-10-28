import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccounting1793100148430 implements MigrationInterface {
    name = 'AddAccounting1793100148430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "journal_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "entry_number" character varying(64) NOT NULL, "date" date NOT NULL, "description" text NOT NULL, "reference_type" character varying(64), "reference_id" uuid, "status" character varying(16) NOT NULL DEFAULT 'posted', "created_by" uuid, CONSTRAINT "PK_a70368e64230434457c8d007ab3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_58fffc97d300e8164ccd16fc06" ON "journal_entries" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_fc383b1f258773805dce03a65f" ON "journal_entries" ("entry_number") `);
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "code" character varying(32) NOT NULL, "name_en" character varying(255) NOT NULL, "name_bn" character varying(255), "type" character varying(32) NOT NULL, "subtype" character varying(64), "parent_id" uuid, "is_system" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c1cce1e0d9cc2557038a7f639d" ON "accounts" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_490319656e54a7957dc1fed027" ON "accounts" ("code") `);
        await queryRunner.query(`CREATE TABLE "journal_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "journal_entry_id" uuid NOT NULL, "account_id" uuid NOT NULL, "debit" integer NOT NULL DEFAULT '0', "credit" integer NOT NULL DEFAULT '0', "description" text, CONSTRAINT "PK_70cba2da4588cee8921f73ef136" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_07bbdad69a6b3f4982d0663fe7" ON "journal_lines" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1fd23ae91f0c24764b4e581c72" ON "journal_lines" ("journal_entry_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_46bed88ea929e6f0aa17bf2084" ON "journal_lines" ("account_id") `);
        await queryRunner.query(`ALTER TABLE "accounts" ADD CONSTRAINT "FK_f7ea327e4100ce4d6002ecdd12b" FOREIGN KEY ("parent_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal_lines" ADD CONSTRAINT "FK_1fd23ae91f0c24764b4e581c72e" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "journal_lines" ADD CONSTRAINT "FK_46bed88ea929e6f0aa17bf20845" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "journal_lines" DROP CONSTRAINT "FK_46bed88ea929e6f0aa17bf20845"`);
        await queryRunner.query(`ALTER TABLE "journal_lines" DROP CONSTRAINT "FK_1fd23ae91f0c24764b4e581c72e"`);
        await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_f7ea327e4100ce4d6002ecdd12b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_46bed88ea929e6f0aa17bf2084"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1fd23ae91f0c24764b4e581c72"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_07bbdad69a6b3f4982d0663fe7"`);
        await queryRunner.query(`DROP TABLE "journal_lines"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_490319656e54a7957dc1fed027"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c1cce1e0d9cc2557038a7f639d"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fc383b1f258773805dce03a65f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_58fffc97d300e8164ccd16fc06"`);
        await queryRunner.query(`DROP TABLE "journal_entries"`);
    }

}
