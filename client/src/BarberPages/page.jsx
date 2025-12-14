import { useNavigate} from "react-router-dom"

export default function HomePage() {
  const navigate =useNavigate();
    // Redirect to login page as the entry point
  navigate("/auth/login")
}
