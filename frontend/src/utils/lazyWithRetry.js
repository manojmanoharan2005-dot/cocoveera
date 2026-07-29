import React, { lazy } from 'react';

/**
 * Enterprise-grade lazy loader with automatic chunk retry and stale deployment recovery.
 * Handles missing/deleted JS chunks gracefully by reloading the page once on failure.
 * Prevents infinite reload loops using sessionStorage tracking.
 * 
 * @param {Function} componentImport - Factory function returning dynamic import() e.g. () => import('./MyPage')
 * @param {string} pageKey - Unique identifier key for session storage reload tracking
 */
export function lazyWithRetry(componentImport, pageKey = '') {
  return lazy(async () => {
    const key = `cocoveera_chunk_retry_${pageKey || componentImport.toString().slice(0, 50)}`;
    const pageHasAlreadyBeenReloaded = sessionStorage.getItem(key) === 'true';

    try {
      const component = await componentImport();
      // On clean load, reset retry tracker
      sessionStorage.removeItem(key);
      return component;
    } catch (error) {
      console.error(`Chunk load failure for [${pageKey || 'Component'}]:`, error);

      // Check if error is due to chunk missing/failed module script
      if (!pageHasAlreadyBeenReloaded) {
        sessionStorage.setItem(key, 'true');
        console.warn('Stale deployment chunk detected. Force-refreshing page for new assets...');
        window.location.reload();
        // Return unresolved promise to prevent React Error Boundary while page reloads
        return new Promise(() => {});
      }

      // If reload has already occurred once, log and rethrow to allow ErrorBoundary
      console.error('Chunk retry failed after page reload. Check network or server status.');
      throw error;
    }
  });
}

export default lazyWithRetry;
