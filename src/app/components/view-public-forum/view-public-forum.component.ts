import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { PublicForumService } from '../../services/plant-care/public-forum.service';
import Swal from 'sweetalert2';
import { PublicforumService } from '../../services/plant-care/publicforum.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlantcareUsersService } from '../../services/plant-care/plantcare-users.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { finalize } from 'rxjs/operators';
import { PermissionService } from '../../services/roles-permission/permission.service';
import { TokenService } from '../../services/token/services/token.service';

@Component({
  selector: 'app-view-public-forum',
  standalone: true,
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-public-forum.component.html',
  styleUrl: './view-public-forum.component.css',
})
export class ViewPublicForumComponent implements OnInit {
  publiForum!: PublicForum[];
  isPopupVisible = false;
  deletePopUpVisible = false;
  deletePostVisible = false;
  postId!: number;
  postRcord!: any;
  posts: any[] = [];
  isDeleteVisible = false;
  post: any;
  userPrifile: any;
  replyMessage: string = '';
  @Input() chatId!: number;
  count!: any;
  countReply!: ReplyCount[];
  hasData: boolean = false;
  selectPostId!: number;
  isLoading = false;
  isLoadingpop = false;

  constructor(
    private psotService: PublicforumService,
    private router: Router,
    private publicForumSrv: PublicForumService,
    public permissionService: PermissionService, 
    public tokenService: TokenService
  ) {}

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
        this.isPopupVisible = false;
        this.fetchPostAllReply(this.postId);
        this.loadPosts();
        this.getCount();
        this.replyMessage = '';
      },
      (error) => {
        Swal.fire('Error!', 'There was an error sending your reply.', 'error');
        this.isPopupVisible = false;
        this.fetchPostAllReply(this.postId);
        this.loadPosts();
        this.getCount();
      }
    );
  }

  ngOnInit(): void {
    this.loadPosts();
    this.getCount();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.psotService.getAllPosts().subscribe(
      (data: PublicForum[]) => {
        this.post = data.map((post) => {
          post.timeAgo = this.calculateTimeAgo(post.createdAt);
          return post;
        });
        this.hasData = data.length > 0;
        this.getCount();
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  viewUserProfile(userId: number) {
    this.router.navigate(['/plant-care/action/plant-care-user-profile'], {
      queryParams: { userId },
    });
  }

  toggleDeleteButton() {
    this.isDeleteVisible = !this.isDeleteVisible;
  }

  openPopup(id: number) {
    this.isPopupVisible = true;
    this.fetchPostAllReply(id);
    this.selectPostId = id;
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
    this.isLoadingpop = true;
    this.publicForumSrv
      .getAllPostReply(id)
      .pipe(finalize(() => (this.isLoadingpop = false)))
      .subscribe(
        (data: PublicForum[]) => {
          this.publiForum = data.map((reply) => {
            reply.timeAgo = this.calculateTimeAgo(reply.createdAt);
            return reply;
          });
        },
        (error) => {}
      );
  }

  deletePost(id: number) {
    this.isLoading = true;

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
              Swal.fire('Deleted!', 'The post has been deleted.', 'success');
              this.isPopupVisible = false;
              // this.isPopupVisible = false;

              this.fetchPostAllReply(this.postId);
              this.loadPosts();
              this.getCount();
              this.isLoading = false;
            }
          },
          (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting the post.',
              'error'
            );
            this.isPopupVisible = false;
            this.fetchPostAllReply(this.postId);
            this.loadPosts();
            this.getCount();
            this.isLoading = false;
          }
        );
      }
    });
  }

  deleteReply(id: number) {
    this.isLoading = true;

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
              Swal.fire('Deleted!', 'The Reply has been deleted.', 'success');
              this.isPopupVisible = false;
              this.fetchPostAllReply(this.postId);
              this.loadPosts();
              this.getCount();
              this.isLoading = false;
            }
          },
          (error) => {
            Swal.fire(
              'Error!',
              'There was an error deleting the crop calendar.',
              'error'
            );
            this.isPopupVisible = false;
            this.fetchPostAllReply(this.postId);
            this.loadPosts();
            this.getCount();
            this.isLoading = false;
          }
        );
      }
    });
  }

  getCount() {
    this.publicForumSrv.getreplyCount().subscribe((data: any) => {
      this.countReply = data;
    });
  }

  calculateTimeAgo(createdAt: string): string {
    const now = new Date();
    const postTime = new Date(createdAt);
    const diffInSeconds = Math.floor(
      (now.getTime() - postTime.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} day(s) ago`;
    }
  }

  back(): void {
    this.router.navigate(['/plant-care/action']);
  }

  onReplyMassageInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const original = input.value;
    
    // Remove leading spaces
    let trimmed = original.replace(/^\s+/, '');
  
    // Capitalize first letter if there's any input
    if (trimmed.length > 0) {
      trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
  
    input.value = trimmed; // Update input display
    this.replyMessage = trimmed; // Update model
  }
  
}

class PublicForum {
  'id': number;
  'replyMessage': string;
  'firstName': string;
  'lastName': string;
  'createdAt': string;
  timeAgo?: string;
}

class ReplyCount {
  'chatId': number;
  'replyCount': number;
}
