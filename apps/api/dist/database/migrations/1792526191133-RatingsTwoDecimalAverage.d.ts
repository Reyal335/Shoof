import { MigrationInterface, QueryRunner } from "typeorm";
export declare class RatingsTwoDecimalAverage1792526191133 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
    private rebuildCache;
}
