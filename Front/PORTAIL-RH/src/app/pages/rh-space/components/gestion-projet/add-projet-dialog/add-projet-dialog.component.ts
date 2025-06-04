import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CompetenceService, ProjetDTO, ProjetCompetenceDTO } from '../../../../../services/competence.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-projet-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="dialog-container">
  <h2 mat-dialog-title class="dialog-title">Ajouter un projet</h2>
  <mat-dialog-content class="dialog-content">
    <form [formGroup]="projetForm">
      <div class="form-group">
        <label for="nom">Nom du projet</label>
        <input id="nom" formControlName="nom" class="form-input" required>
      </div>
      
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" formControlName="description" class="form-input form-textarea" rows="3"></textarea>
      </div>
      
      <div class="form-group">
        <label for="cahierCharge">Cahier de charges</label>
        <div class="file-input-container">
          <input type="file" id="cahierCharge" (change)="onFileChange($event)" accept=".pdf" class="file-input">
          <label for="cahierCharge" class="file-label">
            <span>Choisir un fichier</span>
          </label>
        </div>
      </div>
      
      <div formArrayName="competencesRequises" class="competences-section">
        <label class="section-label">Compétences requises</label>
        <div *ngFor="let competence of competences.controls; let i=index" [formGroupName]="i" class="competence-row">
          <input formControlName="competenceNom" placeholder="Compétence" class="form-input" required>
          <div class="select-container">
            <select formControlName="niveauRequis" class="form-input" required>
              <option value="" disabled selected>Sélectionner un niveau</option>
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </div>
      
      <button type="button" (click)="addCompetenceRow()" class="add-competence-btn">
        + Ajouter une compétence
      </button>
      
      <div class="dialog-actions">
        <button type="button" class="btn btn-secondary" (click)="onCancel()">Annuler</button>
        <button type="submit" class="btn btn-primary" (click)="onSubmit()">Ajouter</button>
      </div>
    </form>
  </mat-dialog-content>
</div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }

    .dialog-title {
      color: #230046;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 3px solid #FF8C00;
    }

    .dialog-content {
      overflow-y: auto;
      max-height: 70vh;
    }
    .dialog-content::-webkit-scrollbar {
    display: none;
}

.dialog-content::-webkit-scrollbar-thumb {
    background-color: #aaa;
    border-radius: 5px;
}

.dialog-content::-webkit-scrollbar-track {
    background: transparent;
}

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #230046;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 12px;
      border: 1px solid rgba(35, 0, 70, 0.2);
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s ease;
      background: white;

      &:focus {
        outline: none;
        border-color: #FF8C00;
        box-shadow: 0 0 0 2px rgba(255, 140, 0, 0.1);
      }
    }

    .form-textarea {
      min-height: 100px;
      resize: vertical;
    }

    .file-input-container {
      position: relative;
    }

    .file-input {
      opacity: 0;
      width: 0.1px;
      height: 0.1px;
      position: absolute;
    }

    .file-label {
      display: inline-block;
      padding: 12px 20px;
      background: linear-gradient(45deg, #230046, #FF8C00);
      color: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(35, 0, 70, 0.2);
      }
    }

    .competences-section {
      margin: 24px 0;
    }

    .section-label {
      font-size: 16px;
      color: #230046;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .competence-row {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    .number-input {
      text-align: center;
    }

    .add-competence-btn {
      width: 100%;
      padding: 12px;
      background: rgba(35, 0, 70, 0.05);
      border: 2px dashed rgba(35, 0, 70, 0.2);
      border-radius: 8px;
      color: #230046;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 16px 0;

      &:hover {
        background: rgba(35, 0, 70, 0.1);
        border-color: #FF8C00;
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgba(35, 0, 70, 0.1);
    }

    .btn {
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;

      &:hover {
        transform: translateY(-2px);
      }
    }

    .btn-primary {
      background: linear-gradient(45deg, #230046, #FF8C00);
      color: white;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(35, 0, 70, 0.2);
      }
    }

    .btn-secondary {
      background: rgba(35, 0, 70, 0.05);
      color: #230046;
      
      &:hover {
        background: rgba(35, 0, 70, 0.1);
      }
    }

    @media (max-width: 768px) {
      .dialog-container {
        padding: 16px;
      }

      .competence-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  `]
})
export class AddProjetDialogComponent {
  projetForm: FormGroup;
  file: File | null = null;

  get competences() {
    return this.projetForm.get('competencesRequises') as FormArray;
  }

  constructor(
    public dialogRef: MatDialogRef<AddProjetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private competenceService: CompetenceService,
    private http: HttpClient
  ) {
    this.projetForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      competencesRequises: this.fb.array([this.fb.group({
        competenceNom: ['', [Validators.required, Validators.minLength(2)]],
        niveauRequis: ['', [Validators.required, Validators.pattern(/^(Débutant|Intermédiaire|Expert)$/)]],
      })])
    });
  }

  onFileChange(event: any): void {
    this.file = event.target.files[0];
  }

  addCompetenceRow(): void {
    this.competences.push(this.fb.group({
      competenceNom: ['', [Validators.required, Validators.minLength(2)]],
      niveauRequis: ['', [Validators.required, Validators.pattern(/^(Débutant|Intermédiaire|Expert)$/)]],
    }));
  }

  onSubmit(): void {
    if (!this.projetForm.valid) {
      Swal.fire('Erreur', 'Veuillez vérifier tous les champs requis', 'warning');
      return;
    }
    if (!this.file) {
      Swal.fire('Erreur', 'Veuillez sélectionner un fichier', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('nom', this.projetForm.get('nom')?.value);
    formData.append('description', this.projetForm.get('description')?.value || '');
    formData.append('competencesRequises', JSON.stringify(this.projetForm.get('competencesRequises')?.value));
    formData.append('cahierCharge', this.file);

    this.competenceService.createProjet(formData).subscribe({
      next: () => {
        this.dialogRef.close(true);
        Swal.fire('Succès', 'Projet créé avec succès', 'success');
      },
      error: (err) => {
        Swal.fire('Erreur', 'Erreur lors de la création du projet : ' + err.message, 'error');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}