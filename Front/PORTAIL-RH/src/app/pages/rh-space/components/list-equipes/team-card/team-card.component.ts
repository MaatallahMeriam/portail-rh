import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserDTO } from '../../../../../services/users.service';
import { EquipeDTO } from '../../../../../services/equipe.service';

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './team-card.component.html',
  styleUrl: './team-card.component.scss'
})
export class TeamCardComponent {
  @Input() equipe!: EquipeDTO & { manager?: UserDTO; showDropdown?: boolean };
  
  @Output() viewDetails = new EventEmitter<number>();
  @Output() editTeam = new EventEmitter<EquipeDTO & { manager?: UserDTO }>();
  @Output() deleteTeam = new EventEmitter<number>();
  @Output() toggleDropdown = new EventEmitter<EquipeDTO & { showDropdown?: boolean }>();
  
  onViewDetails(): void {
    this.viewDetails.emit(this.equipe.id);
  }
  
  onEditTeam(): void {
    this.editTeam.emit(this.equipe);
  }
  
  onDeleteTeam(): void {
    this.deleteTeam.emit(this.equipe.id);
  }
  
  onToggleDropdown(): void {
    this.toggleDropdown.emit(this.equipe);
  }
}