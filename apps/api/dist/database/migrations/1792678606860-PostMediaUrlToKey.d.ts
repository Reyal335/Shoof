import { MigrationInterface, QueryRunner } from "typeorm";
export declare class PostMediaUrlToKey1792678606860 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
