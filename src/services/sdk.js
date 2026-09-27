// -- Apper adapter --
const adapter = window.ApperSDK.ApperAdapter({
  getClient: () => new window.ApperSDK.ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
  }),
  ui: window.ApperSDK.ApperUI
});
export const sdk = await window.ApperSDK.CoreSDK.createClient(adapter);
