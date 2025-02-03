import React from "react";
import  BackgroundLines  from "./ui/background-lines.tsx";
import Navbar from "./Navbar.tsx";
import { ThreeDCardDemo } from "./ThreeDCardDemo.tsx";
export default function BackgroundLinesDemo() {
  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 pt-40">
    
      <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10  font-bold tracking-tight">
      Speak Your Idea. <br /> Watch It Turn Into a Website..
      </h2>
      <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
      <Navbar/>
      </p>
      <div className="flex w-full pt-30 justify-around">
      {/* <ThreeDCardDemo head={" Download Your Code Instantly "} subhead={"Export and Use Your Code Anywhere"} /> */}
      <ThreeDCardDemo head={" Generate amazing websites "} subhead={"Build fabulous websites without writing huge codes with just a few clicks"} />
      <ThreeDCardDemo head={" Customize Your Generated Website with Live Editing "} subhead={"No-Code Editing for a Seamless Experience"} />
      <ThreeDCardDemo head={" Download Your Project with a Single Tap "} subhead={" Download the generated code for free  "} />
      </div>
      
    </BackgroundLines>
  );
}
