import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface LeaveBalance {
  id: number;
  type: string;
  balance: string;
}

@Component({
  selector: 'app-demande-conges-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './demande-conges-dialog.component.html',
  styleUrl: './demande-conges-dialog.component.scss'
})
export class DemandeCongesDialogComponent {
  demandeForm: FormGroup;
  fileName: string | null = null;
  fileUrl: string | null = null;
  maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(
    public dialogRef: MatDialogRef<DemandeCongesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number; leaveBalances: LeaveBalance[] },
    private fb: FormBuilder
  ) {
    this.demandeForm = this.fb.group({
      congeTypeId: ['', Validators.required],
      solde: [{ value: '', disabled: true }],
      unite: [{ value: '', disabled: true }],
      duree: ['', [Validators.required, Validators.min(1)]],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      commentaires: [''],
      fileUrl: ['']
    }, { validators: [this.dateRangeValidator, this.soldeSuffisantValidator] });
  }

  // Validateur pour vérifier si la durée dépasse le solde
  soldeSuffisantValidator(control: AbstractControl): ValidationErrors | null {
    const duree = control.get('duree')?.value;
    const solde = control.get('solde')?.value;
    if (duree && solde && parseFloat(duree) > parseFloat(solde)) {
      return { soldeInsuffisant: true };
    }
    return null;
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const dateDebut = control.get('dateDebut')?.value;
    const dateFin = control.get('dateFin')?.value;
    if (dateDebut && dateFin && new Date(dateDebut) > new Date(dateFin)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  updateSoldeAndUnite(congeTypeId: string): void {
    const selectedLeave = this.data.leaveBalances.find(leave => leave.id === parseInt(congeTypeId, 10));
    if (selectedLeave) {
      const balanceParts = selectedLeave.balance.split(' ');
      const solde = balanceParts[0];
      const unite = balanceParts[1] === 'H' ? 'Heure' : 'Jours';
      this.demandeForm.patchValue({
        solde: solde,
        unite: unite
      });
    } else {
      this.demandeForm.patchValue({
        solde: '',
        unite: ''
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (file.size > this.maxFileSize) {
        alert('Le fichier est trop volumineux. La taille maximale est de 5MB.');
        input.value = ''; // Reset the file input
        this.fileName = null;
        this.fileUrl = null;
        this.demandeForm.patchValue({ fileUrl: '' });
        return;
      }

      this.fileName = file.name;
      this.fileUrl = `/uploads/${file.name}`;
      this.demandeForm.patchValue({ fileUrl: this.fileUrl });
    }
  }

  submit(): void {
    if (this.demandeForm.valid) {
      const formValue = this.demandeForm.getRawValue();
      this.dialogRef.close({
        ...formValue,
        dateDebut: formValue.dateDebut,
        dateFin: formValue.dateFin
      });
    } else if (this.demandeForm.hasError('dateRangeInvalid')) {
      alert('La date de début doit être antérieure à la date de fin.');
    } else if (this.demandeForm.hasError('soldeInsuffisant')) {
      alert('Le solde disponible est insuffisant pour la durée demandée.');
    }
  }
}