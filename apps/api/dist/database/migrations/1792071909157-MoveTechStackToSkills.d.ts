import { MigrationInterface, QueryRunner } from "typeorm";
export declare class MoveTechStackToSkills1792071909157 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
