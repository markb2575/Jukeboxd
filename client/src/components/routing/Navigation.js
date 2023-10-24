import { Routes, Route } from "react-router"
import { Home, Login, SignUp, Profile, Error } from "../pages"


export default function Navigation () {
  return (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/user/:username" element={<Profile />} />
    <Route path="/404" element={<Error />} />
  </Routes>
  )
}
