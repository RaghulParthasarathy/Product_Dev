import React from 'react';
import Navbar from "../components/Navbar"
import  BackgroundLinesDemo  from '../components/BackgroundLinesDemo';
import HoverBorderGradientDemo from '../components/HoverBorderGradientDemo';
import { ThreeDCardDemo } from '../components/ThreeDCardDemo';

export function Landing() {
  return (
    <div className='relative'>
      {/* <Navbar/> */}
      <BackgroundLinesDemo/>
      
      {/* <HoverBorderGradientDemo/> */}
    </div>
  
  );
}
