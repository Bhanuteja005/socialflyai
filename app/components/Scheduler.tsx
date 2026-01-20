'use client';

import { useEffect } from 'react';

export default function Scheduler() {
  useEffect(() => {
    // Start the scheduler that runs every minute
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/scheduler/process', {
          method: 'POST',
        });
        const data = await response.json();
        if (data.success) {
          console.log('Scheduled posts processed successfully');
        } else {
          console.error('Failed to process scheduled posts:', data.error);
        }
      } catch (error) {
        console.error('Error calling scheduler:', error);
      }
    }, 60000); // Run every 60 seconds (1 minute)

    // Initial run
    fetch('/api/scheduler/process', { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Initial scheduled posts check completed');
        }
      })
      .catch(error => console.error('Error in initial scheduler run:', error));

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
}