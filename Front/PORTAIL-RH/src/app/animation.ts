import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('300ms ease', style({ opacity: 0 })),
  ]),
]);

export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      stagger(60, [
        animate('300ms ease', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ], { optional: true }),
  ]),
]);

export const slideInAnimation = trigger('slideInAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(-10px)', opacity: 0 }),
    animate('300ms ease', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
]);

export const tabAnimation = trigger('tabAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-10px)' }),
    animate('300ms ease', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate('300ms ease', style({ opacity: 0, transform: 'translateY(-10px)' })),
  ]),
]);