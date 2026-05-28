# Privacy Policy for CoBridge

**Last updated: May 29, 2026**

CoBridge ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains our practices regarding data collection and usage for the CoBridge Chrome Extension.

## 1. Local-First Philosophy (No Data Collection)
CoBridge is designed with a "Local First" approach. 
- **No Remote Servers**: We do not run any external servers or backend databases.
- **No Telemetry / Analytics**: We do not track your usage, clicks, or behavior.
- **Your Data Stays Yours**: All extracted AI conversation context (text, tables, images) is transmitted directly via a local HTTP connection (`localhost`) to your own local IDE extension (e.g., VS Code). None of your data ever leaves your local machine or reaches us.

## 2. Permissions Justification
We only request permissions that are technically necessary for the core functionality:
- `activeTab` & `scripting`: Used solely to parse and extract the chat DOM from supported AI websites on your screen when you click the sync button.
- `declarativeNetRequest`: Used to securely bypass local CORS restrictions when sending data to your local development environment (`localhost:3030`).
- `storage`: Used to remember your local preference configurations (such as your custom port number) across sessions.

## 3. Changes to This Policy
We may update our Privacy Policy from time to time. Any changes will be posted directly in this file within the repository.

## 4. Contact Us
If you have any questions or suggestions about our Privacy Policy, do not hesitate to open an issue on our GitHub repository.
