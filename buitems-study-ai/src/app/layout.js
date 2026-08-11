//2nd edit

import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata = {
  title: 'BUITEMS Study AI',
  description: 'Academic Workspace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('buitems_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-[#030305] text-gray-900 dark:text-slate-100 font-sans antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}




// import './globals.css';

// export const metadata = {
//   title: 'BUITEMS Study AI',
//   description: 'Academic Workspace',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <head>
//         <script
//           dangerouslySetInnerHTML={{
//             __html: `
//               try {
//                 const theme = localStorage.getItem('buitems_theme');
//                 if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
//                   document.documentElement.classList.add('dark');
//                 } else {
//                   document.documentElement.classList.remove('dark');
//                 }
//               } catch (e) {}
//             `,
//           }}
//         />
//       </head>
//       <body className="bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans antialiased">
//         {children}
//       </body>
//     </html>
//   );
// }