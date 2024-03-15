import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", width: "100%", paddingTop: 10, paddingBottom: 10, background: "#efefef" }}>
        <span style={{ flex: 1, paddingLeft: 10 }}>
          <Link to="/">Home</Link>
        </span>
        <span style={{ flex: 1, paddingLeft: 10 }}>
          <Link to="/chat">Chat</Link>
        </span>
        <span style={{ flex: 1, paddingLeft: 10 }}>
          <Link to="/contact">Contact</Link>
        </span>
      </div>

      <Outlet />
    </>
  )
};

export default Layout;
