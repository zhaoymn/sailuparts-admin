import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const HomePage = () => {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
            SailUp Arts Admin System
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Welcome to the administrative portal. For authorized use only.
          </p>
          <div className="space-y-4">
            <SignedOut>
              <SignInButton>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
                  Login
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
                  Register
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
                  Go To Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
        <footer className="mt-8 text-white text-sm">
          &copy; 2024 SailUp Arts LLC. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
