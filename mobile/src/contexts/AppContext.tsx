import React, { createContext, useContext, ReactNode } from 'react';
import { NetworkProvider, useNetwork } from './NetworkContext';
import { DeliveryProvider, useDelivery } from './DeliveryContext';
import { LocationProvider, useLocation } from './LocationContext';

interface AppContextType {
  network: ReturnType<typeof useNetwork>;
  delivery: ReturnType<typeof useDelivery>;
  location: ReturnType<typeof useLocation>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

// Combined provider that wraps all context providers
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <NetworkProvider>
      <DeliveryProvider>
        <LocationProvider>
          <AppContextConsumer>{children}</AppContextConsumer>
        </LocationProvider>
      </DeliveryProvider>
    </NetworkProvider>
  );
};

// Consumer component that combines all contexts
const AppContextConsumer: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const network = useNetwork();
  const delivery = useDelivery();
  const location = useLocation();

  const value: AppContextType = {
    network,
    delivery,
    location,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Individual context hooks for when you only need specific functionality
export { useNetwork } from './NetworkContext';
export { useDelivery } from './DeliveryContext';
export { useLocation } from './LocationContext';
