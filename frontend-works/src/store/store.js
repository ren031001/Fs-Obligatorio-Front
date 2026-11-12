import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./slices/categoriesSlice";
import worksReducer from "./slices/worksSlice";
import usuarioReducer from "./slices/usuarioSlice";

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
    works: worksReducer,
    usuario: usuarioReducer,
  },
});
