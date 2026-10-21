import { Component } from '@angular/core';
import { Reveal } from '../../directives/reveal';
import { PROJECTS, Project } from '../../data/portfolio.data';

@Component({
  selector: 'app-projects',
  imports: [Reveal],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects {
  readonly projects: Project[] = PROJECTS;
}
