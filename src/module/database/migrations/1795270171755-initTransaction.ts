import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTransaction1795270171755 implements MigrationInterface {
    name = 'InitTransaction1795270171755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transaction_type_enum" AS ENUM('WITHDRAWL', 'DEPOSIT', 'TRANSFER')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TYPE "public"."transaction_type_enum"`);
    }

}
