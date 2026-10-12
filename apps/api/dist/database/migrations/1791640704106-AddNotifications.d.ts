import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddNotifications1791640704106 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
