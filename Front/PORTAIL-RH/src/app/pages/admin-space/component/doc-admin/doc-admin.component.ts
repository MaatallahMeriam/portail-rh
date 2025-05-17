import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { DocumentService, DocumentDTO } from '../../../../services/document.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doc-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarAdminComponent,
    HeaderComponent,
    NgxDatatableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './doc-admin.component.html',
  styleUrl: './doc-admin.component.scss'
})
export class DocAdminComponent {
  documents: DocumentDTO[] = [];
  filteredDocuments: DocumentDTO[] = [];
  selectedDocument: DocumentDTO | null = null;
  showForm = false;
  isEditing = false;
  editingDocument: DocumentDTO | null = null;

  docName: string = '';
  docType: string = '';
  docDescription: string = '';
  docCategorie: string = '';
  docFile: File | null = null;
  searchText: string = '';
  isSidebarCollapsed = false;

  columns = [
    { prop: 'id', name: 'ID', width: 50 },
    { prop: 'name', name: 'Nom document', width: 200 },
    { prop: 'description', name: 'Description', width: 300 },
    { prop: 'categorie', name: 'Catégorie', width: 150 },
  ];

  constructor(private documentService: DocumentService) {
    this.loadDocuments();
  }

  loadDocuments() {
    this.documentService.getAllDocuments().subscribe({
      next: (docs) => {
        this.documents = docs;
        console.log('Documents chargés :', docs);
        this.filteredDocuments = [...docs];
      },
      error: (err) => Swal.fire('Erreur', err.message, 'error'),
    });
  }

  filterDocuments() {
    if (!this.searchText) {
      this.filteredDocuments = [...this.documents];
      return;
    }
    const search = this.searchText.toLowerCase();
    this.filteredDocuments = this.documents.filter(
      (doc) =>
        (doc.name?.toLowerCase().includes(search) || '') ||
        (doc.description?.toLowerCase().includes(search) || '') ||
        (doc.categorie?.toLowerCase().includes(search) || '') ||
        (doc.id?.toString().includes(search) || '')
    );
  }

  toggleMenu(document: DocumentDTO) {
    this.selectedDocument = this.selectedDocument === document ? null : document;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-button') && !target.closest('.dropdown-menu')) {
      this.selectedDocument = null;
    }
  }

  deleteDocument(document: DocumentDTO) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous supprimer ${document.name} ?`,
      icon: 'warning',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentService.deleteDocument(document.id).subscribe({
          next: () => {
            this.documents = this.documents.filter((doc) => doc.id !== document.id);
            this.filteredDocuments = this.filteredDocuments.filter(
              (doc) => doc.id !== document.id
            );
            Swal.fire('Supprimé !', 'Document supprimé.', 'success');
          },
          error: (err) => Swal.fire('Erreur', err.message, 'error'),
        });
      }
    });
  }

  editDocument(document: DocumentDTO) {
    this.isEditing = true;
    this.editingDocument = { ...document };
    this.docName = document.name;
    this.docDescription = document.description;
    this.docCategorie = document.categorie;
    this.showForm = true;
    this.selectedDocument = null;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.docFile = input.files[0];
    }
  }

  submitForm() {
    if (!this.docName || !this.docDescription || !this.docCategorie) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    if (this.isEditing && this.editingDocument) {
      this.documentService
        .updateDocument(
          this.editingDocument.id,
          this.docName,
          this.docDescription,
          this.docCategorie,
          this.docFile,
          this.editingDocument.url
        )
        .subscribe({
          next: (response) => {
            Swal.fire('Succès', 'Document modifié avec succès !', 'success');
            this.loadDocuments();
            this.toggleForm();
          },
          error: (err) => Swal.fire('Erreur', err.message, 'error'),
        });
    } else {
      if (!this.docFile) {
        Swal.fire('Erreur', 'Veuillez joindre un fichier.', 'error');
        return;
      }
      this.documentService.uploadDocument(this.docFile, this.docDescription, this.docCategorie).subscribe({
        next: (response) => {
          Swal.fire('Succès', 'Document ajouté !', 'success');
          this.loadDocuments();
          this.toggleForm();
        },
        error: (err) => Swal.fire('Erreur', err.message, 'error'),
      });
    }
  }

  resetForm() {
    this.docName = '';
    this.docType = '';
    this.docDescription = '';
    this.docCategorie = '';
    this.docFile = null;
    this.isEditing = false;
    this.editingDocument = null;
  }

  downloadDocument(id: number) {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const doc = this.documents.find((d) => d.id === id);
        a.download = doc ? doc.name : `document_${id}`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Document téléchargé avec succès !',
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.message || 'Erreur lors du téléchargement du document.',
        });
      },
    });
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}