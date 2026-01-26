// Handles auto-adding new rows in inline formsets
// ============================================================

(function() {
    'use strict';
    
    // Listen for successful uploads
    document.addEventListener('imagekit:uploaded', function(event) {
        const inline = event.target.closest('.inline-related');
        if (!inline) return;
        
        // Check if this is the last row in the formset
        const allRows = inline.closest('.inline-group').querySelectorAll('.inline-related');
        const isLastRow = inline === allRows[allRows.length - 1];
        
        if (isLastRow) {
            // Find and click the "Add another" button
            const addButton = inline.closest('.inline-group').querySelector('.add-row a');
            if (addButton) {
                setTimeout(() => {
                    addButton.click();
                }, 500); // Small delay for smooth UX
            }
        }
    });
    
    // Handle deletion of rows with uploaded images
    document.addEventListener('click', function(event) {
        const deleteCheckbox = event.target.closest('[name$="-DELETE"]');
        if (!deleteCheckbox) return;
        
        const row = deleteCheckbox.closest('.inline-related');
        const imageUrl = row.querySelector('[name$="image_url"]')?.value;
        
        if (imageUrl && deleteCheckbox.checked) {
            // Optional: Show confirmation
            if (!confirm('This will mark the image for deletion. Continue?')) {
                deleteCheckbox.checked = false;
                event.preventDefault();
            }
        }
    });
})();