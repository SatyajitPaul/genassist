import { LightningElement, track, api, wire } from "lwc"
import { NavigationMixin } from "lightning/navigation"
import { CurrentPageReference } from "lightning/navigation"
import processMessage from "@salesforce/apex/GenAssistController.processMessage"
import getContextInfo from "@salesforce/apex/GenAssistContextService.getContextInfo"

export default class GenAssistChatV2 extends NavigationMixin(LightningElement) {
  @track userInput = ""
  @track messages = []
  @track isThinking = false
  @track showResults = false
  @track contextData = {}

  @api recordId
  @api objectApiName

  @wire(CurrentPageReference)
  pageRef

  connectedCallback() {
    this.loadContextData()
    this.renderChatMessages()
    this.addWelcomeMessage()
  }

  async loadContextData() {
    try {
      this.contextData = await getContextInfo({
        recordId: this.recordId,
        objectApiName: this.objectApiName,
        pageReference: JSON.stringify(this.pageRef),
      })
    } catch (error) {
      console.error("Error loading context data", error)
    }
  }

  addWelcomeMessage() {
    this.messages.push({
      id: "welcome",
      sender: "assistant",
      content: "Hello! I'm Gen Assist. How can I help you today?",
      timestamp: new Date().toISOString(),
    })
    this.renderChatMessages()
  }

  handleInputChange(event) {
    this.userInput = event.target.value
  }

  handleKeyPress(event) {
    if (event.keyCode === 13) {
      this.handleSendMessage()
    }
  }

  get isInputEmpty() {
    return !this.userInput || this.userInput.trim() === ""
  }

  async handleSendMessage() {
    if (this.isInputEmpty) return

    const userMessage = this.userInput.trim()
    this.userInput = ""

    // Add user message to chat
    this.messages.push({
      id: "user-" + Date.now(),
      sender: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    })
    this.renderChatMessages()

    // Show thinking indicator
    this.isThinking = true

    try {
      // Process message with backend
      const response = await processMessage({
        message: userMessage,
        contextData: JSON.stringify(this.contextData),
      })

      // Handle response
      this.handleAssistantResponse(response)
    } catch (error) {
      console.error("Error processing message", error)
      this.messages.push({
        id: "error-" + Date.now(),
        sender: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date().toISOString(),
      })
    } finally {
      this.isThinking = false
      this.renderChatMessages()
    }
  }

  handleAssistantResponse(response) {
    // Add thinking process if available
    if (response.thinking) {
      this.messages.push({
        id: "thinking-" + Date.now(),
        sender: "assistant-thinking",
        content: response.thinking,
        timestamp: new Date().toISOString(),
      })
    }

    // Add assistant response
    this.messages.push({
      id: "assistant-" + Date.now(),
      sender: "assistant",
      content: response.message,
      timestamp: new Date().toISOString(),
    })

    // Handle navigation if needed
    if (response.navigation) {
      this.handleNavigation(response.navigation)
    }

    // Handle results if available
    if (response.results) {
      this.showResults = true
      this.renderResults(response.results)
    }

    // Update context if needed
    if (response.updatedContext) {
      this.contextData = { ...this.contextData, ...response.updatedContext }
    }
  }

  handleNavigation(navigationParams) {
    try {
      this[NavigationMixin.Navigate](JSON.parse(navigationParams))
    } catch (error) {
      console.error("Navigation error", error)
    }
  }

  renderChatMessages() {
    const container = this.template.querySelector(".chat-messages")
    if (!container) return

    let html = ""
    this.messages.forEach((msg) => {
      const className = `message ${msg.sender}`
      let content = msg.content

      // Format thinking content differently
      if (msg.sender === "assistant-thinking") {
        content = `<div class="thinking-content"><strong>Thinking:</strong> ${content}</div>`
      }

      html += `
                <div class="${className}">
                    <div class="message-content">${content}</div>
                    <div class="message-timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
            `
    })

    container.innerHTML = html
    container.scrollTop = container.scrollHeight
  }

  renderResults(results) {
    const container = this.template.querySelector(".results-content")
    if (!container) return

    container.innerHTML = results
  }

  closeResults() {
    this.showResults = false
  }
}