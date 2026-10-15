import { Injectable } from '@nestjs/common';
import { Skill } from './entities/skill.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository , In} from 'typeorm';

/** What other modules send for a skill: enough for a chip, a kind group and a link to /skills/:slug. */
export type SkillSummary = Pick<Skill, 'id' | 'slug' | 'name' | 'kind'>;

export function toSkillSummary({ id, slug, name, kind }: Skill): SkillSummary {
  return { id, slug, name, kind };
}


@Injectable()
export class SkillsService {
  constructor (
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>
  ) {}

  async findBySlug(slug: string): Promise<Skill | null> {
    return this.skillRepository
      .createQueryBuilder('s')
      .where('s.slug = :slug OR :slug = ANY(s.aliases)', { slug: slug.toLowerCase() })
      .getOne()
  }

  async findBySlugs(slugs: string[]): Promise<Skill[]> {
    if (!slugs.length) return []
    const lower = slugs.map((s) => s.toLowerCase())
    return this.skillRepository
      .createQueryBuilder('s')
      .where('s.slug IN (:...lower) OR s.aliases && :lower', { lower })
      .getMany()
  }

    async findByIds (ids: string[]): Promise<Skill[]> {
      // Posts and profiles with no skills call this with []; skip the query instead of sending IN ()
      if (!ids.length) return []
      return await this.skillRepository.find({
        where: {
          id: In(ids)
        },
        order: { name: 'ASC' }
      })
    }

  findAll(): Promise<Skill[]> {
    return this.skillRepository.find({ order: { name: 'ASC' } })
  }

}
