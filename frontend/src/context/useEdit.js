import { useContext } from "react";
import { EditContext } from "./EditContext";

export const useEdit = () => {
  const context = useContext(EditContext);
  
  if (!context) {
    throw new Error("useEdit должен использоваться внутри EditProvider");
  }
  
  return context;
};