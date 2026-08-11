import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './home.html'
})
export class Home {
  constructor(public authService: AuthService) {}
}