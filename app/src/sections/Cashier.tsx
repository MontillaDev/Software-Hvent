import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { calculateConsolidatedUSD } from '@/helpers/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { BarChart3, DollarSign, Coins, Calculator, Lock, Unlock, FileText } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sale' | 'expense' | 'adjustment';
  description: string;
  usdAmount: number;
  vesAmount: number;
  timestamp: Date;
  method: string;
}

interface CashRegister {
  openingUSD: number;
  openingVES: number;
  closingUSD: number;
  closingVES: number;
  isOpen: boolean;
  openedAt: Date | null;
  closedAt: Date | null;
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'sale', description: 'Venta #001 - Cliente Juan', usdAmount: 25.50, vesAmount: 0, timestamp: new Date('2024-01-15 09:30'), method: 'Efectivo USD' },
  { id: '2', type: 'sale', description: 'Venta #002 - Cliente María', usdAmount: 0, vesAmount: 920, timestamp: new Date('2024-01-15 10:15'), method: 'Punto de Venta' },
  { id: '3', type: 'sale', description: 'Venta #003 - Cliente Pedro', usdAmount: 15.00, vesAmount: 450, timestamp: new Date('2024-01-15 11:00'), method: 'Mixto' },
  { id: '4', type: 'expense', description: 'Compra de insumos', usdAmount: 30.00, vesAmount: 0, timestamp: new Date('2024-01-15 12:30'), method: 'Efectivo USD' },
  { id: '5', type: 'sale', description: 'Venta #004 - Cliente Ana', usdAmount: 42.80, vesAmount: 0, timestamp: new Date('2024-01-15 14:20'), method: 'Transferencia' },
  { id: '6', type: 'sale', description: 'Venta #005 - Cliente Luis', usdAmount: 0, vesAmount: 1350, timestamp: new Date('2024-01-15 15:45'), method: 'Pago Móvil' },
  { id: '7', type: 'sale', description: 'Venta #006 - Cliente Carmen', usdAmount: 18.50, vesAmount: 0, timestamp: new Date('2024-01-15 16:30'), method: 'Efectivo USD' },
];

export function Cashier() {
  const { bcvRate, formatUSD, formatVES } = useCurrency();
  const [cashRegister, setCashRegister] = useState<CashRegister>({
    openingUSD: 100,
    openingVES: 0,
    closingUSD: 0,
    closingVES: 0,
    isOpen: true,
    openedAt: new Date('2024-01-15 08:00'),
    closedAt: null,
  });
  const [closingAmounts, setClosingAmounts] = useState({ usd: '', ves: '' });
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const handleOpenRegister = () => {
    setCashRegister({
      ...cashRegister,
      isOpen: true,
      openedAt: new Date(),
      closedAt: null,
    });
  };

  const handleCloseRegister = () => {
    const usd = parseFloat(closingAmounts.usd) || 0;
    const ves = parseFloat(closingAmounts.ves) || 0;
    setCashRegister({
      ...cashRegister,
      isOpen: false,
      closingUSD: usd,
      closingVES: ves,
      closedAt: new Date(),
    });
  };

  // Calculate totals
  const totalSalesUSD = transactions
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + t.usdAmount, 0);
  const totalSalesVES = transactions
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + t.vesAmount, 0);
  const totalExpensesUSD = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.usdAmount, 0);
  const totalExpensesVES = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.vesAmount, 0);

  const netSalesUSD = totalSalesUSD - totalExpensesUSD;
  const netSalesVES = totalSalesVES - totalExpensesVES;

  const expectedClosingUSD = cashRegister.openingUSD + netSalesUSD;
  const expectedClosingVES = cashRegister.openingVES + netSalesVES;

  const actualClosingUSD = cashRegister.isOpen ? parseFloat(closingAmounts.usd) || 0 : cashRegister.closingUSD;
  const actualClosingVES = cashRegister.isOpen ? parseFloat(closingAmounts.ves) || 0 : cashRegister.closingVES;

  const differenceUSD = actualClosingUSD - expectedClosingUSD;
  const differenceVES = actualClosingVES - expectedClosingVES;

  // Consolidated totals
  const consolidatedOpening = calculateConsolidatedUSD(cashRegister.openingUSD, cashRegister.openingVES, bcvRate);
  const consolidatedNet = calculateConsolidatedUSD(netSalesUSD, netSalesVES, bcvRate);
  const consolidatedExpected = calculateConsolidatedUSD(expectedClosingUSD, expectedClosingVES, bcvRate);
  const consolidatedActual = calculateConsolidatedUSD(actualClosingUSD, actualClosingVES, bcvRate);
  const consolidatedDifference = consolidatedActual - consolidatedExpected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-amber-600" />
            Corte de Caja
          </h2>
          <p className="text-slate-500">Gestiona el cierre de caja con desglose en ambas monedas</p>
        </div>
        <div className="flex items-center gap-2">
          {cashRegister.isOpen ? (
            <Badge className="bg-green-500 text-white px-4 py-2">
              <Unlock className="h-4 w-4 mr-2" />
              CAJA ABIERTA
            </Badge>
          ) : (
            <Badge variant="secondary" className="px-4 py-2">
              <Lock className="h-4 w-4 mr-2" />
              CAJA CERRADA
            </Badge>
          )}
        </div>
      </div>

      {/* Opening/Closing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-amber-600" />
            {cashRegister.isOpen ? 'Cierre de Caja' : 'Apertura de Caja'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cashRegister.isOpen ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Monto en Efectivo USD</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={closingAmounts.usd}
                    onChange={(e) => setClosingAmounts({ ...closingAmounts, usd: e.target.value })}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Monto en Efectivo VES</Label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={closingAmounts.ves}
                    onChange={(e) => setClosingAmounts({ ...closingAmounts, ves: e.target.value })}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={handleCloseRegister} className="w-full bg-amber-500 text-slate-900 hover:bg-amber-600">
                  <Lock className="h-4 w-4 mr-2" />
                  Cerrar Caja
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Monto Apertura USD</Label>
                <Input
                  type="number"
                  value={cashRegister.openingUSD}
                  onChange={(e) =>
                    setCashRegister({ ...cashRegister, openingUSD: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Monto Apertura VES</Label>
                <Input
                  type="number"
                  value={cashRegister.openingVES}
                  onChange={(e) =>
                    setCashRegister({ ...cashRegister, openingVES: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleOpenRegister} className="w-full bg-green-600 text-white hover:bg-green-700">
                  <Unlock className="h-4 w-4 mr-2" />
                  Abrir Caja
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards - Three Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monto en USD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Apertura:</span>
              <span className="font-mono">{formatUSD(cashRegister.openingUSD)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Ventas:</span>
              <span className="font-mono text-green-600">+{formatUSD(totalSalesUSD)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Gastos:</span>
              <span className="font-mono text-red-600">-{formatUSD(totalExpensesUSD)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Esperado:</span>
              <span className="font-mono">{formatUSD(expectedClosingUSD)}</span>
            </div>
            {!cashRegister.isOpen && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Real:</span>
                  <span className="font-mono">{formatUSD(actualClosingUSD)}</span>
                </div>
                <div className={`flex justify-between font-medium ${differenceUSD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>Diferencia:</span>
                  <span className="font-mono">{differenceUSD >= 0 ? '+' : ''}{formatUSD(differenceUSD)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Monto en VES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Apertura:</span>
              <span className="font-mono">{formatVES(cashRegister.openingVES)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Ventas:</span>
              <span className="font-mono text-green-600">+{formatVES(totalSalesVES)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Gastos:</span>
              <span className="font-mono text-red-600">-{formatVES(totalExpensesVES)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Esperado:</span>
              <span className="font-mono">{formatVES(expectedClosingVES)}</span>
            </div>
            {!cashRegister.isOpen && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Real:</span>
                  <span className="font-mono">{formatVES(actualClosingVES)}</span>
                </div>
                <div className={`flex justify-between font-medium ${differenceVES >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>Diferencia:</span>
                  <span className="font-mono">{differenceVES >= 0 ? '+' : ''}{formatVES(differenceVES)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-400 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Total Consolidado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Apertura:</span>
              <span className="font-mono">{formatUSD(consolidatedOpening)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Ventas Netas:</span>
              <span className="font-mono text-green-400">+{formatUSD(consolidatedNet)}</span>
            </div>
            <Separator className="bg-slate-700" />
            <div className="flex justify-between font-medium text-amber-400">
              <span>Esperado:</span>
              <span className="font-mono">{formatUSD(consolidatedExpected)}</span>
            </div>
            {!cashRegister.isOpen && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Real:</span>
                  <span className="font-mono">{formatUSD(consolidatedActual)}</span>
                </div>
                <div className={`flex justify-between font-medium ${consolidatedDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <span>Diferencia:</span>
                  <span className="font-mono">{consolidatedDifference >= 0 ? '+' : ''}{formatUSD(consolidatedDifference)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            Transacciones del Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">USD</TableHead>
                  <TableHead className="text-right">VES</TableHead>
                  <TableHead className="text-right">Consolidado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => {
                  const consolidated = calculateConsolidatedUSD(t.usdAmount, t.vesAmount, bcvRate);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-sm">
                        {t.timestamp.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={t.type === 'sale' ? 'default' : 'destructive'}
                          className={t.type === 'sale' ? 'bg-green-500' : ''}
                        >
                          {t.type === 'sale' ? 'Venta' : 'Gasto'}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell className="text-sm text-slate-600">{t.method}</TableCell>
                      <TableCell className="text-right font-mono">
                        {t.usdAmount > 0 ? formatUSD(t.usdAmount) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {t.vesAmount > 0 ? formatVES(t.vesAmount) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatUSD(consolidated)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
