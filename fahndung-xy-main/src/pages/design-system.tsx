import { NextPage } from "next";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { DesignSystemManager } from "~/components/ui/design-system-manager";
import { ThemeProvider } from "~/components/ui/theme-provider";

const DesignSystemPage: NextPage = () => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8">
          <DesignSystemManager />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default DesignSystemPage; 