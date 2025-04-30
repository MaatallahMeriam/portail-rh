import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { UserDTO } from '../../../../../services/users.service';
import { CreateEquipeRequest } from '../../../../../services/equipe.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-team-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatRadioModule],
  templateUrl: './add-team-form.component.html',
  styleUrl: './add-team-form.component.scss'
})
export class AddTeamFormComponent {
  @Input() newEquipe!: CreateEquipeRequest;
  @Input() activeUsers: UserDTO[] = [];
  @Input() filteredActiveUsers: UserDTO[] = [];
  @Input() managerSearchText: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();
  @Output() managerSearch = new EventEmitter<string>();
  @Output() managerSelect = new EventEmitter<number>();

  showManagerSelectionModal: boolean = false;
  managerFilterText: string = '';

  onClose(): void {
    this.close.emit();
  }

  onCreate(): void {
    if (!this.newEquipe.managerId) {
      Swal.fire({
        icon: 'warning',
        title: 'Manager non sélectionné',
        text: 'Veuillez sélectionner un manager pour l\'équipe.',
      });
      return;
    }
    this.create.emit();
  }

  onManagerSearch(text: string): void {
    this.managerFilterText = text;
    this.managerSearch.emit(text);
  }

  onManagerSelect(userId: number): void {
    this.managerSelect.emit(userId);
  }

  toggleManagerSelectionModal(): void {
    this.showManagerSelectionModal = !this.showManagerSelectionModal;
    if (!this.showManagerSelectionModal) {
      this.managerFilterText = '';
      this.onManagerSearch('');
    }
  }

  confirmManagerSelection(): void {
    if (!this.newEquipe.managerId) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucun manager sélectionné',
        text: 'Veuillez sélectionner un manager avant de confirmer.',
      });
      return;
    }
    this.toggleManagerSelectionModal();
  }
}