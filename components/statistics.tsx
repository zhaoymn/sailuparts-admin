import React from "react";

interface StatisticsBlockProps {
  totalHeroItems: number;
  totalArtists: number;
  totalPaintings: number;
}

const StatisticsBlock: React.FC<StatisticsBlockProps> = ({
  totalHeroItems,
  totalArtists,
  totalPaintings,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 w-full">
      <h2 className="text-center text-xl font-semibold text-gray-800 mb-4">
        Statistics
      </h2>
      <div className="flex justify-between">
        <StatItem title="Total HeroItems" value={totalHeroItems} />
        <StatItem title="Total Artists" value={totalArtists} />
        <StatItem title="Total Paintings" value={totalPaintings} />
      </div>
    </div>
  );
};

const StatItem: React.FC<{ title: string; value: number }> = ({
  title,
  value,
}) => {
  return (
    <div className="text-center flex flex-col items-center w-full">
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold text-blue-600">
        {value.toLocaleString()}
      </p>
    </div>
  );
};

export default StatisticsBlock;
