import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './Pages/MainLayout/MainLayout'
import Home from './Pages/Home/Home'
import Login from './Pages/Login/Login'
import Register from './Pages/Register/Register'
import Books from './Pages/Books/Books'
import NotFound from './Pages/NotFound/NotFound'
import Authors from './Pages/Authors/Authors'
import TokenContextProvider from './Context/TokenContext'
import ProtectedRoutes from './Components/ProtectedRoutes/ProtectedRoutes'

export default function App() {
  
  const routes = createBrowserRouter([
    {
      path:"/",element: <MainLayout/>,
      children:[
        {index:true , element:<ProtectedRoutes><Home/></ProtectedRoutes>},
        {path:"login" , element:<Login/>},
        {path:"register" , element:<Register/>},
        {path:"books" , element:<ProtectedRoutes><Books/></ProtectedRoutes>},
        {path:"authors" , element:<ProtectedRoutes><Authors/></ProtectedRoutes>},
        {path:"*" , element:<NotFound/>},
      ]
    }
  ])
  return (
    <TokenContextProvider>
      <RouterProvider router={routes}></RouterProvider>
    </TokenContextProvider>
  )
}
