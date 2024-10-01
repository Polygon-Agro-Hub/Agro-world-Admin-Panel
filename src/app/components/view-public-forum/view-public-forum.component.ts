import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PublicforumService } from '../../services/plant-care/publicforum.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-public-forum',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-public-forum.component.html',
  styleUrl: './view-public-forum.component.css',
})
export class ViewPublicForumComponent implements OnInit{
  psot:any;
  isDeleteVisible = false;
  post: any;

  constructor(
    private psotService: PublicforumService,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
      this.loadPosts();
  }

  loadPosts(): void{
    this.psotService.getAllPosts().subscribe((data: any[])=>{
      
      
      this.post = data;
      console.log(this.post);
    })
  }

  toggleDeleteButton() {
    this.isDeleteVisible = !this.isDeleteVisible;
  }


}
