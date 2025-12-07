import { useContext } from "react";
import { EditContext } from "./EditContext";

export const useEdit = () => useContext(EditContext);
