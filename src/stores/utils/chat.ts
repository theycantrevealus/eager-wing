import { defineStore } from "pinia"

export const useChatStore = defineStore("chat", {
  state: () => ({
    messages: [] as Array<{
      type: string
      content: string
    }>,
  }),
  actions: {
    addMessage(message: { type: string; content: string }) {
      const THRESHOLD = 1000
      this.messages.push(message)
      if (this.messages.length > THRESHOLD) {
        this.messages.shift()
      }
    },
  },
  getters: {
    allMessages(): Array<{ type: string; content: string }> {
      return this.messages
    },
  },
})
