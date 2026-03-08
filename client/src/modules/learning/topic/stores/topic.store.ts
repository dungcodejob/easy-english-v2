import { create } from 'zustand';

interface TopicState {
  isCreateModalOpen: string;
  isEditModalOpen: string;
  selectedTopicId: string | null;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (id: string) => void;
  closeEditModal: () => void;
}

export const useTopicStore = create<TopicState>((set) => ({
  isCreateModalOpen: '',
  isEditModalOpen: '',
  selectedTopicId: null,
  openCreateModal: () => set({ isCreateModalOpen: 'true' }),
  closeCreateModal: () => set({ isCreateModalOpen: '' }),
  openEditModal: (id) => set({ isEditModalOpen: 'true', selectedTopicId: id }),
  closeEditModal: () => set({ isEditModalOpen: '', selectedTopicId: null }),
}));
