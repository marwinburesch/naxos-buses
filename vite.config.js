import { defineConfig } from 'vite'

// GitHub Pages project pages serve from /<repo-name>/, so base must match.
// Repo: naxos-buses -> base '/naxos-buses/'. For a user/org page use '/'.
export default defineConfig({
  base: '/naxos-buses/',
})
