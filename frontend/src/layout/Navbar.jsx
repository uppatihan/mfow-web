export default function Navbar() {
  return (
    <header className="w-full bg-blue-900 flex items-center px-10 shadow-md h-auto py-1">
      <div className="flex flex-col items-center">
        <img
          src="/mflow-logo-white2.png"
          alt="MFlow Logo"
          className="h-12 w-auto mb-1"
        />
        <h1 className="text-lg text-white font-extrabold">Application Support</h1>
      </div>
    </header>
  );
}