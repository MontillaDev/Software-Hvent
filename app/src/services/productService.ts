// services/productService.ts
import { supabase } from '@/lib/supabase';

interface Producto {
  precio_usd: number;
  costo_usd: number;
  stock_actual: number;
  [key: string]: any;
}

export async function getInventory() {
  // 1. Obtenemos los productos y la tasa actual (asumiendo una tabla 'settings' o 'rates')
    const { data, error: pError } = await supabase
        .from('productos')
        .select('*');
    const products = (data as Producto[]) || [];

    const { data: rateData, error: rError } = await supabase
        .from('configuracion')
        .select('valor_tasa')
        .eq('nombre', 'dolar_bcv')
        .single();

    if (pError || rError) throw new Error("Error cargando datos");

    const tasa = rateData.valor_tasa;

  // 2. Retornamos los productos con la conversión calculada
    return products!.map((p: Producto) => ({
        ...p,
        precio_bs: p.precio_usd * tasa,
        tasa_aplicada: tasa
    }));
}