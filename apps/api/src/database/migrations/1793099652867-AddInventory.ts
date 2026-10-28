import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInventory1793099652867 implements MigrationInterface {
    name = 'AddInventory1793099652867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "warehouses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "name_en" character varying(255) NOT NULL, "name_bn" character varying(255), "address" character varying(255), "is_default" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_09106b8068aeaf74fa33666df8" ON "warehouses" ("tenant_id") `);
        await queryRunner.query(`CREATE TABLE "units" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid, "code" character varying(32) NOT NULL, "name_en" character varying(64) NOT NULL, "name_bn" character varying(64), "is_system" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_47635c1ab22d02fc3ebae3608b8" UNIQUE ("code"), CONSTRAINT "PK_5a8f2f064919b587d93936cb223" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dfc3fe2db03af2e60601ca2685" ON "units" ("tenant_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_47635c1ab22d02fc3ebae3608b" ON "units" ("code") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "name_en" character varying(255) NOT NULL, "name_bn" character varying(255), "parent_id" uuid, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5d4fe23b360b1b9e16a3f41727" ON "categories" ("tenant_id") `);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "sku" character varying(64) NOT NULL, "name_en" character varying(255) NOT NULL, "name_bn" character varying(255), "description_en" text, "description_bn" text, "category_id" uuid, "unit_id" uuid, "cost_price" integer NOT NULL DEFAULT '0', "selling_price" integer NOT NULL DEFAULT '0', "reorder_level" numeric(18,4) NOT NULL DEFAULT '0', "has_variants" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9c365ebf78f0e8a6d9e4827ea7" ON "products" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c44ac33a05b144dd0d9ddcf932" ON "products" ("sku") `);
        await queryRunner.query(`CREATE TABLE "stock_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "product_id" uuid NOT NULL, "warehouse_id" uuid NOT NULL, "type" character varying(32) NOT NULL, "quantity" numeric(18,4) NOT NULL, "reference_type" character varying(64), "reference_id" uuid, "notes" text, "created_by" uuid, CONSTRAINT "PK_57a26b190618550d8e65fb860e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_30dd9acc22dcb6ae51d7d34f16" ON "stock_movements" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2c1bb05b80ddcc562cd28d826c" ON "stock_movements" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e7831147f5a8ee3c42e6eaeee2" ON "stock_movements" ("warehouse_id") `);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_0b97249dd9e17bbc604a5ba3d07" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_2c1bb05b80ddcc562cd28d826c6" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_e7831147f5a8ee3c42e6eaeee2e" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_e7831147f5a8ee3c42e6eaeee2e"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_2c1bb05b80ddcc562cd28d826c6"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_0b97249dd9e17bbc604a5ba3d07"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e7831147f5a8ee3c42e6eaeee2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2c1bb05b80ddcc562cd28d826c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_30dd9acc22dcb6ae51d7d34f16"`);
        await queryRunner.query(`DROP TABLE "stock_movements"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c44ac33a05b144dd0d9ddcf932"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9c365ebf78f0e8a6d9e4827ea7"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5d4fe23b360b1b9e16a3f41727"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_47635c1ab22d02fc3ebae3608b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dfc3fe2db03af2e60601ca2685"`);
        await queryRunner.query(`DROP TABLE "units"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_09106b8068aeaf74fa33666df8"`);
        await queryRunner.query(`DROP TABLE "warehouses"`);
    }

}
