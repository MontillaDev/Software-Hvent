// app/actions/sales.ts
'use server'
import { supabase } from '../lib/supabase';

export async function registrarVenta(productoId: string, cantidad: number) {
  // 1. Obtener datos del producto para calcular utilidad
    const { data: producto } = await supabase
        .from('productos')
        .select('precio_usd, costo_usd, stock_actual')
        .eq('id', productoId)
        .single();

    if (!producto || producto.stock_actual < cantidad) {
        return { error: "Stock insuficiente o producto no encontrado" };
    }

    const utilidadTotal = (producto.precio_usd - producto.costo_usd) * cantidad;

  // 2. Iniciar la transacción (Registrar venta y descontar stock)
  // Nota: En Supabase/Postgres esto se hace mejor con una RPC o una serie de inserts
    const { error: saleError } = await supabase
        .from('ventas')
        .insert([{ 
        producto_id: productoId, 
        cantidad: cantidad, 
        margen_utilidad: utilidadTotal,
        fecha: new Date().toISOString()
        }]);

    if (saleError) return { error: "Error al registrar la venta" };

  // 3. Actualizar el stock
    const { error: stockError } = await supabase
        .from('productos')
        .update({ stock_actual: producto.stock_actual - cantidad })
        .eq('id', productoId);

    if (stockError) return { error: "Error al actualizar inventario" };

    return { success: true };
}