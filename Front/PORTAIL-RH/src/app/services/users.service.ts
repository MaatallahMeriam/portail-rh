import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../shared/services/auth.service';

export interface RegisterRequest {
  userName: string;
  nom: string;
  prenom: string;
  mail: string;
  password?: string; // Champ optionnel pour correspondre à NewRegisterRequest
  dateNaissance: string;
  poste: string;
  departement: string;
  role: string;
}

export interface RegisterResponse {
  id: number;
  userName: string;
  mail: string;
  role: string;
  message: string;
}

export interface UserDTO {
  showDropdown: any;
  id: number;
  userName: string;
  nom: string;
  prenom: string;
  mail: string;
  dateNaissance: string;
  age: number;
  poste: string;
  departement: string;
  role: string;
  image?: string;
  dossierId?: number;
  active: boolean;
  numero: string;
  adresse: string;
  checked?: boolean;
  equipeId?: number;
  nomEquipe?: string;
}

export interface UserUpdateBasicDTO {
  userName?: string;
  nom?: string;
  prenom?: string;
  mail?: string;
  numero?: string;
  dateNaissance?: string;
  adresse?: string;
}

export interface UserUpdateFullDTO {
  userName?: string;
  nom?: string;
  prenom?: string;
  mail?: string;
  numero?: string;
  dateNaissance?: string;
  poste?: string;
  departement?: string;
  role?: string;
}

export interface UserCongesDTO {
  id: number;
  userId: number;
  congeTypeId: number;
  soldeActuel: number;
  type: string;
  validite: string;
}

export interface BirthdayUser {
  id: number;
  fullName: string;
  birthdate: string;
  avatar: string;
  isTodayBirthday: boolean;
  daysUntilBirthday: number;
}

export interface WishData {
  message: string;
  icon?: string;
  image?: File | null;
}

export interface BirthdayWishDTO {
  message: string;
  senderPhotoUrl: string | null;
  senderNom: string;
  senderPrenom: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  registerUser(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register-new`, registerRequest).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error.message || 'Une erreur est survenue lors de l\'enregistrement.',
        });
        return throwError(error);
      })
    );
  }

  modifierPassword(userId: number, newPassword: string): Observable<string> {
  const url = `${this.apiUrl}/users/${userId}/modifier-password?newPassword=${encodeURIComponent(newPassword)}`;
  return this.http.post<{ message: string }>(url, null, this.getAuthHeaders()).pipe(
    map(response => response.message), // Extraire le champ 'message'
    catchError((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.error?.message || 'Erreur lors de la modification du mot de passe.',
      });
      return throwError(error);
    })
  );
}


  updatePassword(userId: number, oldPassword: string, newPassword: string): Observable<string> {
    const url = `${this.apiUrl}/users/${userId}/update-password?oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`;
    return this.http.post<{ message: string }>(url, null, this.getAuthHeaders()).pipe(
        map(response => response.message), // Extraire le champ 'message'
        catchError((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.error?.message || 'Erreur lors de la mise à jour du mot de passe.',
            });
            return throwError(error);
        })
    );
}
  deleteProfilePhoto(userId: number): Observable<UserDTO> {
    return this.http.delete<UserDTO>(`${this.apiUrl}/users/${userId}/profile-photo`, this.getAuthHeaders()).pipe(
        catchError((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de la suppression de la photo de profil.',
            });
            return throwError(error);
        })
    );
}

  uploadDossierFiles(userId: number, cv: File | null, contrat: File | null, diplome: File | null): Observable<any> {
    const formData = new FormData();
    if (cv) formData.append('cv', cv);
    if (contrat) formData.append('contrat', contrat);
    if (diplome) formData.append('diplome', diplome);
    return this.http.post(`${this.apiUrl}/users/${userId}/dossier/upload`, formData, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'upload des fichiers.',
        });
        return throwError(error);
      })
    );
  }

  uploadProfilePhoto(userId: number, image: File): Observable<UserDTO> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<UserDTO>(`${this.apiUrl}/users/${userId}/profile-photo`, formData, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'upload de la photo de profil.',
        });
        return throwError(error);
      })
    );
  }
exportActiveUsersToCSV(): Observable<void> {
    return this.http.get(`${this.apiUrl}/users/export-active-users`, {
      ...this.getAuthHeaders(),
      responseType: 'blob' // Expect a binary file response (CSV)
    }).pipe(
      map((blob: Blob) => {
        // Create a URL for the blob and trigger the download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'active_users.csv'; // File name as specified in the backend
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url); // Clean up the URL object
      }),
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'exportation des utilisateurs actifs.',
        });
        return throwError(error);
      })
    );
  }

  exportUserCongesToCSV(): Observable<void> {
    return this.http.get(`${this.apiUrl}/users/export-user-conges`, {
      ...this.getAuthHeaders(),
      responseType: 'blob' // Expect a binary file response (CSV)
    }).pipe(
      map((blob: Blob) => {
        // Create a URL for the blob and trigger the download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'user_conges.csv'; // File name as specified in the backend
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url); // Clean up the URL object
      }),
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'exportation des congés des utilisateurs.',
        });
        return throwError(error);
      })
    );
  }
  getAllActiveUsersWithNoEquipe(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users/get/active/no-equipe`, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des utilisateurs actifs sans équipe.',
        });
        return throwError(() => new Error(error));
      })
    );
  }

  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users/get`, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des utilisateurs.',
        });
        return throwError(error);
      })
    );
  }

  getAllActiveUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users/get/active`, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des utilisateurs actifs.',
        });
        return throwError(error);
      })
    );
  }

  getAllDeactivatedUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users/get/deactivated`, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des utilisateurs désactivés.',
        });
        return throwError(error);
      })
    );
  }

  getUserConges(userId: number): Observable<UserCongesDTO[]> {
    return this.http.get<UserCongesDTO[]>(`${this.apiUrl}/users/${userId}/conges`, this.getAuthHeaders());
  }

  getUserById(userId: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/users/${userId}`, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des détails de l\'utilisateur.',
        });
        return throwError(error);
      })
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`, this.getAuthHeaders()).pipe(
      catchError((error) => {
        let errorMessage = 'Erreur lors de la suppression de l\'utilisateur.';
        if (error.status === 500 && error.error?.message?.includes('OptimisticLocking')) {
          errorMessage = 'L\'utilisateur est en cours de modification par une autre opération. Veuillez réessayer.';
        }
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage,
        });
        return throwError(error);
      })
    );
  }

  activateUser(userId: number): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/users/${userId}/activate`, {}, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'activation de l\'utilisateur.',
        });
        return throwError(error);
      })
    );
  }

  deactivateUser(userId: number): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/users/${userId}/deactivate`, {}, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'archivage de l\'utilisateur.',
        });
        return throwError(error);
      })
    );
  }

  updateUser(userId: number, updateData: Partial<UserDTO>): Observable<UserDTO> {
    return this.getUserById(userId).pipe(
      switchMap((currentUser) => {
        const updatedUser: UserDTO = {
          ...currentUser,
          ...updateData,
          id: currentUser.id,
          age: currentUser.age,
          dossierId: currentUser.dossierId,
          active: currentUser.active,
          image: updateData.image !== undefined ? updateData.image : currentUser.image
        };
        return this.http.put<UserDTO>(`${this.apiUrl}/users/${userId}`, updatedUser, this.getAuthHeaders());
      }),
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la mise à jour de l\'utilisateur.',
        });
        return throwError(error);
      })
    );
  }

  updateUserBasicInfo(userId: number, updateData: UserUpdateBasicDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/users/${userId}/update-basic`, updateData, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la mise à jour des informations de base de l\'utilisateur.',
        });
        return throwError(error);
      })
    );
  }

  updateUserFullInfo(userId: number, updateData: UserUpdateFullDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/users/${userId}/update-full`, updateData, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la mise à jour complète de l\'utilisateur.',
        });
        return throwError(error);
      })
    );
  }

 getBirthdays(): Observable<BirthdayUser[]> {
  return this.getAllActiveUsers().pipe(
    map(users => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-based (mai = 4)
      const currentDay = today.getDate();
      const birthdayUsers = users
        .filter(user => user.dateNaissance) // Filtrer les utilisateurs avec une date de naissance
        .map(user => {
          // Parser la date au format dd/MM/yyyy
          const [day, month, year] = user.dateNaissance.split('/').map(Number);
          const birthDate = new Date(year, month - 1, day); // month - 1 car getMonth est 0-based
          
          // Vérifier si la date est valide
          if (isNaN(birthDate.getTime())) {
            console.warn(`Date de naissance invalide pour l'utilisateur ${user.prenom} ${user.nom}: ${user.dateNaissance}`);
            return null;
          }

          const birthMonth = birthDate.getMonth();
          const birthDay = birthDate.getDate();
          const isTodayBirthday = birthMonth === currentMonth && birthDay === currentDay;

          let nextBirthdayYear = currentYear;
          if (birthMonth < currentMonth || (birthMonth === currentMonth && birthDay < currentDay)) {
            nextBirthdayYear++;
          }
          const nextBirthday = new Date(nextBirthdayYear, birthMonth, birthDay);
          const todayForComparison = new Date(currentYear, currentMonth, currentDay);
          const daysUntilBirthday = Math.round(
            (nextBirthday.getTime() - todayForComparison.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            id: user.id,
            fullName: `${user.prenom} ${user.nom}`,
            birthdate: `${birthDay.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`,
            avatar: user.image || 'assets/icons/user-login-icon-14.png',
            isTodayBirthday,
            daysUntilBirthday: daysUntilBirthday > 0 ? daysUntilBirthday : 365 + daysUntilBirthday
          };
        })
        .filter((user): user is BirthdayUser => user !== null); // Supprimer les utilisateurs avec des dates invalides

      const todaysBirthdays = birthdayUsers.filter(user => user.isTodayBirthday);
      const upcoming = birthdayUsers
        .filter(user => !user.isTodayBirthday && user.daysUntilBirthday !== undefined && user.daysUntilBirthday > 0)
        .sort((a, b) => a.daysUntilBirthday! - b.daysUntilBirthday!)
        .slice(0, 3);

      // Journaliser pour déboguer
      console.log('Utilisateurs avec anniversaires:', birthdayUsers);
      console.log('Anniversaires aujourd\'hui:', todaysBirthdays);
      console.log('Anniversaires à venir:', upcoming);

      return [...todaysBirthdays, ...upcoming];
    })
  );
}

  getSenderDetails(): Observable<{ id: number; email: string; name: string }> {
    const senderId = this.authService.getUserIdFromToken();
    const senderEmail = this.authService.getUserEmailFromToken();
    const senderName = this.authService.getUserNameFromToken();

    if (!senderId || !senderEmail || !senderName) {
      return throwError(() => new Error('Sender details not found. Please log in again.'));
    }

    return new Observable(observer => {
      observer.next({ id: senderId, email: senderEmail, name: senderName });
      observer.complete();
    });
  }

  getReceiverDetails(userId: number): Observable<{ id: number; fullName: string }> {
    return this.getUserById(userId).pipe(
      map(user => ({
        id: user.id,
        fullName: `${user.prenom} ${user.nom}`
      })),
      catchError(error => {
        console.error('Error fetching receiver details:', error);
        return throwError(error);
      })
    );
  }

  wishHappyBirthday(userId: number, wishData: WishData = { message: 'Joyeux anniversaire !' }): Observable<void> {
    return this.getSenderDetails().pipe(
      switchMap(sender => {
        return this.getReceiverDetails(userId).pipe(
          map(receiver => ({ sender, receiver }))
        );
      }),
      switchMap(({ sender, receiver }) => {
        console.log('Sending birthday wish:');
        console.log('Sender:', sender);
        console.log('Receiver:', receiver);

        const formData = new FormData();
        formData.append('message', wishData.message);
        if (wishData.icon) formData.append('icon', wishData.icon);
        if (wishData.image) formData.append('image', wishData.image);

        return this.http.post<void>(`${this.apiUrl}/users/${userId}/wish-birthday`, formData, this.getAuthHeaders()).pipe(
          catchError((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de l\'envoi du souhait d\'anniversaire.',
            });
            return throwError(error);
          })
        );
      })
    );
  }

  getBirthdayWishes(userId: number): Observable<BirthdayWishDTO[]> {
    return this.http.get<BirthdayWishDTO[]>(`${this.apiUrl}/users/${userId}/wishes`, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des souhaits d\'anniversaire.',
        });
        return throwError(error);
      })
    );
  }

  getWishedUsersToday(senderId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/users/${senderId}/wished-users-today`, this.getAuthHeaders()).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des utilisateurs déjà souhaités.',
        });
        return throwError(error);
      })
    );
  }

  private getAuthHeaders() {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No token found. Please log in.');
    }
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }
}