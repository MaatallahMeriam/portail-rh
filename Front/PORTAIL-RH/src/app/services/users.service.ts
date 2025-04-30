import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

export interface RegisterRequest {
  userName: string;
  nom: string;
  prenom: string;
  mail: string;
  password: string;
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
  dateNaissance: string; // Changed from string (ISO date) to string (formatted date)
  age: number;
  poste: string;
  departement: string;
  role: string;
  image?: string;
  dossierId?: number;
  active: boolean;
  numero: string;
  checked?: boolean;
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
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  registerUser(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, registerRequest).pipe(
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
  
  uploadDossierFiles(userId: number, cv: File | null, contrat: File | null, diplome: File | null): Observable<any> {
    const formData = new FormData();
    if (cv) formData.append('cv', cv);
    if (contrat) formData.append('contrat', contrat);
    if (diplome) formData.append('diplome', diplome);

    return this.http.post(`${this.apiUrl}/users/${userId}/dossier/upload`, formData).pipe(
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

  uploadUserImage(userId: number, image: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<string>(`${this.apiUrl}/users/${userId}/upload-image`, formData).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'upload de l\'image.',
        });
        return throwError(error);
      })
    );
  }

  getAllActiveUsersWithNoEquipe(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users/get/active/no-equipe`).pipe(
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
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users/get`).pipe(
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
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users/get/active`).pipe(
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
    return this.http.get<UserDTO[]>(`${this.apiUrl}/users/get/deactivated`).pipe(
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
    return this.http.get<UserCongesDTO[]>(`${this.apiUrl}/users/${userId}/conges`);
  }

  getUserById(userId: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/users/${userId}`).pipe(
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
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression de l\'utilisateur.',
        });
        return throwError(error);
      })
    );
  }
  activateUser(userId: number): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/users/${userId}/activate`, {}).pipe(
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
    return this.http.put<UserDTO>(`${this.apiUrl}/users/${userId}/deactivate`, {}).pipe(
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
          active: currentUser.active
        };
        return this.http.put<UserDTO>(`${this.apiUrl}/users/${userId}`, updatedUser);
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

  getBirthdays(): Observable<BirthdayUser[]> {
    return this.getAllActiveUsers().pipe(
      map(users => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        const birthdayUsers = users.map(user => {
          const birthDate = new Date(user.dateNaissance);
          const birthMonth = birthDate.getMonth() + 1;
          const birthDay = birthDate.getDate();
          const isTodayBirthday = birthMonth === currentMonth && birthDay === currentDay;
          let nextBirthdayYear = currentYear;
          if (birthMonth < currentMonth || (birthMonth === currentMonth && birthDay < currentDay)) {
            nextBirthdayYear++;
          }
          const nextBirthday = new Date(nextBirthdayYear, birthMonth - 1, birthDay);
          const todayForComparison = new Date(currentYear, today.getMonth(), today.getDate());
          const daysUntilBirthday = Math.round(
            (nextBirthday.getTime() - todayForComparison.getTime()) / (1000 * 60 * 60 * 24)
          );
          return {
            id: user.id,
            fullName: `${user.prenom} ${user.nom}`,
            birthdate: `${birthDay}/${birthMonth}`,
            avatar: user.image || 'assets/icons/user-login-icon-14.png',
            isTodayBirthday,
            daysUntilBirthday
          };
        });
        const todaysBirthdays = birthdayUsers.filter(user => user.isTodayBirthday);
        const upcoming = birthdayUsers
          .filter(user => !user.isTodayBirthday)
          .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday)
          .slice(0, 3);
        return [...todaysBirthdays, ...upcoming];
      })
    );
  }

  wishHappyBirthday(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/wish-birthday`, {}).pipe(
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'envoi du souhait d\'anniversaire.',
        });
        return throwError(error);
      })
    );
  }
}