// file.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://localhost:8080/api/dossier';

  constructor(private http: HttpClient) {}

  downloadFile(dossierId: number, fileType: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${dossierId}/${fileType}`, {
      responseType: 'blob'
    });
  }

  uploadSingleFile(dossierId: number, fileType: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload/${dossierId}/${fileType}`, formData);
  }
  deleteSingleFile(dossierId: number, fileType: string): Observable<any> {
    console.log(`Calling DELETE ${this.apiUrl}/delete/${dossierId}/${fileType}`);
    return this.http.delete(`${this.apiUrl}/delete/${dossierId}/${fileType}`);
  }
}