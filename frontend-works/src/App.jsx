import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import { store } from "./store/store";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Works from "./components/Works/List/Works.jsx";
import CreateWorkForm from "./components/Works/Form/CreateWorkForm";
import Menu from "./components/Menu/Menu";
import RutaProtegida from "./components/Routes/RutaProtegida";
import PlanPage from "./components/Plan/PlanPage";
import Stats from "./components/Stats/Stats";
import Mapa from "./components/Mapa/Mapa";
import RutaAdmin from "./components/Routes/RutaAdmin.jsx";
import Categorias from "./components/Categorias/Categorias";
import UserRoute from "./components/Routes/UserRoute";

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<RutaProtegida />}>
            <Route element={<Menu />}>
              <Route element={<UserRoute />}>
                <Route path="/works" element={<Works />} />
                <Route path="/works/new" element={<CreateWorkForm />} />
                <Route path="/plan" element={<PlanPage />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/map" element={<Mapa />} />
              </Route>
              <Route element={<RutaAdmin />}>
                <Route path="/categories" element={<Categorias />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" />
    </Provider>
  );
};

export default App;
