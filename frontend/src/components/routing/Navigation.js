import { Routes, Route } from "react-router"
import { Home, Login, SignUp } from "../pages"


export default function Navigation () {
  return (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp />} />
  </Routes>
  )
}
