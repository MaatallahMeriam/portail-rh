import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-team-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-team-form.component.html',
  styleUrl: './edit-team-form.component.scss'
})
export class EditTeamFormComponent {
  @Input() editEquipeData!: { id: number; nom: string; departement: string };
  
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();
  
  onClose(): void {
    this.close.emit();
  }
  
  onUpdate(): void {
    this.update.emit();
  }
}