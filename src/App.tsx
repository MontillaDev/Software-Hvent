import { useState } from 'react';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { Navbar } from '@/sections/Navbar';
import { Inventory } from '@/sections/Inventory';
import { Invoicing } from '@/sections/Invoicing';
import { Cashier } from '@/sections/Cashier';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

type Section = 'inventory' | 'invoicing' | 'cashier';

function App() {
  const [activeSection, setActiveSection] = useState<Section>('inventory');

  const renderSection = () => {
    switch (activeSection) {
      case 'inventory':
        return <Inventory />;
      case 'invoicing':
        return <Invoicing />;
      case 'cashier':
        return <Cashier />;
      default:
        return <Inventory />;
    }
  };

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar activeSection={activeSection} onSectionChange={(section) => setActiveSection(section as Section)} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {renderSection()}
        </main>
        <Toaster />
      </div>
    </CurrencyProvider>
  );
}

export default App;
