import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lista: [],
};

export const categoriasSlice = createSlice({
  name: "categorias",
  initialState,
  reducers: {
    guardarCategorias: (state, action) => {
      state.lista = action.payload;
    },
    agregarCategoria: (state, action) => {
      state.lista.push(action.payload);
    },
    actualizarCategoria: (state, action) => {
      const indice = state.lista.findIndex((c) => c._id === action.payload._id);
      if (indice !== -1) {
        state.lista[indice] = action.payload;
      }
    },
    eliminarCategoria: (state, action) => {
      state.lista = state.lista.filter((c) => c._id !== action.payload);
    },
  },
});

export const {
  guardarCategorias,
  agregarCategoria,
  actualizarCategoria,
  eliminarCategoria,
} = categoriasSlice.actions;
export default categoriasSlice.reducer;
