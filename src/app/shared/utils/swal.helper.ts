import Swal from 'sweetalert2';

const baseOptions = {
  confirmButtonColor: '#111827',
  customClass: {
    popup: 'lumi-swal-popup',
    confirmButton: 'lumi-swal-confirm'
  }
};

export function showSuccessAlert(title: string, text: string) {
  return Swal.fire({
    ...baseOptions,
    icon: 'success',
    title,
    text
  });
}

export function showErrorAlert(title: string, text: string) {
  return Swal.fire({
    ...baseOptions,
    icon: 'error',
    title,
    text
  });
}

export function showWarningAlert(title: string, text: string) {
  return Swal.fire({
    ...baseOptions,
    icon: 'warning',
    title,
    text
  });
}
