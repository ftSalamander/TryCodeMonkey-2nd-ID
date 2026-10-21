import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class Hero {
  scrollToWork(): void {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  }
}
