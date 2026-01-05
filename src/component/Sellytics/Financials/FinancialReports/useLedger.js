import { useState, useCallback } from 'react';
import { supabase } from '../../../../supabaseClient';
import toast from 'react-hot-toast';

export function useLedger() {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const fetchLedger = useCallback(async (storeId) => {
    if (!storeId) {
      setLedgerEntries([]);
      return;
    }

    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from('general_ledger')
        .select('*')
        .eq('store_id', storeId)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setLedgerEntries(data || []);
    } catch (error) {
      toast.error('Error loading ledger: ' + error.message);
      setLedgerEntries([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  const deleteEntry = useCallback(async (entryId) => {
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('general_ledger')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      toast.success('Entry deleted successfully');
      setLedgerEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (error) {
      toast.error('Error deleting entry: ' + error.message);
    } finally {
      setIsMutating(false);
    }
  }, []);

  const deleteMultiple = useCallback(async (entryIds) => {
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('general_ledger')
        .delete()
        .in('id', entryIds);

      if (error) throw error;
      toast.success(`${entryIds.length} entries deleted successfully`);
      setLedgerEntries(prev =>
        prev.filter(entry => !entryIds.includes(entry.id))
      );
    } catch (error) {
      toast.error('Error deleting entries: ' + error.message);
    } finally {
      setIsMutating(false);
    }
  }, []);

  const archiveEntry = useCallback(async (entryId) => {
    setIsMutating(true);
    try {
      const { error } = await supabase
        .from('general_ledger')
        .update({ archived: true })
        .eq('id', entryId);

      if (error) throw error;
      toast.success('Entry archived successfully');
      setLedgerEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (error) {
      toast.error('Error archiving entry: ' + error.message);
    } finally {
      setIsMutating(false);
    }
  }, []);

  return {
    ledgerEntries,
    fetchLedger,
    deleteEntry,
    deleteMultiple,
    archiveEntry,
    isFetching,
    isMutating,
  };
}
