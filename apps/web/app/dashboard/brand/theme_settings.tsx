// import { useTheme } from "@/app/contexts/theme_provider";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useState } from "react";

// export const ThemeConfigurator = () => {
//   //   const { theme, updateTheme } = useTheme();
// //  const [colors, setColors] = useState(theme.colors);

//   const handleColorChange = (key: string, value: string) => {
//     const updatedColors = { ...colors, [key]: value };
//     setColors(updatedColors);
//   };

//   const handleSave = async () => {
//  //   updateTheme({ colors });
//   };

//   return (
//     <div className="space-y-6 p-6">
//       <h2 className="text-2xl font-bold">Theme Settings</h2>

//       <div className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           {Object.entries(colors).map(([key, value]) => (
//             <div key={key}>
//               <Label>{key}</Label>
//               <div className="flex gap-2">
//                 <Input
//                   type="color"
//                   value={value}
//                   onChange={(e) => handleColorChange(key, e.target.value)}
//                   className="w-12"
//                 />
//                 <Input
//                   type="text"
//                   value={value}
//                   onChange={(e) => handleColorChange(key, e.target.value)}
//                   className="flex-1"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>

//         <Button onClick={handleSave}>Save Theme</Button>
//       </div>
//     </div>
//   );
// };
