import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

interface Publication {
  id: number;
  userName: string;
  userPhoto: string;
  title: string;
  description: string;
  content: string;
  image?: string; 
  timestamp: Date;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent {
  publications: Publication[] = [
    {
      id: 1,
      userName: 'Fatma XXXXX  ',
      userPhoto: 'assets/icons/user-login-icon-14.png',
      title: 'Ma Première Publication',
      description: 'Publication sur mon quotidien',
      content: 'Ceci est ma première publication.',
      image: 'assets/images/news1.png',
      timestamp: new Date()
    },
    {
      id: 2,
      userName: 'Eya XXXXXX  ',
      userPhoto: 'assets/icons/user-login-icon-14.png',
      title: 'Un Beau Jour',
      description: 'Aujourd’hui est une magnifique journée !',
      content: 'Magnifique journée aujourd’hui.',
      timestamp: new Date()
    },
    {
      id: 1,
      userName: 'Fatma XXXXX  ',
      userPhoto: 'assets/icons/user-login-icon-14.png',
      title: 'Ma Première Publication',
      description: 'Publication sur mon quotidien',
      content: 'Ceci est ma première publication.',
      image: 'assets/images/news1.png',
      timestamp: new Date()
    },
    {
      id: 2,
      userName: 'Eya XXXXXX  ',
      userPhoto: 'assets/icons/user-login-icon-14.png',
      title: 'Un Beau Jour',
      description: 'Aujourd’hui est une magnifique journée !',
      content: 'Magnifique journée aujourd’hui.',
      timestamp: new Date()
    },{
      id: 1,
      userName: 'Fatma XXXXX  ',
      userPhoto: 'assets/icons/user-login-icon-14.png',
      title: 'Ma Première Publication',
      description: 'Publication sur mon quotidien',
      content: 'Ceci est ma première publication.',
      image: 'assets/images/news1.png',
      timestamp: new Date()
    },
    {
      id: 2,
      userName: 'Eya XXXXXX  ',
      userPhoto: 'assets/icons/user-login-icon-14.png',
      title: 'Un Beau Jour',
      description: 'Aujourd’hui est une magnifique journée !',
      content: 'Magnifique journée aujourd’hui.',
      timestamp: new Date()
    }
  ];

  newPostContent: string = '';

  addPost() {
    if (this.newPostContent.trim()) {
      const newPost: Publication = {
        id: this.publications.length + 1,
        userName: 'Moi',
        userPhoto: 'assets/users/my-profile.jpg',
        title: 'Nouvelle publication',
        description: 'Ma dernière réflexion',
        content: this.newPostContent,
        timestamp: new Date()
      };
      
      // Ajouter la nouvelle publication en haut du feed
      this.publications.unshift(newPost);
      this.newPostContent = '';
    }
  }
}
