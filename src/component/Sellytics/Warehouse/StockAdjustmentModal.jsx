import React, { useState } from 'react';

import { 
  Loader2, 
  RefreshCw, 
  AlertCircle,
  Package,
  Plus,
  Minus
} from "lucide-react";

const ADJUSTMENT_REASONS = [
  { value: 'DAMAGE', label: 'Damaged Stock', color: 'text-red-600' },
  { value: 'LOSS', label: 'Lost/Missing', color: 'text-red-600' },
  { value: 'FOUND', label: 'Found Stock', color: 'text-emerald-600' },
  { value: 'COUNT_CORRECTION', label: 'Count Correction', color: 'text-blue-600' },
  { value: 'EXPIRED', label: 'Expired', color: 'text-amber-600' },
  { value: 'OTHER', label: 'Other', color: 'text-slate-600' }
];

export default function StockAdjustmentModal({
  open,
  onClose,
  onSubmit,
  inventory,
  product,
  isLoading = false
}) {
  const [formData, setFormData] = useState({
    adjustment_type: 'decrease', // 'increase' or 'decrease'
    quantity: 1,
    reason: '',
    condition: 'GOOD',
    notes: ''
  });

  const currentQty = inventory?.quantity || 0;
  const newQty = formData.adjustment_type === 'increase' 
    ? currentQty + parseInt(formData.quantity || 0)
    : currentQty - parseInt(formData.quantity || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.reason || !formData.notes) {
      return;
    }

    onSubmit({
      warehouse_product_id: product?.id,
      movement_type: 'ADJUST',
      movement_subtype: formData.reason,
      direction: formData.adjustment_type === 'increase' ? 'IN' : 'OUT',
      quantity: parseInt(formData.quantity),
      item_condition: formData.condition,
      notes: formData.notes
    });
  };

  const resetForm = () => {
    setFormData({
      adjustment_type: 'decrease',
      quantity: 1,
      reason: '',
      condition: 'GOOD',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Stock Adjustment</DialogTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                Manually adjust inventory count
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Product Info */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-medium">{product?.product_name}</p>
                <p className="text-sm text-slate-500">
                  Current stock: <strong>{currentQty}</strong> units
                </p>
              </div>
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>Adjustment Type *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, adjustment_type: 'increase' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.adjustment_type === 'increase'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Plus className={`h-6 w-6 mx-auto mb-1 ${
                  formData.adjustment_type === 'increase' ? 'text-emerald-600' : 'text-slate-400'
                }`} />
                <span className={`text-sm font-medium ${
                  formData.adjustment_type === 'increase' ? 'text-emerald-700' : 'text-slate-600'
                }`}>
                  Increase
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, adjustment_type: 'decrease' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.adjustment_type === 'decrease'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Minus className={`h-6 w-6 mx-auto mb-1 ${
                  formData.adjustment_type === 'decrease' ? 'text-red-600' : 'text-slate-400'
                }`} />
                <span className={`text-sm font-medium ${
                  formData.adjustment_type === 'decrease' ? 'text-red-700' : 'text-slate-600'
                }`}>
                  Decrease
                </span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input
              type="number"
              min="1"
              max={formData.adjustment_type === 'decrease' ? currentQty : 999999}
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">New quantity will be:</span>
              <Badge className={newQty < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}>
                {newQty} units
              </Badge>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Select 
              value={formData.reason} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, reason: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason..." />
              </SelectTrigger>
              <SelectContent>
                {ADJUSTMENT_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    <span className={reason.color}>{reason.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition (for decreases) */}
          {formData.adjustment_type === 'decrease' && (
            <div className="space-y-2">
              <Label>Item Condition</Label>
              <Select 
                value={formData.condition} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, condition: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="DAMAGED">Damaged</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes / Justification *</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Explain why this adjustment is being made..."
              rows={3}
              required
            />
            <p className="text-xs text-slate-500">
              Required for audit trail
            </p>
          </div>

          {/* Warning */}
          {newQty < 0 && (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700">
                  Cannot decrease below zero. Maximum decrease: {currentQty}
                </span>
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !formData.reason || !formData.notes || newQty < 0}
            className={formData.adjustment_type === 'increase' 
              ? 'bg-gradient-to-r from-emerald-600 to-green-600'
              : 'bg-gradient-to-r from-red-600 to-orange-600'
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {formData.adjustment_type === 'increase' ? 'Add' : 'Remove'} {formData.quantity} Units
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}