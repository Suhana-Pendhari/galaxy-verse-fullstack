import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  theme: localStorage.getItem('theme') || 'dark',
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  modals: {
    createPost: false,
    share: false,
    confirm: false,
    settings: false,
  },
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
  loading: {
    global: false,
    page: false,
    components: {},
  },
  notifications: {
    show: false,
    message: '',
    type: 'info',
    duration: 3000,
  },
  viewMode: {
    missions: 'grid',
    community: 'list',
    spaceData: 'grid',
  },
  scrollPosition: {},
  breakpoint: 'lg', // xs, sm, md, lg, xl, 2xl
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    toggleModal: (state, action) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    showToast: (state, action) => {
      state.toast = {
        visible: true,
        ...action.payload,
      };
    },
    hideToast: (state) => {
      state.toast.visible = false;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setPageLoading: (state, action) => {
      state.loading.page = action.payload;
    },
    setComponentLoading: (state, action) => {
      const { component, isLoading } = action.payload;
      state.loading.components[component] = isLoading;
    },
    showNotification: (state, action) => {
      state.notifications = {
        show: true,
        ...action.payload,
      };
    },
    hideNotification: (state) => {
      state.notifications.show = false;
    },
    setViewMode: (state, action) => {
      const { page, mode } = action.payload;
      state.viewMode[page] = mode;
    },
    saveScrollPosition: (state, action) => {
      const { path, position } = action.payload;
      state.scrollPosition[path] = position;
    },
    getScrollPosition: (state, action) => {
      return state.scrollPosition[action.payload] || 0;
    },
    setBreakpoint: (state, action) => {
      state.breakpoint = action.payload;
    },
    resetUI: () => initialState,
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleSearch,
  setSearchOpen,
  openModal,
  closeModal,
  toggleModal,
  closeAllModals,
  showToast,
  hideToast,
  setGlobalLoading,
  setPageLoading,
  setComponentLoading,
  showNotification,
  hideNotification,
  setViewMode,
  saveScrollPosition,
  getScrollPosition,
  setBreakpoint,
  resetUI,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen;
export const selectSearchOpen = (state) => state.ui.searchOpen;
export const selectModal = (state, modalName) => state.ui.modals[modalName];
export const selectAnyModalOpen = (state) => Object.values(state.ui.modals).some(v => v);
export const selectToast = (state) => state.ui.toast;
export const selectGlobalLoading = (state) => state.ui.loading.global;
export const selectPageLoading = (state) => state.ui.loading.page;
export const selectComponentLoading = (state, component) => state.ui.loading.components[component];
export const selectNotification = (state) => state.ui.notifications;
export const selectViewMode = (state, page) => state.ui.viewMode[page] || 'grid';
export const selectBreakpoint = (state) => state.ui.breakpoint;

export default uiSlice.reducer;
