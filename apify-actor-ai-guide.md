# Apify Actor Development with AI - Complete Guide

**Source**: https://docs.apify.com/platform/actors/development/quick-start/build-with-ai

---

## Overview

This guide provides best practices for building new Actors or improving existing ones using AI code generation and vibe coding tools such as **Cursor**, **Claude Code**, or **Visual Studio Code** with GitHub Copilot.

The key is to provide AI agents with the right instructions and context to help you create and deploy Apify Actors step by step.

---

## Quick Start Instructions

### 1. Create Your Project Directory

```bash
mkdir my-new-actor
cd my-new-actor
```

### 2. Open in Your AI Coding Assistant

Open the directory in one of these tools:
- **Cursor**
- **Claude Code**  
- **VS Code with GitHub Copilot**

### 3. Use the AI Assistant Prompt

Copy and paste the **AI coding assistant prompt** (see section below) into your AI coding assistant's Agent or Chat interface. The AI will guide you through:

- Setting up the Actor structure
- Configuring all required files
- Installing dependencies
- Running the Actor locally
- Logging into Apify
- Pushing to the Apify platform
- Following Apify's best practices

**Important**: The AI will follow the guide step-by-step, helping you avoid copy-pasting from tools like ChatGPT or Claude.

---

## AI Coding Assistant Prompt

**Note**: The official Apify documentation page has a "Show prompt" button that reveals the complete prompt. For the most up-to-date prompt, visit:

https://docs.apify.com/platform/actors/development/quick-start/build-with-ai

The prompt should guide the AI to:

1. **Initialize the project structure**
   - Create `.actor/` directory with `actor.json`
   - Set up `INPUT_SCHEMA.json`
   - Create `README.md`
   - Generate main code file (e.g., `main.js`, `main.py`)

2. **Configure dependencies**
   - Create `package.json` (Node.js) or `requirements.txt` (Python)
   - Install required packages

3. **Set up Dockerfile**
   - Use appropriate base image
   - Configure environment

4. **Implement core functionality**
   - Handle input/output
   - Use Apify SDK features
   - Follow best practices

5. **Test locally**
   - Run with `apify run`
   - Verify functionality

6. **Deploy to Apify**
   - Login with `apify login`
   - Push with `apify push`

---

## Using Actor Templates with AGENTS.md

All [Apify Actor Templates](https://apify.com/templates) include an `AGENTS.md` file designed to help with AI-assisted development.

### Using the Apify CLI

```bash
# Install Apify CLI if you haven't
npm install -g apify-cli

# Create an Actor from a template
apify create
```

The CLI will guide you through Actor initialization, where you can select a template that fits your needs. The result is an initialized Actor with `AGENTS.md` ready for development.

**Installation Guide**: https://docs.apify.com/cli/docs/installation

---

## Setting Up Apify MCP Server

The **Apify MCP Server** (Model Context Protocol) provides tools to search and fetch documentation. Setting it up in your AI editor helps improve code generation by providing additional context.

### Configuration Options

Choose your editor below:

#### Cursor

1. Create or open `.cursor/mcp.json`
2. Add this configuration:

```json
{
  "mcpServers": {
    "apify": {
      "url": "https://mcp.apify.com/?tools=docs"
    }
  }
}
```

#### VS Code

VS Code supports MCP through compatible extensions like:
- GitHub Copilot
- Cline
- Roo Code

**Steps**:

1. Install an MCP-compatible extension
2. Locate the extension's MCP settings or configuration file (often `mcp.json`)
   - For **GitHub Copilot**: Run the **MCP: Open User Configuration** command
   - For **MCP-compatible extensions**: Go to the MCP Servers tab in the extension interface
3. Add the Apify server configuration:

```json
{
  "mcpServers": {
    "apify": {
      "url": "https://mcp.apify.com/?tools=docs"
    }
  }
}
```

#### Claude Desktop

1. Go to **Settings** > **Connectors**
2. Click **Add custom connector**
3. Set:
   - **Name**: `Apify`
   - **URL**: `https://mcp.apify.com/?tools=docs`
4. When chatting, click the **+** button and choose the **Apify** connector to add documentation context

**Full Configuration Guide**: https://mcp.apify.com/

---

## Providing Context to AI Assistants

### Copy for LLM Button

Every page in Apify documentation has a **"Copy for LLM"** button. Use it to:
- Add additional context to your AI assistant
- Open the page in ChatGPT, Claude, or Perplexity
- Ask specific questions about the documentation

### Using `/llms.txt` Files

The entire Apify documentation is available in Markdown format for LLMs and AI coding tools:

- **Index file**: https://docs.apify.com/llms.txt
  - A Markdown file with an index of all documentation pages based on the [llmstxt.org](https://llmstxt.org/) standard
  
- **Full documentation**: https://docs.apify.com/llms-full.txt
  - All Apify documentation consolidated in a single Markdown file

**Access Markdown Source**:
- Add `.md` to any documentation page URL to view its source
- Example: `https://docs.apify.com/platform/actors` → `https://docs.apify.com/platform/actors.md`

**Important**: LLMs don't automatically discover `llms.txt` files — you need to manually provide the link to improve answer quality.

---

## Best Practices for AI-Assisted Actor Development

### 1. Small Tasks

- **Don't** ask AI for many tasks at once
- **Do** break complex problems into smaller pieces
- **Do** solve them step by step

### 2. Iterative Approach

- Work iteratively with clear steps
- Start with a basic implementation
- Gradually add complexity

### 3. Versioning

- Version your changes often using git
- Track changes effectively
- Roll back if needed
- Maintain a clear history

### 4. Security

- **Never** expose API keys, secrets, or sensitive information
- Don't share credentials in code
- Don't share credentials in conversations with LLM assistants

---

## Actor Structure

Every Actor needs these key files:

### Required Files

1. **`.actor/actor.json`**
   - Actor configuration and metadata
   - See: https://docs.apify.com/platform/actors/development/actor-definition/actor-json

2. **`INPUT_SCHEMA.json`**
   - Defines what inputs your Actor accepts
   - Generates UI for users
   - See: https://docs.apify.com/platform/actors/development/actor-definition/input-schema

3. **`README.md`**
   - Documentation for users
   - Critical for attracting users
   - Should be comprehensive and clear

4. **Main code file**
   - Your actual scraping/automation logic
   - `main.js` (JavaScript)
   - `main.py` (Python)
   - Other languages supported

5. **Dependencies file**
   - `package.json` (Node.js)
   - `requirements.txt` (Python)
   - Lists all required packages

6. **`Dockerfile`** (optional but recommended)
   - Specifies the base image
   - Configures the environment
   - See: https://docs.apify.com/platform/actors/development/actor-definition/dockerfile

---

## Development Workflow

### Local Development

```bash
# 1. Install Apify CLI
npm install -g apify-cli

# 2. Create a new Actor
apify create my-actor

# 3. Navigate to the Actor directory
cd my-actor

# 4. Test locally
apify run

# 5. Login to Apify
apify login

# 6. Push to Apify platform
apify push
```

### Using Templates

When you run `apify create`, you can choose from various templates:

- **JavaScript templates**: Cheerio, Playwright, Puppeteer
- **Python templates**: BeautifulSoup, Playwright, Scrapy
- **AI Agent templates**: CrewAI, LangGraph, LlamaIndex
- **MCP Server templates**
- **Empty templates** for starting from scratch

Each template comes with:
- Pre-configured structure
- Example code
- `AGENTS.md` for AI assistance
- Best practice examples

---

## What to Build

Consider these Actor types:

### Web Scrapers
- Extract data from specific websites
- Parse HTML, JSON, or APIs
- Handle pagination and navigation

### API Wrappers
- Make APIs easier to use
- Add features to existing APIs
- Combine multiple APIs

### MCP Servers
- Tools for AI agents
- Expose functionality via MCP protocol
- Enable AI integration

### Data Processors
- Transform data formats
- Clean and validate data
- Aggregate from multiple sources

### Automation Workflows
- Automate repetitive tasks
- Chain multiple operations
- Schedule periodic tasks

### AI Agents
- LLM-powered automation
- Multi-step reasoning
- Tool-using agents

**Find Ideas**: https://docs.apify.com/academy/build-and-publish/actor-ideas/find-actor-ideas

---

## Actor Quality Requirements

To be published in Apify Store, your Actor must meet these standards:

### Minimum Quality Score: 65/100

Quality factors include:
- **Comprehensive README** (critical!)
- **Well-defined input/output schema**
- **Proper error handling**
- **Good test coverage**
- **Regular maintenance**
- **User satisfaction**
- **Performance optimization**

### README Best Practices

The first 25% of your README should clearly explain:
- What the Actor does
- Who it's for
- Key features
- Quick start example

**Guide**: https://docs.apify.com/academy/actor-marketing-playbook/actor-basics/how-to-create-an-actor-readme

---

## Testing and Publishing

### Testing Checklist

- [ ] Test locally with `apify run`
- [ ] Test with different input configurations
- [ ] Verify output format
- [ ] Check error handling
- [ ] Test edge cases
- [ ] Monitor memory usage
- [ ] Check execution time

### Publishing Checklist

- [ ] Comprehensive README
- [ ] Input schema defined
- [ ] Output schema defined
- [ ] Proper error messages
- [ ] Version number set
- [ ] Categories selected
- [ ] Screenshot/video added
- [ ] SEO-friendly title and description

### Deployment

```bash
# Push to Apify
apify push

# The Actor will be:
# 1. Built on Apify platform
# 2. Available to run
# 3. Ready to publish (if you choose)
```

**Publishing Guide**: https://docs.apify.com/platform/actors/publishing/publish

---

## Available Libraries and Tools

### JavaScript/Node.js

**Core Libraries**:
- **Crawlee**: Web scraping and crawling framework
- **Playwright**: Browser automation
- **Puppeteer**: Headless Chrome control
- **Cheerio**: Fast HTML parsing
- **Apify SDK**: Platform integration

**Installation**:
```bash
npm install crawlee playwright puppeteer cheerio apify
```

### Python

**Core Libraries**:
- **BeautifulSoup**: HTML parsing
- **Scrapy**: Web scraping framework
- **Playwright**: Browser automation
- **HTTPX**: HTTP client
- **Apify SDK**: Platform integration

**Installation**:
```bash
pip install beautifulsoup4 scrapy playwright httpx apify
```

### AI/ML Libraries

- **LangChain**: LLM application framework
- **CrewAI**: Multi-agent AI systems
- **LangGraph**: Agent workflow graphs
- **LlamaIndex**: Data indexing for LLMs

---

## Key Documentation Links

### Essential Guides

- **Actor Development**: https://docs.apify.com/platform/actors/development
- **Quick Start**: https://docs.apify.com/platform/actors/development/quick-start
- **Actor Definition**: https://docs.apify.com/platform/actors/development/actor-definition
- **Input Schema**: https://docs.apify.com/platform/actors/development/actor-definition/input-schema
- **Publishing**: https://docs.apify.com/platform/actors/publishing

### Templates and Examples

- **Actor Templates**: https://apify.com/templates
- **Apify Store**: https://apify.com/store
- **GitHub Examples**: https://github.com/apify/actor-templates

### API and SDK

- **API Documentation**: https://docs.apify.com/api
- **JavaScript SDK**: https://docs.apify.com/sdk/js
- **Python SDK**: https://docs.apify.com/sdk/python
- **CLI Documentation**: https://docs.apify.com/cli

### Learning Resources

- **Apify Academy**: https://docs.apify.com/academy
- **Web Scraping Basics**: https://docs.apify.com/academy/scraping-basics-javascript
- **Python Scraping**: https://docs.apify.com/academy/scraping-basics-python
- **AI Agents Tutorial**: https://docs.apify.com/academy/ai/ai-agents

---

## Common Patterns and Examples

### Basic Actor Structure (JavaScript)

```javascript
import { Actor } from 'apify';

await Actor.init();

// Get input
const input = await Actor.getInput();

// Process data
const results = [];
// ... your scraping logic here ...

// Save results
await Actor.pushData(results);

await Actor.exit();
```

### Basic Actor Structure (Python)

```python
from apify import Actor

async def main():
    async with Actor:
        # Get input
        actor_input = await Actor.get_input()
        
        # Process data
        results = []
        # ... your scraping logic here ...
        
        # Save results
        await Actor.push_data(results)

if __name__ == '__main__':
    Actor.main(main)
```

### Input Schema Example

```json
{
  "title": "My Actor Input",
  "type": "object",
  "schemaVersion": 1,
  "properties": {
    "startUrls": {
      "title": "Start URLs",
      "type": "array",
      "description": "List of URLs to scrape",
      "editor": "requestListSources"
    },
    "maxItems": {
      "title": "Max items",
      "type": "integer",
      "description": "Maximum number of items to scrape",
      "default": 100
    }
  },
  "required": ["startUrls"]
}
```

---

## Troubleshooting

### Common Issues

1. **Actor not starting**
   - Check Dockerfile configuration
   - Verify all dependencies are installed
   - Check logs for error messages

2. **Input not working**
   - Validate INPUT_SCHEMA.json syntax
   - Ensure field names match in code
   - Check required fields

3. **Build failing**
   - Check Dockerfile base image
   - Verify dependency versions
   - Look for syntax errors in package.json/requirements.txt

4. **Data not saving**
   - Verify `Actor.pushData()` is called
   - Check output format
   - Ensure Actor exits properly

### Getting Help

- **Discord Community**: 11,500+ developers
- **GitHub Issues**: Report bugs and request features
- **Apify Support**: For platform-related issues
- **Documentation**: Comprehensive guides and examples

---

## Next Steps

1. **Create your first Actor** using `apify create`
2. **Test locally** with different inputs
3. **Deploy to Apify** with `apify push`
4. **Iterate and improve** based on testing
5. **Publish to Store** when ready
6. **Promote your Actor** to attract users

### For the Apify $1M Challenge

- Challenge runs until **January 31, 2026**
- **$1M prize pool** for developers
- Build tools that fill gaps in AI workflows
- Earn passive income from your Actors
- Weekly spotlights and grand prizes

**Challenge Details**: https://apify.com/challenge

---

## Summary

Building Actors with AI assistance is faster and easier when you:

✅ Use the right AI coding tools (Cursor, Claude Code, VS Code + Copilot)  
✅ Provide proper context (MCP server, llms.txt, documentation)  
✅ Start with templates and iterate  
✅ Follow best practices for structure and code quality  
✅ Test thoroughly before publishing  
✅ Write comprehensive documentation  

**Remember**: The quality of your Actor directly impacts its success in Apify Store. Focus on solving real problems, writing clear documentation, and building reliable tools that users will love.

---

**Full Documentation**: https://docs.apify.com/llms-full.txt  
**Apify Console**: https://console.apify.com  
**Apify Store**: https://apify.com/store
