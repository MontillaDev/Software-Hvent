import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TrendingUp, Package, Receipt, BarChart3, Settings } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Navbar({ activeSection, onSectionChange }: NavbarProps) {
  const { bcvRate, setBcvRate, formatVES } = useCurrency();
  const [tempRate, setTempRate] = useState(bcvRate.toString());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveRate = () => {
    const newRate = parseFloat(tempRate);
    if (!isNaN(newRate) && newRate > 0) {
      setBcvRate(newRate);
      setIsDialogOpen(false);
    }
  };

  const navItems = [
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'invoicing', label: 'Facturación', icon: Receipt },
    { id: 'cashier', label: 'Corte de Caja', icon: BarChart3 },
  ];

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Bodegón Pro</h1>
            <p className="text-xs text-slate-400">Sistema de Gestión</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'ghost'}
                className={`gap-2 ${
                  activeSection === item.id
                    ? 'bg-amber-500 text-slate-900 hover:bg-amber-600'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* BCV Rate Widget */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-slate-600 bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Tasa BCV:</span>
              <span className="font-mono font-bold">{bcvRate.toFixed(2)}</span>
              <span className="text-xs text-slate-400">VES/USD</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-500" />
                Configurar Tasa BCV
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Actualiza la tasa de cambio oficial. Esto afectará todos los precios del sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bcv-rate" className="text-slate-300">
                  Tasa BCV (VES por USD)
                </Label>
                <Input
                  id="bcv-rate"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white text-lg font-mono"
                  placeholder="45.00"
                />
              </div>
              <div className="bg-slate-800 p-3 rounded-lg">
                <p className="text-sm text-slate-400">Ejemplo de conversión:</p>
                <p className="text-amber-400 font-mono mt-1">
                  $1.00 USD = {formatVES(parseFloat(tempRate) || 0)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveRate}
                className="flex-1 bg-amber-500 text-slate-900 hover:bg-amber-600"
              >
                Guardar Tasa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  );
}
