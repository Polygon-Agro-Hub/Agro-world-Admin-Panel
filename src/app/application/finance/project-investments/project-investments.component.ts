// project-investments.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../../services/finance/finance.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

interface ProjectInvestment {
  id: number;
  phoneNumber: string;
  cropGroupImage: string;
  cropNameEnglish: string;
  jobId: string;
  defineShares: number;
  fillShares: number;
  investedPercentage?: number;
  imageDataUrl?: string;
  imageLoading?: boolean;
}

@Component({
  selector: 'app-project-investments',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './project-investments.component.html',
  styleUrls: ['./project-investments.component.css'],
})
export class ProjectInvestmentsComponent implements OnInit {
  isLoading = false;
  searchTerm = '';
  totalCount = 0;
  defaultImage = 'assets/placeholder-image.png';

  projectInvestments: ProjectInvestment[] = [];
  filteredProjects: ProjectInvestment[] = [];

  constructor(
    private router: Router,
    private financeService: FinanceService,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.loadProjectInvestments();
  }

  loadProjectInvestments(search?: string): void {
    this.isLoading = true;
    this.financeService.getProjectInvestments(search)
      .pipe(
        finalize(() => this.isLoading = false),
        catchError(error => {
          console.error('Error loading project investments:', error);
          return of({ count: 0, data: [] });
        })
      )
      .subscribe({
        next: (response) => {
          this.projectInvestments = response.data.map((project: any) => ({
            ...project,
            investedPercentage: project.defineShares && project.fillShares
              ? Math.round((project.fillShares / project.defineShares) * 100)
              : 0,
            imageDataUrl: undefined,
            imageLoading: true
          }));
          this.filteredProjects = [...this.projectInvestments];
          this.totalCount = response.count;

          this.loadAllImages();
        },
        error: (error) => {
          console.error('Error in subscription:', error);
          this.projectInvestments = [];
          this.filteredProjects = [];
          this.totalCount = 0;
        }
      });
  }

  loadAllImages(): void {
    this.projectInvestments.forEach((project) => {
      if (project.cropGroupImage) {
        this.removeBackgroundFromImage(project.cropGroupImage).then(
          (dataUrl) => {
            project.imageDataUrl = dataUrl;
            project.imageLoading = false;
          },
          (error) => {
            console.error(`Error processing image for project ${project.id}:`, error);
            // Fallback to original image if background removal fails
            this.loadImage(project.cropGroupImage).then(
              (originalDataUrl) => {
                project.imageDataUrl = originalDataUrl;
                project.imageLoading = false;
              },
              () => {
                project.imageDataUrl = this.defaultImage;
                project.imageLoading = false;
              }
            );
          }
        );
      } else {
        project.imageDataUrl = this.defaultImage;
        project.imageLoading = false;
      }
    });
  }

  private removeBackgroundFromImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the image
          ctx.drawImage(img, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Method 1: Remove white/light background (most common)
          this.removeWhiteBackground(data);

          // Alternative: Method 2 - Remove based on edge detection
          // this.removeBackgroundByEdges(data, canvas.width, canvas.height);

          // Alternative: Method 3 - Simple transparency based on color similarity
          // this.makeBackgroundTransparent(data, canvas.width, canvas.height);

          // Put the modified image data back
          ctx.putImageData(imageData, 0, 0);

          // Convert to PNG to preserve transparency
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('Image load error:', error);
        reject(error);
      };

      // Add timestamp to prevent caching
      img.src = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
    });
  }

  // Method 1: Remove white/light background
  private removeWhiteBackground(data: Uint8ClampedArray): void {
    const threshold = 200; // Adjust this value based on your images (0-255)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Check if pixel is white/light
      if (r > threshold && g > threshold && b > threshold) {
        // Make pixel transparent
        data[i + 3] = 0;
      }
    }
  }

  // Method 2: Remove background by detecting edges (more sophisticated)
  private removeBackgroundByEdges(data: Uint8ClampedArray, width: number, height: number): void {
    // This is a simplified edge detection algorithm
    // For production, you might want to use a more sophisticated approach

    // First pass: identify potential background pixels
    const isBackground = new Array(data.length / 4).fill(false);

    // Sample edges to determine background color
    const edgeColors = this.getEdgeColors(data, width, height);
    const backgroundThreshold = 30;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Check if pixel color is similar to edge colors
        let isSimilarToBackground = false;
        for (const edgeColor of edgeColors) {
          const diff = Math.abs(r - edgeColor.r) +
            Math.abs(g - edgeColor.g) +
            Math.abs(b - edgeColor.b);
          if (diff < backgroundThreshold * 3) { // *3 because we're comparing RGB
            isSimilarToBackground = true;
            break;
          }
        }

        if (isSimilarToBackground) {
          // Make pixel transparent
          data[index + 3] = 0;
        }
      }
    }
  }

  // Helper method for edge detection
  private getEdgeColors(data: Uint8ClampedArray, width: number, height: number): Array<{ r: number, g: number, b: number }> {
    const edgeColors = [];
    const samplePoints = 100;

    // Sample from top edge
    for (let i = 0; i < samplePoints && i < width; i++) {
      const index = i * 4;
      edgeColors.push({
        r: data[index],
        g: data[index + 1],
        b: data[index + 2]
      });
    }

    // Sample from bottom edge
    const bottomStart = (height - 1) * width * 4;
    for (let i = 0; i < samplePoints && i < width; i++) {
      const index = bottomStart + i * 4;
      edgeColors.push({
        r: data[index],
        g: data[index + 1],
        b: data[index + 2]
      });
    }

    return edgeColors;
  }

  // Method 3: Simple transparency based on color similarity
  private makeBackgroundTransparent(data: Uint8ClampedArray, width: number, height: number): void {
    // Get the most common color (likely the background)
    const colorCounts = new Map<string, number>();

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = `${r},${g},${b}`;
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    }

    // Find the most common color
    let maxCount = 0;
    let backgroundColor = { r: 255, g: 255, b: 255 }; // Default to white
    colorCounts.forEach((count, key) => {
      if (count > maxCount) {
        maxCount = count;
        const [r, g, b] = key.split(',').map(Number);
        backgroundColor = { r, g, b };
      }
    });

    // Make similar colors transparent
    const threshold = 50;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const diff = Math.abs(r - backgroundColor.r) +
        Math.abs(g - backgroundColor.g) +
        Math.abs(b - backgroundColor.b);

      if (diff < threshold) {
        data[i + 3] = 0; // Make transparent
      }
    }
  }

  // Original loadImage method (as fallback)
  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            resolve(dataUrl);
          } else {
            reject(new Error('Could not get canvas context'));
          }
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('Image load error:', error);
        reject(error);
      };

      img.src = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
    });
  }

  filterProjects(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProjects = [...this.projectInvestments];
      return;
    }
    this.loadProjectInvestments(this.searchTerm.trim());
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredProjects = [...this.projectInvestments];
    this.loadProjectInvestments();
  }

  Back(): void {
    this.router.navigate([
      '/finance/action/finance-govicapital/ivesment-requests',
    ]);
  }

  viewDetails(id: number) {
    this.router.navigate([
      `/finance/action/finance-govicapital/project-investments-transactions/${id}`,
    ]);
  }
}