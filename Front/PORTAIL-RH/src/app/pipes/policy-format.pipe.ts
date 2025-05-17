import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPolicy',
    standalone: true // Add this to make the pipe standalone

})
export class PolicyFormatPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'CHOIX_LIBRE':
        return 'Choix Libre';
      case 'SEUIL_LIBRE':
        return 'Avec Seuil';
      case 'PLANNING_FIXE':
        return 'Planning Fixe (max jours)';
      case 'PLANNING_FIXE_JOURS_LIBRES':
        return 'Planning Fixe (jours libres)';
      default:
        return value;
    }
  }
}