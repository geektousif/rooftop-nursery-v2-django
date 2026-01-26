(function() {
    'use strict';

    function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');
    
    class ImageKitUploader {
        constructor(inputElement) {
            this.input = inputElement;
            this.container = inputElement.closest('.imagekit-upload-container');
            this.urlField = this.container.querySelector('[name$="image_url"]');
            this.providerIdField = this.container.querySelector('[name$="image_provider_id"]');
            this.progressBar = this.container.querySelector('.upload-progress');
            this.preview = this.container.querySelector('.upload-preview');
            this.statusText = this.container.querySelector('.upload-status');
            
            this.init();
        }
        
        init() {
            this.input.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        async handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Validate file
            if (!file.type.startsWith('image/')) {
                this.showError('Please select an image file');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showError('File size must be less than 10MB');
                return;
            }
            
            try {
                this.showProgress('Getting upload credentials...');
                
                // Step 1: Get signature from Django
                const signature = await this.getSignature();
                
                // Step 2: Upload to ImageKit
                this.showProgress('Uploading to ImageKit...', 30);
                const uploadResult = await this.uploadToImageKit(file, signature);
                
                // Step 3: Save URLs to hidden fields
                this.urlField.value = uploadResult.url;
                this.providerIdField.value = uploadResult.fileId;
                
                // Step 4: Show preview
                this.showPreview(uploadResult.url);
                this.showSuccess('Upload complete!');
                
                // Step 5: Trigger add new row (for inline formsets)
                this.triggerNewRow();
                
            } catch (error) {
                console.error('Upload failed:', error);
                this.showError(error.message || 'Upload failed. Please try again.');
            }
        }
        
        async getSignature() {
            const response = await fetch('/admin/api/imagekit-auth/', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrftoken, // Set the header here
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get upload credentials');
            }
            
            return await response.json();
        }
        
        async uploadToImageKit(file, signature) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('publicKey', signature.publicKey);
            formData.append('signature', signature.signature);
            formData.append('timestamp', signature.timestamp);
            formData.append('folder', signature.folder);
            
            // ImageKit transformations (optimize on upload)
            formData.append('transformation', JSON.stringify({
                pre: 'w-1200,h-1200,c-at_max,q-85,f-webp'
            }));
            
            const response = await fetch(signature.uploadUrl, {
                method: 'POST',
                body: formData,
                headers : {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrftoken,
                }
            });

            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'ImageKit upload failed');
            }
            
            return await response.json();
        }
        
        showProgress(message, percent = 0) {
            if (this.progressBar) {
                this.progressBar.style.display = 'block';
                this.progressBar.querySelector('.progress-fill').style.width = `${percent}%`;
            }
            if (this.statusText) {
                this.statusText.textContent = message;
                this.statusText.className = 'upload-status uploading';
            }
        }
        
        showPreview(imageUrl) {
            if (this.preview) {
                const img = document.createElement('img');
                img.src = imageUrl.replace('/tr:', '/tr:w-150,h-150,c-at_max/');
                img.className = 'uploaded-image';
                this.preview.innerHTML = '';
                this.preview.appendChild(img);
                this.preview.style.display = 'block';
            }
        }
        
        showSuccess(message) {
            if (this.progressBar) {
                this.progressBar.style.display = 'none';
            }
            if (this.statusText) {
                this.statusText.textContent = message;
                this.statusText.className = 'upload-status success';
                
                // Clear status after 3 seconds
                setTimeout(() => {
                    this.statusText.textContent = '';
                }, 3000);
            }
        }
        
        showError(message) {
            if (this.progressBar) {
                this.progressBar.style.display = 'none';
            }
            if (this.statusText) {
                this.statusText.textContent = message;
                this.statusText.className = 'upload-status error';
            }
        }
        
        triggerNewRow() {
            // Trigger Django's inline formset to add new empty row
            const event = new CustomEvent('imagekit:uploaded', {
                bubbles: true,
                detail: { uploader: this }
            });
            this.container.dispatchEvent(event);
        }
    }
    
    // Initialize all uploaders on page load
    function initializeUploaders() {
        document.querySelectorAll('.imagekit-upload-widget').forEach(input => {
            if (!input.dataset.initialized) {
                new ImageKitUploader(input);
                input.dataset.initialized = 'true';
            }
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeUploaders);
    } else {
        initializeUploaders();
    }
    
    // Re-initialize when new inline rows are added
    document.addEventListener('formset:added', initializeUploaders);
    
    // Expose globally for manual initialization
    window.ImageKitUploader = ImageKitUploader;
})();
