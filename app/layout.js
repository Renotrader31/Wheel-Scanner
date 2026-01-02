import './globals.css';

export const metadata = {
  title: 'Wheel Strategy Scanner',
  description: 'Find optimal stocks for the Wheel options strategy',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
