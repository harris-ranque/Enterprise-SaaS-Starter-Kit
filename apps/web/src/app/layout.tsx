import { QueryProvider } from '@/providers/query-provider';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        
        <html lang="en">
            <body className="min-h-full flex flex-col">
                <QueryProvider>
                    {children}
                </QueryProvider>
            </body>
        </html>
    );
}
