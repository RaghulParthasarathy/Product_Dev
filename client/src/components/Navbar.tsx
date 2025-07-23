// // import { useState } from "react";
// // import Signin from "./Signin";

// // export default function Navbar() {
// //   const [showPopup, setShowPopup] = useState(false);

// //   return (
// //     <div className="bg-[#47128c] p-4 flex justify-between items-center w-full fixed top-0">
// //       <h1 className="text-white text-xl">MyApp</h1>
// //       <button
// //         onClick={() => setShowPopup(true)}
// //         className="bg-white text-[#47128c] px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
// //       >
// //         Sign In
// //       </button>
// //       {showPopup && <Signin onClose={() => setShowPopup(false)} />}
// //     </div>
// //   );
// // }

// import { Link } from "react-router-dom";

// export default function Navbar() {
//   return (
//     <div className="bg-[#47128c] p-4 flex justify-between items-center w-full fixed top-0">
//       <h1 className="text-white text-xl">MyApp</h1>
//       <Link
//         to="/Login"
//         className="bg-white text-[#47128c] px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
//       >
//         Sign In
//       </Link>
//     </div>
//   );
// }


// import { useState } from "react";
// import Signin from "./Signin";

// export default function Navbar() {
//   const [showPopup, setShowPopup] = useState(false);

//   return (
//     <div className="bg-[#47128c] p-4 flex justify-between items-center w-full fixed top-0">
//       <h1 className="text-white text-xl">MyApp</h1>
//       <button
//         onClick={() => setShowPopup(true)}
//         className="bg-white text-[#47128c] px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
//       >
//         Sign In
//       </button>
//       {showPopup && <Signin onClose={() => setShowPopup(false)} />}
//     </div>
//   );
// }
import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import  HoverBorderGradient  from "./ui/hover-border-gradient";
export default function Navbar() {
  const [login,Setlogin]=useState(true)
  return (
   
      <Link
        to={"/login"}
      >
     
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
          >
            <span>
              Get Started              
            </span>
          </HoverBorderGradient>
    
      </Link>
  );
}
