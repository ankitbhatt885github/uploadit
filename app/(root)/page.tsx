 
 

import { Chart } from "@/components/Chart";
 
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import {   getUsageSummary } from "@/lib/utils";

const Dashboard = async () => {
  // Parallel requests
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
  ]);

  // Get usage summary
  const usageSummary = getUsageSummary(totalSpace);

  return (
    <div className="container">
      <section>


      <div className=" bg-gray-100 flex items-center justify-center p-6">
          <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
            {/* Welcome Header */}
            <h1 style={{ color: '#9A7E6F' }} className="text-3xl font-bold text-center mb-2">
              Welcome to uploadit!
            </h1>

            {/* Company Description */}
            <p className="text-lg text-gray-700 text-center mb-2">
              <span className=" font-semibold"
                style={{ color: '#9A7E6F' }}>uploadit</span> is a fast, secure app that lets you effortlessly store and manage your documents, images, audio, and videos. Enjoy quick uploads and easy access to your files anytime, anywhere.
            </p>

            
          </div>
        </div>


        
        <Chart used={totalSpace.used} />

        
       
        

      </section>

     
    </div>
  );
};

export default Dashboard;