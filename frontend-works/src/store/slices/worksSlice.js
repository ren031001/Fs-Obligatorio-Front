import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lista: [],
  pagina: 1,
  totalPaginas: 1,
  total: 0,
  categoriaFiltro: "",
};

export const obrasSlice = createSlice({
  name: "obras",
  initialState,
  reducers: {
    guardarObras: (state, action) => {
      state.lista = action.payload.data;
      state.totalPaginas = action.payload.totalPages;
      state.total = action.payload.total;
    },
    cambiarPagina: (state, action) => {
      state.pagina = action.payload;
    },
    filtrarPorCategoria: (state, action) => {
      state.categoriaFiltro = action.payload;
      state.pagina = 1;
    },
    limpiarObras: () => initialState,
  },
});

export const {
  guardarObras,
  cambiarPagina,
  filtrarPorCategoria,
  limpiarObras,
} = obrasSlice.actions;
export default obrasSlice.reducer;
