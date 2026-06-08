import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createBusiness, getBusinesses } from '../api/businesses';
import { useAuth } from '../auth/AuthContext';
import { BusinessWithMembership } from '../types/business';
import { getErrorMessage } from '../utils/getErrorMessage';

const DEFAULT_BUSINESS_NAME = 'Mi negocio';

type BusinessContextValue = {
  businesses: BusinessWithMembership[];
  selectedBusiness: BusinessWithMembership | null;
  selectedBusinessId: string | null;
  isLoading: boolean;
  error: string | null;
  selectBusiness: (businessId: string) => void;
  refreshBusinesses: () => Promise<void>;
};

const BusinessContext = createContext<BusinessContextValue | undefined>(
  undefined,
);

export function BusinessProvider({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();
  const [businesses, setBusinesses] = useState<BusinessWithMembership[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBusinesses = useCallback(async () => {
    if (!isAuthenticated) {
      setBusinesses([]);
      setSelectedBusinessId(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let nextBusinesses = await getBusinesses();

      if (nextBusinesses.length === 0) {
        const created = await createBusiness({ name: DEFAULT_BUSINESS_NAME });
        nextBusinesses = [{ ...created, role: 'OWNER' }];
      }

      setBusinesses(nextBusinesses);
      setSelectedBusinessId((current) => {
        if (current && nextBusinesses.some((business) => business.id === current)) {
          return current;
        }

        return nextBusinesses[0]?.id ?? null;
      });
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, 'No se pudieron cargar los negocios'),
      );
      setBusinesses([]);
      setSelectedBusinessId(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshBusinesses();
  }, [refreshBusinesses]);

  const selectBusiness = useCallback((businessId: string) => {
    setSelectedBusinessId(businessId);
  }, []);

  const selectedBusiness = useMemo(
    () =>
      businesses.find((business) => business.id === selectedBusinessId) ?? null,
    [businesses, selectedBusinessId],
  );

  const value = useMemo(
    () => ({
      businesses,
      selectedBusiness,
      selectedBusinessId,
      isLoading,
      error,
      selectBusiness,
      refreshBusinesses,
    }),
    [
      businesses,
      selectedBusiness,
      selectedBusinessId,
      isLoading,
      error,
      selectBusiness,
      refreshBusinesses,
    ],
  );

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);

  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }

  return context;
}
