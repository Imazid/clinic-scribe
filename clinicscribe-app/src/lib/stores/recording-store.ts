import { create } from 'zustand';

interface RecordingStore {
  selectedPatientId: string | null;
  consultationType: string;
  setSelectedPatientId: (id: string | null) => void;
  setConsultationType: (type: string) => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingStore>((set) => ({
  selectedPatientId: null,
  consultationType: 'Standard Consultation',
  setSelectedPatientId: (selectedPatientId) => set({ selectedPatientId }),
  setConsultationType: (consultationType) => set({ consultationType }),
  reset: () => set({ selectedPatientId: null, consultationType: 'Standard Consultation' }),
}));
