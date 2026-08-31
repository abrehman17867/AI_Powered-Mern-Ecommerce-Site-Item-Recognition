import { toast } from "react-toastify";

const defaults = {
  position: "bottom-right",
  autoClose: 3800,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const adminToast = {
  success: (message) => toast.success(message, { ...defaults }),
  error: (message) => toast.error(message, { ...defaults }),
  info: (message) => toast.info(message, { ...defaults }),
  warning: (message) => toast.warning(message, { ...defaults }),
};
