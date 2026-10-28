import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSalesPurchases1793102016811 implements MigrationInterface {
    name = 'AddSalesPurchases1793102016811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "name_en" character varying(255) NOT NULL, "name_bn" character varying(255), "phone" character varying(32), "email" character varying(255), "address" text, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97913f35ac2e435a4463fb50a0" ON "customers" ("tenant_id") `);
        await queryRunner.query(`CREATE TABLE "invoice_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "invoice_id" uuid NOT NULL, "product_id" uuid, "description" character varying(255) NOT NULL, "quantity" numeric(18,4) NOT NULL, "unit_price" integer NOT NULL DEFAULT '0', "total" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_53b99f9e0e2945e69de1a12b75a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_deaeb7940633a09af4c6c14df8" ON "invoice_items" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc991d555664682cfe892eea2c" ON "invoice_items" ("invoice_id") `);
        await queryRunner.query(`CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "invoice_number" character varying(64) NOT NULL, "customer_id" uuid, "date" date NOT NULL, "due_date" date, "status" character varying(16) NOT NULL DEFAULT 'draft', "subtotal" integer NOT NULL DEFAULT '0', "discount" integer NOT NULL DEFAULT '0', "vat" integer NOT NULL DEFAULT '0', "total" integer NOT NULL DEFAULT '0', "paid_amount" integer NOT NULL DEFAULT '0', "notes" text, "created_by" uuid, CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_440f531f452dcc4389d201b9d4" ON "invoices" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d8f8d3788694e1b3f96c42c36f" ON "invoices" ("invoice_number") `);
        await queryRunner.query(`CREATE TABLE "payments_received" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "invoice_id" uuid, "customer_id" uuid, "amount" integer NOT NULL DEFAULT '0', "date" date NOT NULL, "payment_method" character varying(32) NOT NULL DEFAULT 'cash', "notes" text, "created_by" uuid, CONSTRAINT "PK_6887a18d2baa3f7b33273e9b63f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_194742a8145f379b3be99a38ce" ON "payments_received" ("tenant_id") `);
        await queryRunner.query(`CREATE TABLE "suppliers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "name_en" character varying(255) NOT NULL, "name_bn" character varying(255), "phone" character varying(32), "email" character varying(255), "address" text, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b0d0350059126fa08fddc3c7a4" ON "suppliers" ("tenant_id") `);
        await queryRunner.query(`CREATE TABLE "bill_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "bill_id" uuid NOT NULL, "product_id" uuid, "description" character varying(255) NOT NULL, "quantity" numeric(18,4) NOT NULL, "unit_cost" integer NOT NULL DEFAULT '0', "total" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_729cb3e07036682e6695f4bac3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_93224d1f6071fe657c512be27e" ON "bill_items" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b424156152a3230b034bdb51db" ON "bill_items" ("bill_id") `);
        await queryRunner.query(`CREATE TABLE "bills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "bill_number" character varying(64) NOT NULL, "supplier_id" uuid, "date" date NOT NULL, "due_date" date, "status" character varying(16) NOT NULL DEFAULT 'draft', "subtotal" integer NOT NULL DEFAULT '0', "vat" integer NOT NULL DEFAULT '0', "total" integer NOT NULL DEFAULT '0', "paid_amount" integer NOT NULL DEFAULT '0', "notes" text, "created_by" uuid, CONSTRAINT "PK_a56215dfcb525755ec832cc80b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b26a4887deed791809fc4f5851" ON "bills" ("tenant_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_df496d8e68bf4899d47956865e" ON "bills" ("bill_number") `);
        await queryRunner.query(`CREATE TABLE "payments_made" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "tenant_id" uuid NOT NULL, "bill_id" uuid, "supplier_id" uuid, "amount" integer NOT NULL DEFAULT '0', "date" date NOT NULL, "payment_method" character varying(32) NOT NULL DEFAULT 'cash', "notes" text, "created_by" uuid, CONSTRAINT "PK_738f633cd61190d4dae8f4c0f24" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cd606765c2066dced4769af85d" ON "payments_made" ("tenant_id") `);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_dc991d555664682cfe892eea2c1" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_5a76734b5eead0967cf6ee3abc0" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_65e3145f317bd655481d3f96c74" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments_received" ADD CONSTRAINT "FK_a8d6fb82c3931150de8bca6ff09" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments_received" ADD CONSTRAINT "FK_527d341f6d8ae807d1f551a2107" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bill_items" ADD CONSTRAINT "FK_b424156152a3230b034bdb51db4" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bill_items" ADD CONSTRAINT "FK_8cdffab17a59c4e79b46385db0d" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bills" ADD CONSTRAINT "FK_d867a24e7a518f7454b70ed6478" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments_made" ADD CONSTRAINT "FK_9ba12b2692c790a819155ccbf10" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments_made" ADD CONSTRAINT "FK_dcdbdb74858559c06f637177555" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments_made" DROP CONSTRAINT "FK_dcdbdb74858559c06f637177555"`);
        await queryRunner.query(`ALTER TABLE "payments_made" DROP CONSTRAINT "FK_9ba12b2692c790a819155ccbf10"`);
        await queryRunner.query(`ALTER TABLE "bills" DROP CONSTRAINT "FK_d867a24e7a518f7454b70ed6478"`);
        await queryRunner.query(`ALTER TABLE "bill_items" DROP CONSTRAINT "FK_8cdffab17a59c4e79b46385db0d"`);
        await queryRunner.query(`ALTER TABLE "bill_items" DROP CONSTRAINT "FK_b424156152a3230b034bdb51db4"`);
        await queryRunner.query(`ALTER TABLE "payments_received" DROP CONSTRAINT "FK_527d341f6d8ae807d1f551a2107"`);
        await queryRunner.query(`ALTER TABLE "payments_received" DROP CONSTRAINT "FK_a8d6fb82c3931150de8bca6ff09"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_65e3145f317bd655481d3f96c74"`);
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_5a76734b5eead0967cf6ee3abc0"`);
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_dc991d555664682cfe892eea2c1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cd606765c2066dced4769af85d"`);
        await queryRunner.query(`DROP TABLE "payments_made"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df496d8e68bf4899d47956865e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b26a4887deed791809fc4f5851"`);
        await queryRunner.query(`DROP TABLE "bills"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b424156152a3230b034bdb51db"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_93224d1f6071fe657c512be27e"`);
        await queryRunner.query(`DROP TABLE "bill_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b0d0350059126fa08fddc3c7a4"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_194742a8145f379b3be99a38ce"`);
        await queryRunner.query(`DROP TABLE "payments_received"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8f8d3788694e1b3f96c42c36f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_440f531f452dcc4389d201b9d4"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc991d555664682cfe892eea2c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_deaeb7940633a09af4c6c14df8"`);
        await queryRunner.query(`DROP TABLE "invoice_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97913f35ac2e435a4463fb50a0"`);
        await queryRunner.query(`DROP TABLE "customers"`);
    }

}
