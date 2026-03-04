import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { calculateConsolidatedUSD } from '@/helpers/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Receipt, Plus, Trash2, CreditCard, Banknote, Wallet, CheckCircle } from 'lucide-react';

interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPriceUSD: number;
  totalUSD: number;
}

interface Payment {
  id: string;
  method: 'cash_usd' | 'cash_ves' | 'pos' | 'transfer' | 'mobile_payment';
  amountUSD: number;
  amountVES: number;
}

const paymentMethods = [
  { value: 'cash_usd', label: 'Efectivo USD', icon: DollarSign },
  { value: 'cash_ves', label: 'Efectivo VES', icon: Banknote },
  { value: 'pos', label: 'Punto de Venta', icon: CreditCard },
  { value: 'transfer', label: 'Transferencia', icon: Wallet },
  { value: 'mobile_payment', label: 'Pago Móvil', icon: CreditCard },
] as const;

function DollarSign(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function Invoicing() {
  const { bcvRate, formatUSD, formatVES, convertToVES } = useCurrency();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newItem, setNewItem] = useState({ productName: '', quantity: 1, unitPriceUSD: 0 });
  const [newPayment, setNewPayment] = useState({ method: '', amountUSD: 0, amountVES: 0 });

  const subtotalUSD = items.reduce((sum, item) => sum + item.totalUSD, 0);
  const taxUSD = subtotalUSD * 0.16; // 16% IVA
  const totalUSD = subtotalUSD + taxUSD;
  const totalVES = convertToVES(totalUSD);

  const totalPaidUSD = payments.reduce((sum, p) => sum + p.amountUSD, 0);
  const totalPaidVES = payments.reduce((sum, p) => sum + p.amountVES, 0);
  const consolidatedPaidUSD = calculateConsolidatedUSD(totalPaidUSD, totalPaidVES, bcvRate);
  const remainingUSD = Math.max(0, totalUSD - consolidatedPaidUSD);
  const changeUSD = Math.max(0, consolidatedPaidUSD - totalUSD);

  const addItem = () => {
    if (newItem.productName && newItem.quantity > 0 && newItem.unitPriceUSD > 0) {
      const item: InvoiceItem = {
        id: Date.now().toString(),
        productName: newItem.productName,
        quantity: newItem.quantity,
        unitPriceUSD: newItem.unitPriceUSD,
        totalUSD: newItem.quantity * newItem.unitPriceUSD,
      };
      setItems([...items, item]);
      setNewItem({ productName: '', quantity: 1, unitPriceUSD: 0 });
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const addPayment = () => {
    if (newPayment.method && (newPayment.amountUSD > 0 || newPayment.amountVES > 0)) {
      const payment: Payment = {
        id: Date.now().toString(),
        method: newPayment.method as Payment['method'],
        amountUSD: newPayment.amountUSD,
        amountVES: newPayment.amountVES,
      };
      setPayments([...payments, payment]);
      setNewPayment({ method: '', amountUSD: 0, amountVES: 0 });
    }
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  const getPaymentMethodLabel = (method: string) => {
    return paymentMethods.find((m) => m.value === method)?.label || method;
  };

  const isFullyPaid = remainingUSD <= 0.01;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="h-6 w-6 text-amber-600" />
          Facturación
        </h2>
        <p className="text-slate-500">Crea facturas con pagos mixtos en USD y VES</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5 text-amber-600" />
              Agregar Productos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label>Producto</Label>
                <Input
                  value={newItem.productName}
                  onChange={(e) => setNewItem({ ...newItem, productName: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>
              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div>
              <Label>Precio Unitario (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={newItem.unitPriceUSD}
                onChange={(e) => setNewItem({ ...newItem, unitPriceUSD: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <Button onClick={addItem} className="w-full bg-amber-500 text-slate-900 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Agregar a la Factura
            </Button>

            <Separator />

            {/* Items Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">P.Unit</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                        No hay productos agregados
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono">{formatUSD(item.unitPriceUSD)}</TableCell>
                      <TableCell className="text-right font-mono font-medium">{formatUSD(item.totalUSD)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
              Método de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Método</Label>
              <Select
                value={newPayment.method}
                onValueChange={(value) => setNewPayment({ ...newPayment, method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Monto (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newPayment.amountUSD}
                  onChange={(e) => setNewPayment({ ...newPayment, amountUSD: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Monto (VES)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newPayment.amountVES}
                  onChange={(e) => setNewPayment({ ...newPayment, amountVES: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <Button onClick={addPayment} className="w-full bg-amber-500 text-slate-900 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>

            <Separator />

            {/* Payments List */}
            <div className="space-y-2">
              {payments.length === 0 && (
                <p className="text-center text-slate-400 py-4">No hay pagos registrados</p>
              )}
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{getPaymentMethodLabel(payment.method)}</p>
                    <div className="flex gap-3 text-sm">
                      {payment.amountUSD > 0 && (
                        <span className="font-mono text-slate-600">{formatUSD(payment.amountUSD)}</span>
                      )}
                      {payment.amountVES > 0 && (
                        <span className="font-mono text-slate-600">{formatVES(payment.amountVES)}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removePayment(payment.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Totals Card */}
      <Card className="bg-slate-900 text-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Invoice Totals */}
            <div className="space-y-3">
              <h3 className="text-amber-400 font-medium flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Totales de la Factura
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-mono">{formatUSD(subtotalUSD)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">IVA (16%):</span>
                  <span className="font-mono">{formatUSD(taxUSD)}</span>
                </div>
                <Separator className="bg-slate-700 my-2" />
                <div className="flex justify-between">
                  <span className="text-amber-400 font-medium">TOTAL USD:</span>
                  <span className="font-mono font-bold text-amber-400">{formatUSD(totalUSD)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Equivalente VES:</span>
                  <span className="font-mono">{formatVES(totalVES)}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="space-y-3">
              <h3 className="text-amber-400 font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Estado de Pago
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pagado USD:</span>
                  <span className="font-mono">{formatUSD(totalPaidUSD)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pagado VES:</span>
                  <span className="font-mono">{formatVES(totalPaidVES)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Consolidado:</span>
                  <span className="font-mono">{formatUSD(consolidatedPaidUSD)}</span>
                </div>
                <Separator className="bg-slate-700 my-2" />
                <div className="flex justify-between">
                  <span className={remainingUSD > 0 ? 'text-red-400' : 'text-green-400'}>
                    {remainingUSD > 0 ? 'PENDIENTE:' : 'CAMBIO:'}
                  </span>
                  <span className={`font-mono font-bold ${remainingUSD > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {formatUSD(remainingUSD > 0 ? remainingUSD : changeUSD)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex flex-col justify-center items-center gap-4">
              <div className="text-center">
                {isFullyPaid ? (
                  <Badge className="bg-green-500 text-white px-4 py-2 text-lg">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    PAGO COMPLETO
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="px-4 py-2 text-lg">
                    PAGO INCOMPLETO
                  </Badge>
                )}
              </div>
              <Button
                disabled={!isFullyPaid || items.length === 0}
                className="w-full bg-amber-500 text-slate-900 hover:bg-amber-600 disabled:opacity-50"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Generar Factura
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
