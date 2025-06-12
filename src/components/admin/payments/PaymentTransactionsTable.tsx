
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, RefreshCw, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface PaymentTransaction {
  id: string;
  monto: number;
  moneda: string;
  estado: string;
  metodo_pago: string;
  created_at: string;
  user_data: {
    nombre: string;
    email: string;
  } | null;
  plan_data: {
    nombre: string;
  } | null;
}

export const PaymentTransactionsTable = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch payments with user and plan data
      const { data: payments, error: paymentsError } = await supabase
        .from('pagos')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch users data separately
      const { data: users, error: usersError } = await supabase
        .from('usuarios')
        .select('user_id, nombre, email');

      if (usersError) throw usersError;

      // Fetch plans data separately
      const { data: plans, error: plansError } = await supabase
        .from('planes')
        .select('id, nombre');

      if (plansError) throw plansError;

      // Transform and combine the data
      const transformedData: PaymentTransaction[] = (payments || []).map(payment => {
        const user = users?.find(u => u.user_id === payment.user_id);
        const plan = plans?.find(p => p.id === payment.plan_id);
        
        return {
          id: payment.id,
          monto: payment.monto,
          moneda: payment.moneda,
          estado: payment.estado,
          metodo_pago: payment.metodo_pago,
          created_at: payment.created_at,
          user_data: user ? {
            nombre: user.nombre || 'Sin nombre',
            email: user.email || 'Sin email'
          } : null,
          plan_data: plan ? {
            nombre: plan.nombre || 'Sin plan'
          } : null
        };
      });
      
      setTransactions(transformedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendiente: { label: 'Pendiente', variant: 'default' as const },
      completado: { label: 'Completado', variant: 'default' as const },
      fallido: { label: 'Fallido', variant: 'destructive' as const },
      cancelado: { label: 'Cancelado', variant: 'secondary' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      (transaction.user_data?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.user_data?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transacciones de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones de Pago</CardTitle>
        <CardDescription>
          Historial detallado de todas las transacciones de pago
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuario, email o ID de transacción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="fallido">Fallido</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchTransactions} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>ID Transacción</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.user_data?.nombre || 'Sin nombre'}</div>
                      <div className="text-sm text-muted-foreground">{transaction.user_data?.email || 'Sin email'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.plan_data?.nombre || 'Sin plan'}</TableCell>
                  <TableCell className="capitalize">{transaction.metodo_pago}</TableCell>
                  <TableCell>
                    {transaction.moneda} {transaction.monto.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.estado)}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {transaction.id}
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredTransactions.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron transacciones
          </div>
        )}
      </CardContent>
    </Card>
  );
};
