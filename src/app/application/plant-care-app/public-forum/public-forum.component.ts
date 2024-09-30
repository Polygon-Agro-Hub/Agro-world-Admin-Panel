import { Component } from '@angular/core';
import { ViewPublicForumComponent } from "../../../components/view-public-forum/view-public-forum.component";

@Component({
  selector: 'app-public-forum',
  standalone: true,
  imports: [ViewPublicForumComponent],
  templateUrl: './public-forum.component.html',
  styleUrl: './public-forum.component.css'
})
export class PublicForumComponent {

}
