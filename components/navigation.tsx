import React from "react";
import Link from "next/link";

interface NavButtonProps {
  href: string;
  label: string;
  color: string;
}

const NavButton: React.FC<NavButtonProps> = ({ href, label, color }) => (
  <Link href={href}>
    <button
      className={`w-full ${color} hover:opacity-90 text-white font-bold py-3 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105`}
    >
      {label}
    </button>
  </Link>
);

const NavigationBlock: React.FC = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Quick Navigation
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <NavButton
          href="/heroitems"
          label="Manage HeroItems"
          color="bg-blue-500"
        />
        <NavButton
          href="/artists"
          label="Manage Artists"
          color="bg-green-500"
        />
        <NavButton
          href="/paintings"
          label="Manage Paintings"
          color="bg-purple-500"
        />
      </div>
    </div>
  );
};

export default NavigationBlock;
