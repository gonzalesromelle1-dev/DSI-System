import React from 'react';
import { ShoppingCart, AlertTriangle, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import { InventoryItem } from '../types';
import { getReorderStatus, formatCurrency } from '../utils/inventoryHelpers';

interface PurchasesViewProps {
  items: InventoryItem[];
  onNavigateToInventory: () => void;
  onRestockItem: (item: InventoryItem) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  items,
  onNavigateToInventory,
  onRestockItem,
}) => {
  // Extract all items currently needing replenishment
  const itemsNeedingReorder = items.filter((item) => {
    const status = getReorderStatus(item.stockQty, item.minReorderLevel);
    return status === 'reorder_needed' || status === 'out_of_stock';
  });

  return (
    <div id="purchases-view-root" className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Purchases & Replenishment Requisitions
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Automated replenishment queue for inventory items falling below minimum safe stock levels.
          </p>
        </div>

        <button
          onClick={onNavigateToInventory}
          className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
        >
          ← Back to Inventory Table
        </button>
      </div>

      {/* Reorder Queue Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Items Flagged For Reorder ({itemsNeedingReorder.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Triggered automatically when Stock Qty ≤ Minimum Reorder Threshold
          </span>
        </div>

        {itemsNeedingReorder.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="font-semibold text-slate-800">All inventory stock levels are healthy.</p>
            <p className="text-xs text-slate-400 mt-1">No items currently require replenishment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {itemsNeedingReorder.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {item.assetId}
                    </span>
                    <span className="font-semibold text-slate-900">{item.description}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>
                      Current Stock:{' '}
                      <strong className="text-red-600 font-bold">
                        {item.stockQty} {item.unit}
                      </strong>
                    </span>
                    <span>
                      • Min Threshold:{' '}
                      <strong className="text-slate-800">
                        {item.minReorderLevel} {item.unit}
                      </strong>
                    </span>
                    <span>
                      • Category: <span className="font-semibold text-slate-700">{item.category}</span>
                    </span>
                    {item.location && (
                      <span>
                        • Storage: <span className="font-semibold text-slate-700">{item.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRestockItem(item)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs flex items-center space-x-1.5 transition-colors"
                  >
                    <span>Receive / Add Stock</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
