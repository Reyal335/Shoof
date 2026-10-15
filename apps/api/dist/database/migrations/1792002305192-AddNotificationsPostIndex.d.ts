import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddNotificationsPostIndex1792002305192 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
