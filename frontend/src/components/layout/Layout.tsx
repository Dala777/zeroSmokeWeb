import type React from "react"
import styled from "styled-components"
import Header from "./Header"
import Footer from "./Footer"
import { Outlet } from "react-router-dom"

const Main = styled.main`
  min-height: calc(100vh - 160px); /* Ajustar según la altura del header y footer */
`

const Layout: React.FC = () => {
  return (
    <>
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </>
  )
}

export default Layout
