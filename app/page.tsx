import Navbar from "../components/layout/navbar";
import Sidemenu from "../components/layout/sidemenu";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-row h-full">
        <Sidemenu />
        <div className="flex-1 h-full p-6">
          <h1>Content</h1>
        </div>
      </div>
    </div>
  );
}
