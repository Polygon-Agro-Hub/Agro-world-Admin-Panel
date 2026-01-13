import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
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
  activeDeleteMenu: number | null = null;

  constructor(
    private psotService: PublicforumService,
    private router: Router,
    private publicForumSrv: PublicForumService,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) {}

  sendMessage(id: number) {
    if (!this.replyMessage.trim()) {
      return;
    }

    const replyData = {
      id: this.postId,
      replyMessage: this.replyMessage,
    };

    this.publicForumSrv.sendMessage(id, replyData).subscribe(
      (res) => {
        Swal.fire({
  title: 'Success!',
  text: 'Your reply has been sent.',
  icon: 'success',
  customClass: {
    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
    title: 'font-semibold text-lg',
  }
});
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

  toggleDeleteButton(postId: number): void {
    if (this.activeDeleteMenu === postId) {
      this.activeDeleteMenu = null;
    } else {
      this.activeDeleteMenu = postId;
    }
  }

  openPopup(id: number) {
    this.isPopupVisible = true;
    this.publiForum = [];
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
    this.activeDeleteMenu = null;

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this post? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicForumSrv.deletePublicForumPost(id).subscribe(
          (res: any) => {
            if (res) {
             Swal.fire({
  title: 'Deleted!',
  text: 'The post has been deleted.',
  icon: 'success',
  customClass: {
    popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
    title: 'font-semibold text-lg',
    htmlContainer: 'text-left',
  },
});
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
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Handle cancel button click - reload the page
        location.reload();
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
    customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
}).then((result) => {
    if (result.isConfirmed) {
        this.publicForumSrv.deleteReply(id).subscribe(
            (res: any) => {
                if (res) {
                    Swal.fire({
    title: 'Deleted!',
    text: 'The Reply has been deleted.',
    icon: 'success',
    customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
    }
}).then(() => {
    // Refresh the page after the success alert is closed
    location.reload();
});
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
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Simply do nothing - the popup will close automatically
        // No need for location.reload() here
        this.isLoading = false; // Ensure loading state is reset
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.relative.flex.flex-col') &&
      !target.closest('.relative.flex.justify-center.items-center.mx-5')
    ) {
      this.activeDeleteMenu = null;
    }
  }

  toggleDeleteMenu(commentId: number): void {
    if (this.activeDeleteMenu === commentId) {
      this.activeDeleteMenu = null;
    } else {
      this.activeDeleteMenu = commentId;
    }
  }

  hasReplies(chatId: number): boolean {
  return this.countReply && this.countReply.some(i => i.chatId === chatId);
}
}

class PublicForum {
  id!: number;
  replyMessage!: string;
  firstName!: string;
  lastName!: string;
  createdAt!: string;
  timeAgo?: string;
  replyStaffId!: number | null;
  staffFirstName!: string;
  staffLastName!: string;
}

class ReplyCount {
  'chatId': number;
  'replyCount': number;
}
