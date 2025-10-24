import toast from 'react-hot-toast';

export const useToast = () => {
  const showToast = (message, type = 'success') => {
    const options = {
      duration: 3000,
      position: 'top-right',
      style: {
        borderRadius: '10px',
        background: type === 'success' ? '#10b981' : '#ef4444',
        color: '#fff',
      },
    };

    if (type === 'success') {
      toast.success(message, options);
    } else if (type === 'error') {
      toast.error(message, options);
    } else {
      toast(message, options);
    }
  };

  return { showToast };
};
