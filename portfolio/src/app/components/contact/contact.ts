import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Reveal } from '../../directives/reveal';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, Reveal],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  name = '';
  email = '';
  message = '';
  submitted = false;

  onSubmit(): void {
    this.submitted = true;
    this.name = '';
    this.email = '';
    this.message = '';
  }
}
