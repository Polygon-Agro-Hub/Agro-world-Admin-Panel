import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToastAlertService {
  constructor(private toastr: ToastrService) {}

  success(message: string, options: any = {}) {
    this.toastr.success(
      `
        <div class="flex items-center space-x-4 bg-[#D3ECFF] px-8 py-4">
          <!-- Icon -->
          <div class="flex items-center justify-center bg-[#0091FF] w-12 h-12 rounded-lg shadow-md">
            <i class="fa-solid fa-check text-white text-2xl"></i>
          </div>
          <!-- Text -->
          <p class="text-xl text-[#333333] m-0">${message}</p>

          <i class="fa-solid fa-xmark text-lg text-[#95A1AC]"></i>

        </div>
      `,
      '',
      {
        enableHtml: true,
        progressBar:true,
        positionClass: 'toast-bottom-right',
        toastClass: 'custom-hidden custom-toast-spacing', 
        timeOut: 5000, 
        tapToDismiss:true,
        ...options
      }
    );
  }

  error(message: string, options: any = {}) {
    this.toastr.warning(
      `
        <div class="flex items-center space-x-4 bg-[#FFDADA] px-8 py-4">
          <!-- Icon -->
          <div class="flex items-center justify-center bg-[#D63232] w-12 h-12 rounded-lg shadow-md">
            <i class="fa-solid fa-ban text-white text-2xl"></i>
          </div>
          <!-- Text -->
          <p class="text-xl text-[#333333] font-normal m-0">${message}</p>

          <i class="fa-solid fa-xmark text-lg text-[#95A1AC]"></i>

        </div>
      `,
      '',
      {
        enableHtml: true,
        progressBar:true,
        positionClass: 'toast-bottom-right',
        toastClass: 'custom-hidden custom-toast-spacing', 
        timeOut: 5000, 
        tapToDismiss:false,
        ...options
      }
    );
  }
  
  warning(message: string, options: any = {}) {
    this.toastr.warning(
      `
        <div class="flex items-center space-x-4 bg-[#FFEED3] px-8 py-4">
          <!-- Icon -->
          <div class="flex items-center justify-center bg-[#FF9F0A] w-12 h-12 rounded-lg shadow-md">
            <i class="fa-solid fa-triangle-exclamation text-white text-2xl"></i>
          </div>
          <!-- Text -->
          <p class="text-xl text-[#333333] m-0">${message}</p>

          <i class="fa-solid fa-xmark text-lg text-[#95A1AC]"></i>

        </div>
      `,
      '',
      {
        enableHtml: true,
        progressBar:true,
        positionClass: 'toast-bottom-right',
        toastClass: 'custom-hidden custom-toast-spacing', 
        timeOut: 5000, 
        tapToDismiss:false,
        ...options
      }
    );
  }
}
