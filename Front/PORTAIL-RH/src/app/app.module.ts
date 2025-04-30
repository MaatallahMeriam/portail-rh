import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import{AcceuilComponent} from './shared/components/acceuil/acceuil.component';
import { MatBadgeModule } from '@angular/material/badge';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AuthInterceptor } from '../../src/app/@core/interceptors/auth.interceptor'; // Ajuste le chemin

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppComponent,
    AppRoutingModule,
    MatNativeDateModule,
    MatDatepickerModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CarouselModule,
    AcceuilComponent,
    MatBadgeModule,
    NgxDatatableModule
    
     
  ],
  providers: [provideHttpClient(withInterceptorsFromDi()),
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
