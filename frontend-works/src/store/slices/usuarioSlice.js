import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  datos: null,
};

export const usuarioSlice = createSlice({
  name: "usuario",
  initialState,
  reducers: {
    guardarUsuario: (state, action) => {
      state.datos = action.payload;
    },
    limpiarUsuario: (state) => {
      state.datos = null;
    },
  },
});

export const { guardarUsuario, limpiarUsuario } = usuarioSlice.actions;
export default usuarioSlice.reducer;
