import { useState, useEffect } from 'react';
import { Partner } from '../types';
import { MOCK_PARTNERS } from '../mockData';

const STORAGE_KEY = 'hochi_partners_data';

export const usePartners = () => {
  const [partners, setPartnersState] = useState<Partner[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPartnersState(JSON.parse(stored));
      } else {
        // If not found in localStorage, use MOCK_PARTNERS and save to localStorage
        setPartnersState(MOCK_PARTNERS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PARTNERS));
      }
    } catch (error) {
      console.error('Error reading partners from localStorage', error);
      setPartnersState(MOCK_PARTNERS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setPartners = (newPartners: Partner[]) => {
    try {
      setPartnersState(newPartners);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPartners));
      
      // Dispatch a custom event so other tabs/components can listen
      window.dispatchEvent(new Event('partners-updated'));
    } catch (error) {
      console.error('Error saving partners to localStorage', error);
    }
  };

  // Add event listener to sync across multiple hooks in the same window
  useEffect(() => {
    const handleUpdate = () => {
       const stored = localStorage.getItem(STORAGE_KEY);
       if(stored) {
         setPartnersState(JSON.parse(stored));
       }
    };
    
    window.addEventListener('partners-updated', handleUpdate);
    return () => window.removeEventListener('partners-updated', handleUpdate);
  }, []);

  return { partners, setPartners, isLoaded };
};
