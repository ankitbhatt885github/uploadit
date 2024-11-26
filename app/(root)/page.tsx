 
export default function Home() {
  return (
   <div >
     <div className=" bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
        {/* Welcome Header */}
        <h1 style={{ color: '#9A7E6F' }} className="text-3xl font-bold text-center mb-4">
          Welcome to uploadit!
        </h1>

        {/* Company Description */}
        <p className="text-lg text-gray-700 text-center mb-6">
        <span className=" font-semibold"
         style={{ color: '#9A7E6F' }}>uploadit</span> is a fast, secure app that lets you effortlessly store and manage your documents, images, audio, and videos. Enjoy quick uploads and easy access to your files anytime, anywhere.
        </p>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Feel free to explore us and learn more about what we do.
          </p>
        </div>
      </div>
    </div>
   </div>
  );
}
