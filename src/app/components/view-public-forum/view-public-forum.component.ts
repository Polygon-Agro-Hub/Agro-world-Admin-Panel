import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { PublicForumService } from '../../services/plant-care/public-forum.service';
import { count, error, log, profile } from 'console';
import Swal from 'sweetalert2';
import { PublicforumService } from '../../services/plant-care/publicforum.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlantcareUsersService } from '../../services/plant-care/plantcare-users.service';
import { response } from 'express';

@Component({
  selector: 'app-view-public-forum',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './view-public-forum.component.html',
  styleUrl: './view-public-forum.component.css',
})
export class ViewPublicForumComponent implements OnInit {
  publiForum!: PublicForum[];
  isPopupVisible = false;
  deletePopUpVisible = false;
  deletePostVisible = false
  postId!: number;
  postRcord!: any;
  posts: any[] = [];
  isDeleteVisible = false;
  post: any;
  userPrifile: any;
  replyMessage: string = '';
  @Input() chatId!: number;
  count!: any;
  countReply!: ReplyCount[]
  hasData: boolean =false

  constructor(
    private psotService: PublicforumService,
    private router: Router,
    private publicForumSrv: PublicForumService
  ) { }

  sendMessage(id: number) {
    if (!this.replyMessage.trim()) {
      Swal.fire('Error!', 'Please enter a message.', 'error');
      return;
    }

    const replyData = {
      id: this.postId,
      replyMessage: this.replyMessage,
    };

    this.publicForumSrv.sendMessage(id, replyData).subscribe(
      (res) => {
        Swal.fire('Success!', 'Your reply has been sent.', 'success');
        this.fetchPostAllReply(this.postId);
        this.replyMessage = '';
      },
      (error) => {
        console.error('Error sending message:', error);
        Swal.fire('Error!', 'There was an error sending your reply.', 'error');
      }
    );
  }

  ngOnInit(): void {
    this.loadPosts();
    this.getCount();
  }

  loadPosts(): void {
    this.psotService.getAllPosts().subscribe((data: PublicForum[]) => {
      this.post = data.map((post) => {
        post.timeAgo = this.calculateTimeAgo(post.createdAt);
        return post;
      });
      if (data.length > 0) {
        this.hasData = true;
      }
      console.log(this.post);
      this.getCount();
    });
  }

  viewUserProfile(userId: number) {
    this.router.navigate(['/plant-care/plant-care-user-profile'], {
      queryParams: { userId },
    });
    console.log('forum U. Id', userId);
  }

  toggleDeleteButton() {
    this.isDeleteVisible = !this.isDeleteVisible;

  }

  openPopup(id: number) {
    this.isPopupVisible = true;
    this.fetchPostAllReply(id)
  }

  closePopup() {
    this.isPopupVisible = false;
  }

  openDeletePostPopup() {
    this.deletePopUpVisible = true;
  }

  closeDeletePostPopup() {
    this.deletePopUpVisible = true;
  }

  openDeletePopUp() {
    this.deletePopUpVisible = true;
  }
  closeDeletePopUp() {
    this.deletePopUpVisible = true;
  }

  fetchPostAllReply(id: number): void {
    this.publicForumSrv.getAllPostReply(id).subscribe(
      (data: PublicForum[]) => {
        this.publiForum = data.map((reply) => {
          reply.timeAgo = this.calculateTimeAgo(reply.createdAt);
          return reply;
        });
        console.log(this.publiForum);
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  deletePost(id: number) {
    console.log('delete id:', id);

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this post? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicForumSrv.deletePublicForumPost(id).subscribe(
          (res: any) => {
            if (res) {
              Swal.fire(
                'Deleted!',
                'The post has been deleted.',
                'success'
              );
              this.isPopupVisible = true;

            }
          },
          (error) => {
            console.log('Error', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the post.',
              'error'
            )
          }
        )
      }
    });

  }

  deleteReply(id: number) {
    console.log('delete id:', id);

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this reply message? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicForumSrv.deleteReply(id).subscribe(
          (res: any) => {
            if (res) {
              Swal.fire(
                'Deleted!',
                'The crop calendar item has been deleted.',
                'success'
              );
              this.isPopupVisible = true;
              this.fetchPostAllReply(this.postId);
            }
          },
          (error) => {
            console.log('Error', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the crop calendar.',
              'error'
            );
          }
        );
      }
    });
  }
  getCount() {
    this.publicForumSrv.getreplyCount().subscribe((data: any) => {
      console.log(data);

      this.countReply = data
    });
  }

  calculateTimeAgo(createdAt:string):string{
    const now = new Date();
    const postTime = new Date(createdAt);
    const diffInSeconds  = Math.floor((now.getTime() - postTime.getTime()) / 1000);

    if(diffInSeconds < 60){
      return `${diffInSeconds} sec ago`;
    }else if(diffInSeconds < 3600){
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    }else if (diffInSeconds < 86400){
      return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    }else{
      return `${Math.floor(diffInSeconds / 86400)} day(s) ago`;
    }
  }
}

class PublicForum {
  'id': number;
  'replyMessage': string;
  'firstName': string;
  'lastName': string;
  'createdAt': string;
  timeAgo?:string;
}

class ReplyCount {
  'chatId': number;
  'replyCount': number;

}
