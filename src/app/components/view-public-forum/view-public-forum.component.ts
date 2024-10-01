import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { PublicForumService } from '../../services/plant-care/public-forum.service';
import { error, log } from 'console';
import Swal from 'sweetalert2';
import { PublicforumService } from '../../services/plant-care/publicforum.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-public-forum',
  standalone: true,
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './view-public-forum.component.html',
  styleUrl: './view-public-forum.component.css',
})
export class ViewPublicForumComponent implements OnInit{
  publiForum!: PublicForum[];
  isPopupVisible = false;
  deletePopUpVisible = false;
  postId!: number;
  psot:any;
  isDeleteVisible = false;
  post: any;

  constructor(
    private psotService: PublicforumService,
    private route: ActivatedRoute,
    private publicForumSrv: PublicForumService
  ){}

  ngOnInit(): void {
    this.loadPosts();
    this.postId = 1;
    this.fetchPostAllReply(this.postId);
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

openPopup() {
  this.isPopupVisible = true;
}

closePopup() {
  this.isPopupVisible = false;
}

openDeletePopUp() {
  this.deletePopUpVisible = true;
}
closeDeletePopUp() {
  this.deletePopUpVisible = true;
}

fetchPostAllReply(id: number) {
  this.publicForumSrv.getAllPostReply(id).subscribe(
    (res) => {
      console.log(res);
      this.publiForum = res;
    },
    (error) => {
      console.log("Error: ", error);
    }
  )

}

deleteReply(id:number){
  console.log("delete id:",id);
  
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this crop Task item? This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  }).then((result)=>{
    if(result.isConfirmed){
      this.publicForumSrv.deleteReply(id).subscribe(
        (res:any)=>{
          if(res){
            Swal.fire(
              'Deleted!',
              'The crop calendar item has been deleted.',
              'success'
            );
            this.isPopupVisible = true;
            this.fetchPostAllReply(this.postId)
          }
        },
        (error)=>{
          console.log('Error', error);
          Swal.fire(
            'Error!',
            'There was an error deleting the crop calendar.',
            'error'
          );
        }
      )
    }
  })
}
}

class PublicForum {
  "id": number
  "replyMessage": string
  "createdAt": string
  "firstName": string
  "lastName": string
}
