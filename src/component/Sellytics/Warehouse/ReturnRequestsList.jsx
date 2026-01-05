import React from 'react';

import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  User
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG = {
  REQUESTED: { 
    icon: Clock, 
    label: 'Pending', 
    color: 'bg-amber-100 text-amber-700 border-amber-200' 
  },
  RECEIVED: { 
    icon: CheckCircle2, 
    label: 'Received', 
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' 
  },
  REJECTED: { 
    icon: XCircle, 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-700 border-red-200' 
  }
};

export default function ReturnRequestsList({
  requests = [],
  products = [],
  clients = [],
  onApprove,
  onReject,
  isProcessing = false
}) {
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.product_name || 'Unknown Product';
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.external_name || `Store #${client?.store_id}` || 'Unknown Client';
  };

  const pendingRequests = requests.filter(r => r.status === 'REQUESTED');
  const processedRequests = requests.filter(r => r.status !== 'REQUESTED');

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Requests
            </span>
            <Badge variant="secondary">{pendingRequests.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] overflow-y-auto">
            <AnimatePresence>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <RotateCcw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No pending return requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => {
                    const statusConfig = STATUS_CONFIG[request.status];
                    const StatusIcon = statusConfig?.icon || Clock;
                    
                    return (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Package className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <p className="font-medium">{getProductName(request.warehouse_product_id)}</p>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <User className="w-3 h-3" />
                                  {getClientName(request.client_id)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-3">
                              <Badge variant="outline">
                                Qty: {request.quantity}
                              </Badge>
                              <Badge className={statusConfig?.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig?.label}
                              </Badge>
                            </div>
                            
                            {request.reason && (
                              <p className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded">
                                {request.reason}
                              </p>
                            )}
                            
                            <p className="text-xs text-slate-400 mt-2">
                              Requested {format(new Date(request.created_date || request.created_at), 'MMM d, yyyy HH:mm')}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => onApprove(request)}
                              disabled={isProcessing}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Receive
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onReject(request)}
                              disabled={isProcessing}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
                Processed Requests
              </span>
              <Badge variant="secondary">{processedRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] overflow-y-auto">
              <div className="space-y-2">
                {processedRequests.map((request) => {
                  const statusConfig = STATUS_CONFIG[request.status];
                  const StatusIcon = statusConfig?.icon || Clock;
                  
                  return (
                    <div
                      key={request.id}
                      className="p-3 bg-slate-50 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-medium text-sm">{getProductName(request.warehouse_product_id)}</p>
                          <p className="text-xs text-slate-500">
                            {getClientName(request.client_id)} • Qty: {request.quantity}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusConfig?.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig?.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}