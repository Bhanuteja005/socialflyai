'use client';

import { useEffect } from 'react';

export default function Scheduler() {
  useEffect(() => {
    // Only run scheduler in development environment
    // In production (Vercel), cron jobs are handled by Vercel Cron
    const isDevelopment = typeof window !== 'undefined' &&
      window.location.hostname === 'localhost';

    if (isDevelopment) {
      const SCHEDULER_KEY = 'socialfly_scheduler_last_run';
      const SCHEDULER_LOCK_KEY = 'socialfly_scheduler_lock';

      // Function to check if another scheduler instance is running
      const isSchedulerRunning = () => {
        const lockTime = localStorage.getItem(SCHEDULER_LOCK_KEY);
        if (!lockTime) return false;

        const lockTimestamp = parseInt(lockTime);
        const now = Date.now();

        // If lock is older than 2 minutes, consider it stale and allow running
        return (now - lockTimestamp) < 120000; // 2 minutes
      };

      // Function to acquire scheduler lock
      const acquireLock = () => {
        localStorage.setItem(SCHEDULER_LOCK_KEY, Date.now().toString());
      };

      // Function to release scheduler lock
      const releaseLock = () => {
        localStorage.removeItem(SCHEDULER_LOCK_KEY);
      };

      // Function to run the scheduler
      const runScheduler = async () => {
        // Check if another instance is running
        if (isSchedulerRunning()) {
          console.log('Scheduler: Another instance is already running, skipping...');
          return;
        }

        // Acquire lock
        acquireLock();

        try {
          console.log('Scheduler: Processing scheduled posts...');
          const response = await fetch('/api/scheduler/process', {
            method: 'POST',
          });
          const data = await response.json();
          if (data.success) {
            console.log('Scheduler: Posts processed successfully');
            // Update last run timestamp
            localStorage.setItem(SCHEDULER_KEY, Date.now().toString());
          } else {
            console.error('Scheduler: Failed to process posts:', data.error);
          }
        } catch (error) {
          console.error('Scheduler: Error calling API:', error);
        } finally {
          // Always release the lock
          releaseLock();
        }
      };

      // Add random delay between 0-30 seconds to prevent all tabs from running simultaneously
      const randomDelay = Math.random() * 30000; // 0-30 seconds

      // Start the scheduler with randomized interval
      const interval = setInterval(runScheduler, 60000 + randomDelay); // Base 60s + random delay

      // Initial run after a short delay
      setTimeout(runScheduler, 2000); // Wait 2 seconds before first run

      return () => clearInterval(interval);
    }
  }, []);

  return null; // This component doesn't render anything
}