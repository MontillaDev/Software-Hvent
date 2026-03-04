import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { calculateProfitMargin } from '@/helpers/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Package, TrendingUp, DollarSign } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  costUSD: number;
  priceUSD: number;
  category: string;
}

const initialProducts: Product[] = [
  { id: '1', name: 'Arroz Premium 1kg', sku: 'ARR-001', quantity: 50, costUSD: 1.20, priceUSD: 1.80, category: 'Granos' },
  { id: '2', name: 'Aceite Vegetal 1L', sku: 'ACE-002', quantity: 30, costUSD: 2.50, priceUSD: 3.50, category: 'Aceites' },
  { id: '3', name: 'Azúcar Refinada 1kg', sku: 'AZU-003', quantity: 40, costUSD: 0.90, priceUSD: 1.40, category: 'Endulzantes' },
  { id: '4', name: 'Harina de Trigo 1kg', sku: 'HAR-004', quantity: 60, costUSD: 1.00, priceUSD: 1.50, category: 'Harinas' },
  { id: '5', name: 'Leche Entera 1L', sku: 'LEC-005', quantity: 25, costUSD: 1.80, priceUSD: 2.60, category: 'Lácteos' },
  { id: '6', name: 'Pasta de Tomate 200g', sku: 'PAS-006', quantity: 45, costUSD: 0.80, priceUSD: 1.20, category: 'Salsas' },
];

export function Inventory() {
  const { formatUSD, formatVES, convertToVES } = useCurrency();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    quantity: 0,
    costUSD: 0,
    priceUSD: 0,
    category: '',
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.sku) {
      const product: Product = {
        id: Date.now().toString(),
        name: newProduct.name || '',
        sku: newProduct.sku || '',
        quantity: newProduct.quantity || 0,
        costUSD: newProduct.costUSD || 0,
        priceUSD: newProduct.priceUSD || 0,
        category: newProduct.category || '',
      };
      setProducts([...products, product]);
      setNewProduct({ name: '', sku: '', quantity: 0, costUSD: 0, priceUSD: 0, category: '' });
      setIsAddDialogOpen(false);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 10) return { label: 'Bajo', className: 'bg-red-500 text-white' };
    if (quantity <= 25) return { label: 'Medio', className: 'bg-amber-500 text-white' };
    return { label: 'OK', className: 'bg-green-500 text-white' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-amber-600" />
            Inventario
          </h2>
          <p className="text-slate-500">Gestiona tus productos con precios en ambas monedas</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 text-slate-900 hover:bg-amber-600 gap-2">
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-600" />
                Nuevo Producto
              </DialogTitle>
              <DialogDescription>
                Ingresa los datos del producto. Los precios se mostrarán en USD y VES.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Ej: Arroz Premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="Ej: PROD-001"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    placeholder="Ej: Granos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costUSD" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Costo (USD)
                  </Label>
                  <Input
                    id="costUSD"
                    type="number"
                    step="0.01"
                    value={newProduct.costUSD}
                    onChange={(e) => setNewProduct({ ...newProduct, costUSD: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceUSD" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Precio Venta (USD)
                  </Label>
                  <Input
                    id="priceUSD"
                    type="number"
                    step="0.01"
                    value={newProduct.priceUSD}
                    onChange={(e) => setNewProduct({ ...newProduct, priceUSD: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAddProduct} className="flex-1 bg-amber-500 text-slate-900 hover:bg-amber-600">
                Guardar Producto
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por nombre, SKU o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Lista de Productos</span>
            <Badge variant="secondary">{filteredProducts.length} productos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead>Costo (USD)</TableHead>
                  <TableHead>Precio Venta</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const margin = calculateProfitMargin(product.costUSD, product.priceUSD);
                  const stockStatus = getStockStatus(product.quantity);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs">{product.sku}</code>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-mono font-medium">{product.quantity}</span>
                          <Badge className={`text-xs ${stockStatus.className}`}>
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-slate-600">{formatUSD(product.costUSD)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-medium text-amber-700">{formatUSD(product.priceUSD)}</span>
                          <span className="font-mono text-xs text-slate-500">
                            {formatVES(convertToVES(product.priceUSD))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className={`h-4 w-4 ${margin >= 30 ? 'text-green-600' : margin >= 15 ? 'text-amber-600' : 'text-red-600'}`} />
                          <span className={`font-mono font-medium ${margin >= 30 ? 'text-green-600' : margin >= 15 ? 'text-amber-600' : 'text-red-600'}`}>
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Valor del Inventario (USD)</p>
                <p className="text-2xl font-bold font-mono text-slate-900">
                  {formatUSD(products.reduce((sum, p) => sum + p.costUSD * p.quantity, 0))}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Valor del Inventario (VES)</p>
                <p className="text-2xl font-bold font-mono text-slate-900">
                  {formatVES(
                    products.reduce((sum, p) => sum + convertToVES(p.costUSD * p.quantity), 0)
                  )}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="text-2xl font-bold text-blue-600">Bs.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Margen Promedio</p>
                <p className="text-2xl font-bold font-mono text-slate-900">
                  {(
                    products.reduce((sum, p) => sum + calculateProfitMargin(p.costUSD, p.priceUSD), 0) /
                    products.length
                  ).toFixed(1)}%
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
