import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-idea-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>Exprimez votre idée !</h2>
        <button mat-icon-button class="close-btn" (click)="onClose()">
          <mat-icon class="icon" >close</mat-icon>
        </button>
      </div>
      <div class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Sujet de l'idée</mat-label>
          <input  class="input" matInput [(ngModel)]="data.newTopic" placeholder="Entrez le sujet de l'idée" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description de l'idée</mat-label>
          <textarea class="textarea" matInput [(ngModel)]="data.newIdea" placeholder="Partagez votre idée..." rows="4" required></textarea>
        </mat-form-field>
        <div class="file-upload">
          <label for="dialog-idea-image-upload" class="upload-btn">
            <mat-icon>attach_file</mat-icon>
            Joindre une image
          </label>
          <input id="dialog-idea-image-upload" type="file" (change)="onFileSelected($event)" accept="image/*">
          <span *ngIf="data.selectedFile" class="file-name">{{ data.selectedFile.name }}</span>
        </div>
      </div>
      <div class="dialog-actions">
        <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="!data.newTopic || !data.newIdea || !data.selectedFile">Soumettre</button>
      </div>
    </div>
  `,
  styles: [`
  .icon {
    margin-bottom : 30px ;

  }
  .input {
    border-radius : 20px;
  }
    .dialog-container {
      padding: 20px;
      max-width: 500px;
      width: 100%;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #230046;
      font-weight: 600;
    }

    .close-btn {
      color: #666;
      transition: color 0.2s ease;
    }

    .close-btn:hover {
      color: #E5007F;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .full-width {
      width: 100%;
    }

    .mat-form-field {
      transition: all 0.3s ease;
    }

    .mat-form-field .mat-form-field-outline {
      border-radius: 8px;
    }

    .mat-form-field input,
    .mat-form-field textarea {
      border-radius: 20px;
      font-size: 1rem;
      color: #333;
    }

    .mat-form-field textarea {
      min-height: 80px;
      resize: none;
    }

    .mat-form-field .mat-form-field-label {
      color: #230046;
      font-weight: 500;
    }

    .mat-form-field:hover .mat-form-field-outline-thick {
      border-color: #E5007F;
    }

    .file-upload {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }

    .upload-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #f4f4f4;
      border-radius: 25px;
      border: 1px solid #ddd;
      cursor: pointer;
      font-size: 0.95rem;
      color: #333;
      transition: all 0.2s ease;
    }

    .upload-btn:hover {
      background: #ececec;
      border-color: #E5007F;
      color: #E5007F;
    }

    .upload-btn mat-icon {
      font-size: 1.2rem;
      color: #666;
      transition: color 0.2s ease;
    }

    .upload-btn:hover mat-icon {
      color: #E5007F;
    }

    .file-upload input[type="file"] {
      display: none;
    }

    .file-name {
      font-size: 0.9rem;
      color: #666;
      font-style: italic;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 25px;
    }

    button[mat-flat-button] {
      background-color: #E5007F;
      color: white;
      padding: 10px 24px;
      border-radius: 30px;
      font-weight: 500;
      transition: background-color 0.2s ease;
    }

    button[mat-flat-button][disabled] {
      background-color: #ccc;
      cursor: not-allowed;
    }

    button[mat-flat-button]:hover:not([disabled]) {
      background-color: #d40070;
    }
  `]
})
export class AddIdeaDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AddIdeaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { newIdea: string; newTopic: string; selectedFile?: File }
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.data.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    this.dialogRef.close(this.data);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}