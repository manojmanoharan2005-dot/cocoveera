/**
 * File: frontend/src/utils/usePaymentSync.js
 * Purpose: Poll /api/payments/sync-status/:orderId until backend confirms
 *          the expected payment progress has been written to MongoDB.
 *
 * Usage:
 *   const { syncConfirmed, latestProgress, latestData, timedOut } =
 *     usePaymentSync(orderId, expectedProgress, enabled);
 *
 * - enabled: start polling only when true (after payment callback fires)
 * - expectedProgress: the % we're waiting for (e.g. 60)
 * - Resolves when latestProgress >= expectedProgress OR after TIMEOUT_MS
 */
import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../context/AuthContext';

const POLL_INTERVAL_MS = 800;
const TIMEOUT_MS = 12000; // 12s max wait

const usePaymentSync = (orderId, expectedProgress = 0, enabled = false) => {
  const [syncConfirmed, setSyncConfirmed] = useState(false);
  const [latestProgress, setLatestProgress] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const confirmedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!enabled || !orderId || expectedProgress === 0) return;

    // Reset state when a new poll cycle starts
    setSyncConfirmed(false);
    setTimedOut(false);
    setError(null);
    confirmedRef.current = false;

    const stopPolling = () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };

    const poll = async () => {
      try {
        const res = await apiClient.get(`/payments/sync-status/${orderId}`);
        if (!mountedRef.current || confirmedRef.current) return;

        if (res.data?.success) {
          const { paymentProgress } = res.data.data;
          setLatestProgress(paymentProgress);
          setLatestData(res.data.data);

          if (paymentProgress >= expectedProgress) {
            confirmedRef.current = true;
            setSyncConfirmed(true);
            stopPolling();
          }
        }
      } catch (err) {
        if (!mountedRef.current) return;
        console.warn('[usePaymentSync] Poll error:', err.message);
        setError(err.message);
        // Keep retrying on error — timeout will eventually fire
      }
    };

    // Poll immediately, then on interval
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    // Graceful timeout: after TIMEOUT_MS treat as confirmed so redirect fires
    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current || confirmedRef.current) return;
      stopPolling();
      setTimedOut(true);
      confirmedRef.current = true;
      setSyncConfirmed(true); // Let redirect happen regardless
    }, TIMEOUT_MS);

    return stopPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, expectedProgress, enabled]);

  return { syncConfirmed, latestProgress, latestData, timedOut, error };
};

export default usePaymentSync;
