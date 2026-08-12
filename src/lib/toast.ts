import Swal from 'sweetalert2';
import { toast as sonnerToast } from 'sonner';

export const Toast = {
  fire: ({ icon, title }: { icon?: 'success' | 'error' | 'warning' | 'info' | 'question', title: string }) => {
    switch (icon) {
      case 'success':
        sonnerToast.success(title);
        break;
      case 'error':
        sonnerToast.error(title);
        break;
      case 'warning':
        sonnerToast.warning(title);
        break;
      case 'info':
      case 'question':
      default:
        sonnerToast.info(title);
        break;
    }
  }
};

export const ConfirmModal = Swal.mixin({
  title: 'Are you sure?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: 'var(--accent)',
  cancelButtonColor: '#71717a',
  confirmButtonText: 'Yes, proceed',
  cancelButtonText: 'Cancel',
  background: 'var(--surface)',
  color: 'var(--ink)',
});
