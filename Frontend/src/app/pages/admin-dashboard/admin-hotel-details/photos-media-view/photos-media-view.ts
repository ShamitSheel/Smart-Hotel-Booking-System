import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Hotel } from '../../../../core/models/hotel.model';
import { HotelListingService } from '../../../../core/services/hotel-listing-service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-photos-media-view',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, MatProgressSpinnerModule],
  templateUrl: './photos-media-view.html',
  styleUrls: ['./photos-media-view.css']
})
export class PhotosMediaViewComponent implements OnChanges {
  @Input() initialData!: Hotel;
  @Output() dataUpdated = new EventEmitter<Partial<Hotel>>();

  isEditing = false;
  photos: { url: string; isUploading?: boolean }[] = [];
  primaryImage: string | null = null;
  
  constructor(private hotelListingService: HotelListingService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && changes['initialData'].currentValue) {
      this.photos = [...this.initialData.images.map(url => ({ url }))];
      this.primaryImage = this.initialData.primaryImage || null;
      console.log(this.primaryImage)

      if (this.primaryImage && !this.initialData.images.includes(this.primaryImage)) {
        this.primaryImage = this.initialData.images[0] || null;
      }
    }
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onCancel(): void {
    this.isEditing = false;
    this.photos = [...this.initialData.images.map(url => ({ url }))];
    this.primaryImage = this.initialData.primaryImage || null;
  }

  onSave(): void {
    this.dataUpdated.emit({ 
      images: this.photos.map(p => p.url),
      primaryImage: this.primaryImage ?? undefined
    });
    this.isEditing = false;
  }
  
  setPrimary(photoUrl: string): void {
    this.primaryImage = photoUrl;
  }

  onDelete(index: number): void {
    const photoUrl = this.photos[index].url;
    this.photos.splice(index, 1);
    
    // --- CRITICAL FIX ---
    // If the deleted photo was the primary one, set a new primary image.
    if (this.primaryImage === photoUrl) {
      this.primaryImage = this.photos.length > 0 ? this.photos[0].url : null;
    }
  }

  onDrop(event: CdkDragDrop<{ url: string; isUploading?: boolean }[], any, any>) {
    moveItemInArray(this.photos, event.previousIndex, event.currentIndex);
  }

  handleFiles(files: FileList | null): void {
    if (!files || files.length === 0) return;
    
    const filesToUpload = Array.from(files);
    
    const tempImages = filesToUpload.map(file => ({ url: URL.createObjectURL(file), isUploading: true }));
    this.photos = [...this.photos, ...tempImages];

    this.hotelListingService.uploadImages(filesToUpload).subscribe({
      next: (uploadedUrls) => {
        const newPhotos = this.photos.map((photo, index) => {
          if (photo.isUploading) {
            const uploadedUrl = uploadedUrls.shift();
            if (uploadedUrl) {
              return { url: uploadedUrl };
            }
          }
          return photo;
        });
        this.photos = newPhotos.filter(p => !p.isUploading);

        if (!this.primaryImage && this.photos.length > 0) {
            this.primaryImage = this.photos[0].url;
        }
      },
      error: (err) => {
        console.error('Image upload failed:', err);
        alert('Image upload failed. Please try again.');
        this.photos = this.photos.filter(p => !p.isUploading);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }
}