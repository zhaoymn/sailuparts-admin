import { FC } from "react";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import StatisticsBlock from "@/components/statistics";

import { getArtistNumber } from "@/lib/actions/artist.action";
import { getPaintingNumber } from "@/lib/actions/painting.action";
import NavigationBlock from "@/components/navigation";
import { getHeroItemNumber } from "@/lib/actions/heroitem.action";

const Dashboard: FC = async () => {
  const artistNumber = await getArtistNumber();
  const heroItemNumber = await getHeroItemNumber();
  const paintingNumber = await getPaintingNumber();

  const stats = {
    artistNumber: artistNumber ? artistNumber : 0,
    heroItemNumber: heroItemNumber ? heroItemNumber : 0,
    paintingNumber: paintingNumber ? paintingNumber : 0,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              SailUp Arts Dashboard
            </h1>
            <div className="flex items-center">
              <SignOutButton>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Dashboard Content
            </h2>
            <StatisticsBlock
              totalHeroItems={stats.heroItemNumber}
              totalArtists={stats.artistNumber}
              totalPaintings={stats.paintingNumber}
            />
            <NavigationBlock />
            <Link href="/">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
