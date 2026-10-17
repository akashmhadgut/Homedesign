import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { GeneratedConcept } from '@aihome/design-engine/src/core/types';

export function useDesignGeneration() {
  return useMutation({
    mutationFn: async (intentData: any) => {
      const res = await api.post('/projects/generate', { intent: intentData });
      return res.data as GeneratedConcept;
    }
  });
}
