import { MigrationInterface, QueryRunner } from "typeorm";
export declare class MoveProfileTechStackToSkills1792078339883 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
