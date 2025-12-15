import Dashboard from './pages/Dashboard';
import AddChild from './pages/AddChild';
import ChildDetail from './pages/ChildDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "AddChild": AddChild,
    "ChildDetail": ChildDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};