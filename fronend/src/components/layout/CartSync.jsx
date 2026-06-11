import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCart } from "../../State/Cart/Action";

/** Keeps cart count in sync after refresh, login, and route changes. */
export default function CartSync() {
  const dispatch = useDispatch();

  useEffect(() => {
    const sync = () => {
      if (localStorage.getItem("jwt")) {
        dispatch(getCart({ silent: true }));
      }
    };

    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [dispatch]);

  return null;
}
