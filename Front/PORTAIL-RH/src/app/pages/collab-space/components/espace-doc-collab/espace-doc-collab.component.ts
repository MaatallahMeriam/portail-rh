import { ChangeDetectionStrategy, Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-collab/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DocumentService, DocumentDTO } from '../../../../services/document.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-espace-doc-collab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './espace-doc-collab.component.html',
  styleUrls: ['./espace-doc-collab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EspaceDocCollabComponent implements OnInit {
  documents: DocumentDTO[] = [];
  filteredCategories: { name: string; documents: DocumentDTO[] }[] = [];
  uniqueCategories: string[] = [];
  selectedCategory: string = '';
  isSidebarCollapsed = false;

  constructor(
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documentService.getAllDocuments().subscribe({
      next: (docs) => {
        this.documents = docs;
        this.updateUniqueCategories();
        this.filterDocumentsByCategory();
        this.cdr.markForCheck();
      },
      error: (err) => {
        Swal.fire('Erreur', err.message, 'error');
      },
    });
  }

  updateUniqueCategories(): void {
    const categories = new Set<string>();
    this.documents.forEach((doc) => {
      const category = doc.categorie || 'Sans catégorie';
      categories.add(category);
    });
    this.uniqueCategories = Array.from(categories).sort();
  }

  filterDocumentsByCategory(): void {
    let filteredDocs = this.documents;
    if (this.selectedCategory) {
      filteredDocs = this.documents.filter(
        (doc) => (doc.categorie || 'Sans catégorie') === this.selectedCategory
      );
    }

    const categoryMap = new Map<string, DocumentDTO[]>();
    filteredDocs.forEach((doc) => {
      const category = doc.categorie || 'Sans catégorie';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(doc);
    });

    this.filteredCategories = Array.from(categoryMap.entries()).map(([name, documents]) => ({
      name,
      documents,
    }));

    this.cdr.markForCheck();
  }

  downloadDocument(id: number): void {
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
        Swal.fire('Succès', 'Document téléchargé avec succès !', 'success');
      },
      error: (err) => {
        Swal.fire('Erreur', err.message || 'Erreur lors du téléchargement.', 'error');
      },
    });
  }

  onSidebarStateChange(isCollapsed: boolean) {
    this.isSidebarCollapsed = isCollapsed;
    this.cdr.markForCheck();
  }
}