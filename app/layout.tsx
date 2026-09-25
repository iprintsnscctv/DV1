import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diversion Vigan | Transient and Private Villa',
  description:
    'Diversion Vigan - Transient and Private Villa booking portal and front-desk management in Vigan City, Ilocos Sur.',
  openGraph: {
    title: 'Diversion Vigan | Transient and Private Villa',
    description:
      'Diversion Vigan - Transient and Private Villa booking portal and front-desk management in Vigan City, Ilocos Sur.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
