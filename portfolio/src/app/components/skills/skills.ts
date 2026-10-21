import { Component } from '@angular/core';
import { Reveal } from '../../directives/reveal';
import { SKILL_GROUPS, SkillGroup } from '../../data/portfolio.data';

@Component({
  selector: 'app-skills',
  imports: [Reveal],
  templateUrl: './skills.html',
  styleUrl: './skills.scss'
})
export class Skills {
  readonly groups: SkillGroup[] = SKILL_GROUPS;
}
