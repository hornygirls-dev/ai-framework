const AlertService = {
  show: (message, type = 'info') => {
    alert(message);
  },

  error: (message) => {
    alert(`Error: ${message}`);
  },

  success: (message) => {
    alert(`Success: ${message}`);
  },

  confirm: (message) => {
    return window.confirm(message);
  },
};

export default AlertService;
