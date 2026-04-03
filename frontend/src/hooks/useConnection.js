import { useState, useEffect, useCallback } from 'react';
import { getConnectionStatus } from '../services/connectionService';

export const useConnection = () => {
  const [activeConnection, setActiveConnection] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await getConnectionStatus();
      setActiveConnection(data);
    } catch {
      setActiveConnection(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { activeConnection, setActiveConnection, loading, refetch: fetchStatus };
};
