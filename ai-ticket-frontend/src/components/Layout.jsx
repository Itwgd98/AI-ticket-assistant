import Navbar from "./navbar.jsx";

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="p-4">{children}</div>
    </div>
  );
}
