import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToTransaction1795355041008 implements MigrationInterface {
    name = 'AddStatusToTransaction1795355041008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transaction_status_enum" AS ENUM('IN_PROGRESS', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "amount" character varying NOT NULL, "type" "public"."transaction_type_enum" NOT NULL, "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'IN_PROGRESS', CONSTRAINT "PK_b4a3d92d5dde30f3ab5c34c5862" PRIMARY KEY ("user_id")); COMMENT ON COLUMN "transaction"."user_id" IS 'Идентификатор транзакции'; COMMENT ON COLUMN "transaction"."userId" IS 'Идентификатор пользователя, совершающего транзакцию'; COMMENT ON COLUMN "transaction"."amount" IS 'Сумма транзакции в копейках'; COMMENT ON COLUMN "transaction"."type" IS 'Тип транзакции'; COMMENT ON COLUMN "transaction"."status" IS 'Статус транзакции'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
    }

}
