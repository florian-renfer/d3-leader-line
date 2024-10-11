import { Component } from '@angular/core';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private readonly dialogService: Dialog) {}

  private dialogConfig = {
    width: '100vw',
    height: '100vh',
  };

  openDialog(): void {
    this.dialogService.open(CanvasComponent, this.dialogConfig);
  }
}
