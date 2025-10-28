import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ImagePreview {
  url: string; 
  file?: File; // Make the file property optional
  isPrimary: boolean;
  isNew: boolean; // Flag to distinguish new files from existing URLs
}

@Component({
  selector: 'app-photos-media',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photos-media.html',
  styleUrls: ['./photos-media.css']
})
export class PhotosMediaComponent implements OnInit {
  @Input() initialImages: string[] = [];
  @Output() formSubmitted = new EventEmitter<{ files: File[], primaryFile: File | undefined }>();
  @Output() goBack = new EventEmitter<void>();
  @Output() imagesUpdated = new EventEmitter<{ images: string[], primaryImage?: string }>();

  imagePreviews: ImagePreview[] = [];
  isDragging = false;

  ngOnInit(): void {
    // Populate with initial images from the backend (URLs)
    this.imagePreviews = this.initialImages.map((url, index) => ({
      url,
      isPrimary: index === 0,
      isNew: false
    }));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleFiles(files: File[]): void {
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviews.push({
          url: e.target?.result as string,
          file: file,
          isPrimary: this.imagePreviews.length === 0,
          isNew: true
        });
        
        this.emitImagesUpdate();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    if (this.imagePreviews.length > 0 && !this.imagePreviews.some(img => img.isPrimary)) {
      this.imagePreviews[0].isPrimary = true;
    }
    this.emitImagesUpdate(); 
  }

  setPrimaryImage(index: number): void {
    this.imagePreviews.forEach((img, i) => img.isPrimary = i === index);
    const primaryImage = this.imagePreviews.splice(index, 1)[0];
    this.imagePreviews.unshift(primaryImage);
    this.emitImagesUpdate(); 
  }

  onSubmit(): void {
    const newFiles = this.imagePreviews.filter(p => p.isNew).map(p => p.file!);
    const primaryFile = this.imagePreviews.find(p => p.isPrimary && p.isNew)?.file;
    this.formSubmitted.emit({ files: newFiles, primaryFile });
  }

  onGoBack(): void {
    this.goBack.emit();
  }

  private emitImagesUpdate(): void {
    const images = this.imagePreviews.map(p => p.url);
    const primaryImage = this.imagePreviews.find(p => p.isPrimary)?.url;
    this.imagesUpdated.emit({ images, primaryImage });
  }
}
