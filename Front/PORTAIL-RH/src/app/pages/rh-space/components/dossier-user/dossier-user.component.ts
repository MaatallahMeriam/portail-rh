import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, UserDTO } from '../../../../services/users.service';
import { FileService } from '../../../../services/file.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dossier-user',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, RightSidebarComponent],
  templateUrl: './dossier-user.component.html',
  styleUrls: ['./dossier-user.component.scss'],
})
export class DossierUserComponent implements OnInit {
   user: UserDTO | null = null;
   userId: number | null = null;
   dossierId: number | null = null;
   selectedFileType: string | null = null;
   showAttachForm: string | null = null;
   selectedFile: File | null = null;
 
   constructor(
     private route: ActivatedRoute,
     private router: Router,
     private userService: UserService,
     private fileService: FileService
   ) {}
 
   ngOnInit(): void {
     this.route.queryParams.subscribe(params => {
       this.userId = params['userId'] ? +params['userId'] : null;
       if (this.userId) {
         this.loadUserDetails(this.userId);
       }
     });
   }
 
   loadUserDetails(userId: number): void {
     this.userService.getUserById(userId).subscribe(
       (user: UserDTO) => {
         this.user = user;
         this.dossierId = user.dossierId || null;
       },
       error => {
         console.error('Erreur lors du chargement des détails de l\'utilisateur', error);
       }
     );
   }
 
   downloadFile(fileType: string): void {
     if (!this.dossierId) {
       Swal.fire({
         icon: 'error',
         title: 'Erreur',
         text: 'Aucun dossier associé à cet utilisateur.',
       });
       return;
     }
 
     this.fileService.downloadFile(this.dossierId, fileType).subscribe({
       next: (blob: Blob) => {
         if (blob.size === 0) {
           Swal.fire({
             icon: 'info',
             title: 'Fichier non disponible',
             text: `Le fichier ${fileType} n'existe pas ou a été supprimé.`,
           });
           return;
         }
 
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `${fileType}_user_${this.userId}.pdf`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         window.URL.revokeObjectURL(url);
       },
       error: (error) => {
         console.error(`Erreur lors du téléchargement du fichier ${fileType}`, error);
         Swal.fire({
           icon: 'info',
           title: 'Fichier non disponible',
           text: `Le fichier ${fileType} n'existe pas ou a été supprimé.`,
         });
       }
     });
   }
 
   toggleMenu(fileType: string): void {
     this.selectedFileType = this.selectedFileType === fileType ? null : fileType;
     this.showAttachForm = null;
   }
 
   @HostListener('document:click', ['$event'])
   closeMenu(event: Event): void {
     const target = event.target as HTMLElement;
     if (!target.closest('.menu-button') && !target.closest('.dropdown-menu') && !target.closest('.attach-form')) {
       this.selectedFileType = null;
       this.showAttachForm = null;
     }
   }
 
   attachFile(fileType: string): void {
     this.showAttachForm = fileType;
     this.selectedFile = null;
     this.selectedFileType = null;
   }
 
   onFileSelected(event: Event): void {
     const input = event.target as HTMLInputElement;
     if (input.files && input.files.length > 0) {
       this.selectedFile = input.files[0];
     }
   }
 
   submitFile(fileType: string): void {
     if (!this.dossierId) {
       Swal.fire({
         icon: 'error',
         title: 'Erreur',
         text: 'Aucun dossier associé à cet utilisateur.',
       });
       return;
     }
 
     if (!this.selectedFile) {
       Swal.fire({
         icon: 'error',
         title: 'Erreur',
         text: 'Veuillez sélectionner un fichier.',
       });
       return;
     }
 
     this.fileService.uploadSingleFile(this.dossierId, fileType, this.selectedFile).subscribe({
       next: () => {
         Swal.fire({
           icon: 'success',
           title: 'Succès',
           text: `Fichier ${fileType} uploadé avec succès.`,
         });
         this.showAttachForm = null;
         this.selectedFile = null;
       },
       error: (error) => {
         console.error(`Erreur lors de l'upload du fichier ${fileType}`, error);
         Swal.fire({
           icon: 'error',
           title: 'Erreur',
           text: `Erreur lors de l'upload du fichier ${fileType}.`,
         });
         this.showAttachForm = null;
       }
     });
   }
 
   cancelAttach(): void {
     this.showAttachForm = null;
     this.selectedFile = null;
   }
 
   deleteFile(fileType: string): void {
     if (!this.dossierId) {
       Swal.fire({
         icon: 'error',
         title: 'Erreur',
         text: 'Aucun dossier associé à cet utilisateur.',
       });
       return;
     }
 
     Swal.fire({
       title: 'Voulez-vous vraiment supprimer ce fichier ?',
       text: `Vous allez supprimer le fichier ${fileType}. Cette action est irréversible.`,
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#230046',
       cancelButtonColor: '#ccc',
       confirmButtonText: 'Oui, supprimer',
       cancelButtonText: 'Annuler'
     }).then((result) => {
       if (result.isConfirmed) {
         this.fileService.deleteSingleFile(this.dossierId!, fileType).subscribe({
           next: (response) => {
             console.log('Delete response:', response); // Log response for debugging
             Swal.fire({
               icon: 'success',
               title: 'Succès',
               text: `Fichier ${fileType} supprimé avec succès.`,
             });
             this.selectedFileType = null;
           },
           error: (error) => {
             console.error(`Erreur lors de la suppression du fichier ${fileType}`, error);
             Swal.fire({
               icon: 'error',
               title: 'Erreur',
               text: `Erreur lors de la suppression du fichier ${fileType}.`,
             });
             this.selectedFileType = null;
           }
         });
       }
     });
   }
 
   goBack(): void {
     this.router.navigate(['/users']);
   }}