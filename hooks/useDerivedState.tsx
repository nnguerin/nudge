import { useStore } from '@/store/store';

export const useDerivedState = () => {
  const { session } = useStore();

  return {
    isLoggedIn: Object.hasOwn(session ?? {}, 'access_token'),
  };
};
