import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import Nav          from './Nav';
import Footer       from './Footer';
import Cursor       from './Cursor';
import SmoothScroll from './SmoothScroll';
import { AppProvider } from './AppContext';
import Atmosphere   from './Atmosphere';
import CartSidebar  from './CartSidebar';

const inter = Inter({ subsets: ['latin'], weight: ['300','400','500'], variable: '--font-inter' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300','400','600'],
  style:  ['normal','italic'],
  variable: '--font-cormorant',
});

export const metadata = {
  title:       { default: 'NOIR BREW | Taste the Dark', template: '%s | Noir Brew' },
  description: 'Premium dark roast crafted with obsession. 11 varieties, 5 origins, 100 years of craft.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <AppProvider>
          <SmoothScroll />
          <Cursor />
          <Atmosphere />
          <div id="grain" aria-hidden="true" />
          <Nav />
          <CartSidebar />
          <main>{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
