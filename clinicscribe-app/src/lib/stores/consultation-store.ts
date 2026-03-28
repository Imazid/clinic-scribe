import { create } from 'zustand';
import type { Consultation } from '@/lib/types';

interface ConsultationStore {
  consultations: Consultation[];
  selectedConsultation: Consultation | null;
  statusFilter: string;
  setConsultations: (data: Consultation[]) => void;
  setSelectedConsultation: (c: Consultation | null) => void;
  setStatusFilter: (filter: string) => void;
}

export const useConsultationStore = create<ConsultationStore>((set) => ({
  consultations: [],
  selectedConsultation: null,
  statusFilter: 'all',
  setConsultations: (consultations) => set({ consultations }),
  setSelectedConsultation: (selectedConsultation) => set({ selectedConsultation }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
}));
