import { useMemo } from "react";
import { localStorageService } from "../service/localStorage";

const useAccountController = () => {
  const auth = localStorageService.getAuth("auth");

  const isAdmin = useMemo(() => {
    if (auth) {
      return JSON.parse(auth).user_type === "ADMIN";
    } else {
      return undefined;
    }
  }, [auth]);

  return {
    isAdmin: true,
  };
};

export default useAccountController;
