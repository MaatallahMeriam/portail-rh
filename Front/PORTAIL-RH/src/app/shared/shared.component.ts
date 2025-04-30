import { Component } from '@angular/core';

import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

@Component({
  selector: 'shared-space',
  standalone: true,
  imports: [
    
  ],
  templateUrl: './shared.component.html',
  styleUrl: './shared.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SharedSpaceComponent {
 
}
