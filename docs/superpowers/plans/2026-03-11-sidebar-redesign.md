# Sidebar Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the AnyTools Chrome extension side panel UI to be visually consistent across all four modules (Chat, Agent, Debug, OCR) using a clean white/purple design system with no dark mode, no heavy shadows, and a strict 4-size type scale.

**Architecture:** Apply a new `--color-*` CSS token layer in `index.css` as the single source of truth, alias the legacy `--chrome-*` tokens to it, then update each module's components to use the new tokens and follow the design constraints. No behavioral or logic changes — visual layer only.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Vite, Chrome Extension (Manifest V3)

**Spec:** `docs/superpowers/specs/2026-03-11-sidebar-redesign-design.md`

**Build command:** `npm run build` (outputs to `dist/`)

**Load in Chrome:** `chrome://extensions` → Load unpacked → select `dist/`

---

## Chunk 1: CSS Foundation

### Task 1: Define design tokens and remove dark mode

**Files:**
- Modify: `src/pages/sidepanel/index.css`

- [ ] **Step 1: Replace the `:root` block (lines 3–9) with new tokens and legacy aliases**

The current `:root` block spans only lines 3–9. Replace those 7 lines with:

```css
:root {
    /* Design tokens */
    --color-primary: #7c3aed;
    --color-primary-light: #a78bfa;
    --color-primary-tint: #f0ebff;
    --color-bg: #ffffff;
    --color-surface: #fafafa;
    --color-border: #e0e0e0;
    --color-border-light: #f0f0f0;
    --color-text: #202124;
    --color-text-secondary: #5f6368;
    --color-text-muted: #9aa0a6;
    --color-text-placeholder: #bbb;
    --color-send-inactive: #9aa0a6;

    /* Legacy aliases — keeps existing components working without file-by-file edits */
    --chrome-bg: var(--color-bg);
    --chrome-text: var(--color-text);
    --chrome-text-secondary: var(--color-text-secondary);
    --chrome-border: var(--color-border);
    --chrome-input-bg: var(--color-bg);
}
```

Do not touch anything outside lines 3–9 in this step.

- [ ] **Step 2: Delete all `@media (prefers-color-scheme: *)` blocks from `index.css`**

Search the entire file for every `@media (prefers-color-scheme:` occurrence and delete each entire block (from the `@media` keyword through its closing `}`). There are approximately 9 such blocks scattered through the file (`:root` dark override, scrollbar hover dark, sidebar hover dark, debug panel icon dark, debug button hover dark, debug elapsed dark, debug output light, debug output pre light, debug table header dark).

After deleting all of them, verify zero remain:

```bash
grep -c "prefers-color-scheme" src/pages/sidepanel/index.css
```

Expected output: `0`

- [ ] **Step 3: Fix `.debug-output` — remove the light-mode override, keep dark as default**

The existing `.debug-output` rule already has `background: #1e1e1e` as its default. The `@media (prefers-color-scheme: light)` block that overrides it to `#f6f8fa` was deleted in Step 2. Now also fix `.debug-output-pre` to be unconditionally dark (its light-mode override was also deleted):

```css
.debug-output-pre {
    margin: 0;
    padding: 10px 12px;
    font-size: 11px;
    line-height: 1.5;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    white-space: pre-wrap;
    word-break: break-word;
    color: #e5e7eb;
}
```

This is the existing rule with its dark-mode color kept unconditionally. No change needed if the light-mode override was already deleted.

- [ ] **Step 4: Build and verify no errors**

```bash
cd /home/boltbolt/Desktop/agent-extension && npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/sidepanel/index.css
git commit -m "feat: add design tokens and remove dark mode from CSS"
```

---

### Task 2: Update sidebar rail styles in CSS

**Files:**
- Modify: `src/pages/sidepanel/index.css`

- [ ] **Step 1: Update `.sidebar-strip` width**

Find `.sidebar-strip` (currently line ~296). Change only `width` and `min-width`:

```css
.sidebar-strip {
    width: 44px;
    min-width: 44px;
    border-left: 1px solid var(--chrome-border);
    background: var(--chrome-bg);
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
}
```

- [ ] **Step 2: Update `.sidebar-item` dimensions and radius**

Find `.sidebar-item` (currently line ~307). Replace it entirely:

```css
.sidebar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 2px 4px;
    border-radius: 8px;
    width: 36px;
    cursor: pointer;
    border: none;
    background: transparent;
    transition: background 0.15s;
    color: var(--chrome-text-secondary);
}

.sidebar-item:hover {
    background: rgba(0, 0, 0, 0.04);
}
```

Note: `border-radius` changes from `10px` → `8px`, `width` from `48px` → `36px`, `padding` from `8px 4px` → `2px 4px`. The `transition` drops `box-shadow` reference since active state no longer has one.

- [ ] **Step 3: Update `.sidebar-icon-active` — replace gradient with tint**

Find `.sidebar-icon-active` (currently line ~344). Replace entirely:

```css
.sidebar-icon-active {
    background: var(--color-primary-tint);
    color: var(--color-primary);
    box-shadow: none;
}
```

The `linear-gradient`, white `color`, and `box-shadow: 0 2px 8px ...` are all removed.

- [ ] **Step 4: Update `.sidebar-icon` transition — remove stale `box-shadow` reference**

Find `.sidebar-icon` (currently line ~334). Update the `transition` property:

```css
.sidebar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    transition: background 0.15s;
}
```

Removed `box-shadow 0.15s` from the transition since `box-shadow` is no longer used on this element.

- [ ] **Step 5: Delete orphaned `.sidebar-label` and `.sidebar-label-active` CSS rules**

Find and delete these two CSS rules entirely (they will be unused after the label `<span>` is removed from the TSX in Task 3):

```css
/* DELETE: */
.sidebar-label { ... }
.sidebar-label-active { ... }
```

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/pages/sidepanel/index.css
git commit -m "feat: update sidebar rail CSS — 44px width, tint active state, no shadow"
```

---

## Chunk 2: Right Icon Rail + Chat Header

### Task 3: Update Sidebar component

**Files:**
- Modify: `src/pages/sidepanel/components/layout/Sidebar.tsx`

- [ ] **Step 1: Remove the label `<span>` from each rail button**

The current component renders each item as:

```tsx
<button key={item.mode} onClick={() => onModeChange(item.mode)}
    className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
    title={item.label}
>
    <span className={`sidebar-icon ${isActive ? 'sidebar-icon-active' : ''}`}>
        {item.icon}
    </span>
    <span className={`sidebar-label ${isActive ? 'sidebar-label-active' : ''}`}>
        {item.label}
    </span>
</button>
```

Delete the second `<span>` (the one with `sidebar-label` / `sidebar-label-active`). The icon span stays. The active icon span correctly keeps **both** `sidebar-icon` and `sidebar-icon-active` classes — do NOT remove `sidebar-icon` from active items, as `sidebar-icon` provides the `width`, `height`, `display`, and `border-radius` properties.

Result after change:

```tsx
<button key={item.mode} onClick={() => onModeChange(item.mode)}
    className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
    title={item.label}
>
    <span className={`sidebar-icon ${isActive ? 'sidebar-icon-active' : ''}`}>
        {item.icon}
    </span>
</button>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/sidepanel/components/layout/Sidebar.tsx
git commit -m "feat: remove text labels from sidebar rail"
```

---

### Task 4: Rebuild ChatHeader

**Files:**
- Modify: `src/pages/sidepanel/components/layout/ChatHeader.tsx`

- [ ] **Step 1: Read the current file**

Read `src/pages/sidepanel/components/layout/ChatHeader.tsx` to confirm the existing import path for `useChatContext` (expected: `../../context/ChatContext`) and the current export style.

- [ ] **Step 2: Replace the entire file**

Replace the full contents of `ChatHeader.tsx` with:

```tsx
import React from 'react';
import { useChatContext } from '../../context/ChatContext';

export function ChatHeader() {
    const { currentConversation } = useChatContext();
    const title = currentConversation?.title || 'Any Tools';

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 12px',
            height: '40px',
            borderBottom: '1px solid var(--color-border-light)',
            background: 'var(--color-bg)',
            flexShrink: 0,
        }}>
            <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                flexShrink: 0,
            }} />
            <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>
                {title}
            </span>
        </div>
    );
}

export default ChatHeader;
```

Note: the file exports both a named export (`export function ChatHeader`) and a default export (`export default ChatHeader`) to be safe with any existing consumers.

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/sidepanel/components/layout/ChatHeader.tsx
git commit -m "feat: rebuild ChatHeader with gradient dot and dynamic title"
```

---

### Task 5: Wire ChatHeader into ChatLayout

**Files:**
- Modify: `src/pages/sidepanel/components/layout/ChatLayout.tsx`

- [ ] **Step 1: Remove Inter font class and add ChatHeader import**

The current `ChatLayout.tsx` line 16 has the wrapper div:

```tsx
<div className="flex flex-col h-screen bg-[var(--chrome-bg)] text-[var(--chrome-text)] font-['Inter',system-ui,sans-serif] relative overflow-hidden">
```

Remove `font-['Inter',system-ui,sans-serif]` from that className string.

Add the import at the top of the file (after the existing imports):

```tsx
import { ChatHeader } from './ChatHeader';
```

- [ ] **Step 2: Render ChatHeader as the first child**

Inside the wrapper div, add `<ChatHeader />` as the very first child — before the `ErrorBanner` conditional and before the messages div:

```tsx
<div className="flex flex-col h-screen bg-[var(--chrome-bg)] text-[var(--chrome-text)] relative overflow-hidden">
    <ChatHeader />
    {error && <ErrorBanner message={error} onClose={clearError} />}
    <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? <WelcomeScreen /> : <MessageList />}
    </div>
    <div className="flex-none bg-[var(--chrome-bg)]">
        <SelectionContext />
        <ChatInput onToggleHistory={() => setHistoryOpen(!historyOpen)} />
    </div>
    {historyOpen && <HistoryPanel onClose={() => setHistoryOpen(false)} />}
</div>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/sidepanel/components/layout/ChatLayout.tsx
git commit -m "feat: wire ChatHeader into ChatLayout, remove Inter font"
```

---

## Chunk 3: Chat Messages

### Task 6: Update MessageList spacing

**Files:**
- Modify: `src/pages/sidepanel/components/chat/MessageList.tsx`

- [ ] **Step 1: Update container classes**

The current container div at line 21 is:

```tsx
<div className="flex flex-col gap-1 p-4">
```

Change to:

```tsx
<div className="flex flex-col gap-[14px] p-3">
```

`gap-1` (4px) → `gap-[14px]`, `p-4` (16px) → `p-3` (12px). No `overflow-y-auto` is needed here — the parent div in `ChatLayout` handles scrolling.

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/sidepanel/components/chat/MessageList.tsx
git commit -m "feat: update MessageList padding and gap to design tokens"
```

---

### Task 7: Rebuild MessageBubble

**Files:**
- Modify: `src/pages/sidepanel/components/chat/MessageBubble.tsx`

- [ ] **Step 1: Remove model-icon helpers and unused imports**

Delete the following functions and their supporting code at the top of the file (lines 12–41):
- `formatTime()` function
- `getModelIcon()` function
- `getModelDisplayName()` function
- The import of `CUSTOM_MODELS, WEBAPP_MODELS` from constants

Keep: `React`, `useState`, `Globe`, `ReactMarkdown`, `remarkGfm`, `ChatMessage` imports and the `MarkdownComponents` object (lines 45–78).

- [ ] **Step 2: Fix ContextBox — remove `dark:` classes and fix font size**

Replace the `ContextBox` component (lines 108–121) with:

```tsx
const ContextBox: React.FC<{ text: string }> = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div
            className="mb-2 max-w-full rounded-[6px] border border-black/10 bg-black/5 px-3 py-2 text-[12px] text-[var(--color-text-secondary)] cursor-pointer hover:bg-black/10 transition-all"
            onClick={() => setExpanded(!expanded)}
            title="Click to expand/collapse"
        >
            <div className={`whitespace-pre-wrap break-words ${expanded ? '' : 'line-clamp-1'}`}>
                {text}
            </div>
        </div>
    );
};
```

Changes: removed all `dark:` classes, `rounded-xl` → `rounded-[6px]`, `text-[13px]` → `text-[12px]`, `text-gray-700` → `text-[var(--color-text-secondary)]`, removed `dropdown-shadow`.

- [ ] **Step 3: Fix PageContextBox — remove `dark:` classes**

Replace `PageContextBox` (lines 123–163) with:

```tsx
const PageContextBox: React.FC<{ title: string; url: string; favicon: string; content: string }> = ({ title, url, favicon, content }) => {
    const [expanded, setExpanded] = useState(false);
    let hostname = url;
    try { hostname = new URL(url).hostname; } catch { /* ignore */ }

    return (
        <div
            className="mb-2 w-full max-w-[250px] rounded-[6px] border border-black/10 bg-black/5 p-3 text-[12px] text-[var(--color-text-secondary)] flex flex-col gap-2 cursor-pointer hover:bg-black/10 transition-all"
            onClick={() => setExpanded(!expanded)}
        >
            <div className="flex items-center gap-2">
                {favicon ? (
                    <img src={favicon} className="w-5 h-5 rounded-sm flex-shrink-0 object-contain" alt="" />
                ) : (
                    <Globe className="w-5 h-5 text-[var(--color-primary)]" />
                )}
                <div className="flex flex-col overflow-hidden w-full">
                    <span className="font-medium text-[var(--color-text)] truncate w-full" title={title}>{title}</span>
                    <a
                        href={url} target="_blank" rel="noreferrer"
                        className="text-[11px] opacity-60 hover:text-[var(--color-primary)] hover:opacity-100 truncate w-full transition-colors"
                        onClick={(e) => e.stopPropagation()} title={url}
                    >
                        {hostname}
                    </a>
                </div>
            </div>
            {expanded && (
                <div className="mt-2 pt-2 border-t border-black/10 text-[12px] opacity-80 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
                    <div className="line-clamp-[10]">{content}</div>
                </div>
            )}
        </div>
    );
};
```

Changes: removed all `dark:` classes, `rounded-xl` → `rounded-[6px]`, fixed text colors to tokens, removed `dropdown-shadow`, removed `bg-white/50` from favicon img.

- [ ] **Step 4: Fix ImagePreview — fix invisible border on white background**

Replace the `<img>` tag inside `ImagePreview` (line 87–91):

```tsx
<img
    src={src}
    alt="Screenshot"
    className="max-w-full max-h-[200px] rounded-[6px] border border-[var(--color-border)] object-cover cursor-pointer hover:opacity-90 transition-opacity mb-2"
    onClick={() => setExpanded(true)}
/>
```

Changed: `border-white/10` → `border-[var(--color-border)]` (visible on white bg), `rounded-lg` → `rounded-[6px]`, removed `shadow-sm`.

- [ ] **Step 5: Replace user message layout**

The current user message branch (line 192–) has `flex justify-end mb-4` and `max-w-[85%]`. Replace:

```tsx
if (isUser) {
    return (
        <div className="flex justify-end">
            <div className="max-w-[68%] flex flex-col items-end text-left">
                {contextText && <ContextBox text={contextText} />}
                {pageContext && <PageContextBox {...pageContext} />}
                {message.imageUrl && <ImagePreview src={message.imageUrl} />}
                <div style={{
                    background: 'var(--color-primary-tint)',
                    borderRadius: '10px 10px 2px 10px',
                    padding: '8px 11px',
                    fontSize: '12px',
                    color: 'var(--color-text)',
                    lineHeight: 1.5,
                }}>
                    {displayContent}
                </div>
            </div>
        </div>
    );
}
```

Changes: removed `mb-4` (gap is now handled by `MessageList`'s `gap-[14px]`), `max-w-[85%]` → `max-w-[68%]`, replaced bubble styling with new design tokens.

- [ ] **Step 6: Replace AI message layout**

Find the AI message return (after the `if (isUser)` block). The current AI message has a model-icon/name/timestamp header row. Replace the entire AI message return with:

```tsx
// AI message
const iconUrl = null; // model icons removed per design spec

return (
    <div className="flex items-start gap-2">
        {/* Avatar */}
        <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '6px',
            background: 'var(--color-primary-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
        }}>
            <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
            }} />
        </div>
        {/* Content */}
        <div style={{ flex: 1, fontSize: '12px', color: 'var(--color-text)', lineHeight: 1.6 }}>
            <div className="msg-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                    {message.content || ''}
                </ReactMarkdown>
                {message.isStreaming && (
                    <span className="chat-cursor" />
                )}
            </div>
        </div>
    </div>
);
```

> Check the existing AI message return for any `chat-cursor` or streaming indicator class and preserve it exactly as-is inside the content area.

- [ ] **Step 7: Build and verify**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 8: Commit**

```bash
git add src/pages/sidepanel/components/chat/MessageBubble.tsx
git commit -m "feat: new message bubble styles — AI avatar, user bubble, remove model icons"
```

---

### Task 8: Update WelcomeScreen

**Files:**
- Modify: `src/pages/sidepanel/components/chat/WelcomeScreen.tsx`

- [ ] **Step 1: Read the current file**

Read `src/pages/sidepanel/components/chat/WelcomeScreen.tsx` in full.

- [ ] **Step 2: Remove the "Deep Research" entry from `topActions` and its unused import**

Find the `topActions` array. It contains 4 entries. Delete only the entry with `label: 'Deep Research'` (the one using `BrainCircuit` icon). Also delete the `BrainCircuit` import from `lucide-react` at the top of the file since it is now unused.

- [ ] **Step 3: Fix out-of-scale font size classes**

Find and replace only the classes that are actually present in the file:
- `text-4xl` → `text-[13px]`
- `text-2xl` → `text-[13px]`
- `text-xs` → `text-[11px]` (on action button labels)

- [ ] **Step 4: Remove all `dark:` classes**

Search for every `dark:` prefixed class in the file and delete them.

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors (no unused import warnings).

- [ ] **Step 6: Commit**

```bash
git add src/pages/sidepanel/components/chat/WelcomeScreen.tsx
git commit -m "feat: fix WelcomeScreen font sizes, remove Deep Research and dark classes"
```

---

## Chunk 4: Chat Input

### Task 9: Rebuild ChatInput

**Files:**
- Modify: `src/pages/sidepanel/components/chat/ChatInput.tsx`

- [ ] **Step 1: Read the current file in full**

Read `src/pages/sidepanel/components/chat/ChatInput.tsx`. Note: the Think and Deep Research buttons are in the **bottom row of the chatbox** (not in the toolbar row above). The service/model `ToolbarDropdown` components are in the toolbar row above the chatbox. There is also a `<div className="h-4 w-[1px] bg-[var(--chrome-border)]" />` divider in the toolbar row.

- [ ] **Step 2: Remove `border-t` from the outer wrapper**

Find the outermost wrapper div of the component. Remove the `border-t` class and the `border-[var(--chrome-border)]` class paired with it.

- [ ] **Step 3: Update outer wrapper padding**

Replace `p-3` on the outer wrapper with:

```tsx
className="... pt-[6px] px-[10px] pb-[10px]"
// or as inline style: style={{ padding: '6px 10px 10px 10px' }}
```

Remove `p-3` entirely before adding the new padding classes to avoid conflicts.

- [ ] **Step 4: Remove Think and Deep Research buttons**

Find the bottom row of the chatbox that contains the Think and Deep Research pill buttons. Delete both `<button>` elements and their wrappers. Keep the send button and its logic.

- [ ] **Step 5: Remove the toolbar divider**

Find `<div className="h-4 w-[1px] bg-[var(--chrome-border)]" />` (the vertical separator in the toolbar row). Delete it.

- [ ] **Step 6: Cut service/model selectors from toolbar row**

Find the two `<ToolbarDropdown>` components rendering the service provider and model in the toolbar row. Cut them out of the toolbar row entirely — they will be placed in the chatbox bottom row in the next step.

- [ ] **Step 7: Update toolbar action buttons style**

The remaining toolbar buttons (Scissors, Paperclip, BookOpen on the left; History, New Chat on the right) should each have:

```tsx
className="w-[26px] h-[26px] flex items-center justify-center rounded-[6px] border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent cursor-pointer hover:bg-black/5 transition-colors"
```

Apply this to all 5 toolbar buttons, preserving their existing `onClick` handlers and icons.

- [ ] **Step 8: Rebuild the chatbox with selectors in the bottom row**

Wrap the textarea and a new bottom row in a single container. The screenshot preview area (existing JSX) stays at the top inside the box, unchanged except add `border-radius: 6px` and `border: 1px solid var(--color-border)` to its container:

```tsx
<div style={{
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    padding: '9px 10px 7px 11px',
    display: 'flex',
    flexDirection: 'column',
}}>
    {/* Screenshot preview — keep existing JSX, add border/radius to its container */}
    {screenshotImage && (
        <div style={{ borderRadius: '6px', border: '1px solid var(--color-border)', marginBottom: '6px', overflow: 'hidden' }}>
            {/* existing screenshot preview img + remove button, unchanged */}
        </div>
    )}

    {/* Textarea */}
    <textarea
        className="text-[11px] resize-none outline-none w-full bg-transparent"
        style={{
            color: 'var(--color-text)',
            minHeight: '38px',
            marginBottom: '7px',
        }}
        placeholder="Ask anything, @ models, / prompts"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
    />

    {/* Bottom row — no divider above */}
    <div className="flex items-center gap-[5px]">
        {/* Service selector — cut from toolbar row */}
        <ToolbarDropdown
            value={settings.serviceProvider || 'custom'}
            label={currentProviderLabel}
            options={[
                { value: 'webapp', label: 'ChatGPT' },
                { value: 'custom', label: 'Custom' },
            ]}
            onChange={(provider) => {
                setServiceProvider(provider as 'custom' | 'webapp');
                const defaultModel = provider === 'webapp' ? WEBAPP_MODELS[0].value : CUSTOM_MODELS[0].value;
                setModel(defaultModel);
            }}
        />

        {/* Model selector — cut from toolbar row, add gradient dot */}
        <div className="flex items-center gap-1">
            <div style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                flexShrink: 0,
            }} />
            <ToolbarDropdown
                value={settings.chatModel}
                label={currentModelLabel}
                options={currentModels}
                onChange={setModel}
            />
        </div>

        {/* Send button */}
        <button
            style={{
                marginLeft: 'auto',
                width: '26px', height: '26px',
                borderRadius: '50%',
                border: 'none',
                cursor: (!text.trim() && !screenshotImage && !isStreaming) ? 'default' : 'pointer',
                background: (!text.trim() && !screenshotImage)
                    ? 'var(--color-send-inactive)'
                    : 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}
            onClick={handleSend}
            disabled={!text.trim() && !screenshotImage && !isStreaming}
        >
            {isStreaming ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <svg className="w-4 h-4 translate-x-px" viewBox="0 0 24 24" fill="white">
                    <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
                </svg>
            )}
        </button>
    </div>
</div>
```

> **Critical:** Preserve all existing `value`, `onChange`, `onKeyDown`, `handleSend`, `screenshotImage`, `text`, and `isStreaming` references exactly. Only the JSX structure and styling change.

- [ ] **Step 9: Build and verify**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 10: Commit**

```bash
git add src/pages/sidepanel/components/chat/ChatInput.tsx
git commit -m "feat: move selectors into chatbox, remove Think/DeepResearch, new send button"
```

---

### Task 10: Update ToolbarDropdown

**Files:**
- Modify: `src/pages/sidepanel/components/shared/ToolbarDropdown.tsx`

- [ ] **Step 1: Read the current file in full**

Read `src/pages/sidepanel/components/shared/ToolbarDropdown.tsx`. Note: the trigger button uses Tailwind classes including `rounded-full`; the panel uses `rounded-xl` and `shadow-[0_4px_20px_rgba(0,0,0,0.15)]`; option rows use `text-xs` and Tailwind hover/selected opacity classes.

- [ ] **Step 2: Update the trigger button style**

Find the trigger `<button>` element. Replace its className/style with:

```tsx
<button
    onClick={() => setOpen(o => !o)}
    style={{
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        padding: '3px 7px',
        fontSize: '10px',
        color: 'var(--color-text)',
        background: 'var(--color-bg)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        whiteSpace: 'nowrap',
    }}
>
    {/* preserve existing label content and chevron icon */}
</button>
```

Remove `rounded-full` and any other conflicting Tailwind classes from the trigger.

- [ ] **Step 3: Update the open panel container**

Find the dropdown panel `<div>`. Keep all position/z-index Tailwind classes (`absolute`, `left-0`, `bottom-full`, `mb-1.5`, `min-w-[120px]`, `z-50`) exactly as they are. Change only:
- `rounded-xl` → `rounded-[8px]`
- Remove `shadow-[0_4px_20px_rgba(0,0,0,0.15)]`
- Add `border: '1px solid var(--color-border)'` and `background: 'var(--color-bg)'` as inline styles (or update the existing className)

- [ ] **Step 4: Update option row font size**

Find the option row elements inside the panel. Replace `text-xs` with `text-[10px]` on each option row. Keep the existing hover (`bg-[var(--color-text)]/5`) and selected (`bg-[var(--color-text)]/10`) opacity Tailwind classes — they work correctly with the new token values.

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/pages/sidepanel/components/shared/ToolbarDropdown.tsx
git commit -m "feat: update ToolbarDropdown trigger and panel styles"
```

---

## Chunk 5: Agent Module

### Task 11: Update AgentLayout and AgentInput

**Files:**
- Modify: `src/pages/sidepanel/components/agent/AgentLayout.tsx`
- Modify: `src/pages/sidepanel/components/agent/AgentInput.tsx`

- [ ] **Step 1: Read both files in full**

Read `AgentLayout.tsx` and `AgentInput.tsx`.

- [ ] **Step 2: Remove Inter font from AgentLayout**

Find the wrapper div with `font-['Inter',system-ui,sans-serif]` in `AgentLayout.tsx`. Remove that class only.

- [ ] **Step 3: Fix AgentInput chatbox border radius**

In `AgentInput.tsx`, find `rounded-2xl` on the textarea/chatbox container. Replace with `rounded-[10px]`.

- [ ] **Step 4: Fix AgentInput send button**

In `AgentInput.tsx`, the send button (only visible when `!isRunning`) uses `bg-[var(--chrome-text)]` as its background with `disabled:opacity-20`. Replace the entire send button element with:

```tsx
{!isRunning && (
    <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="absolute right-2 bottom-2 w-7 h-7 rounded-full flex items-center justify-center disabled:cursor-not-allowed hover:opacity-90 transition-all active:scale-95"
        style={{
            background: text.trim() ? 'var(--color-primary)' : 'var(--color-send-inactive)',
        }}
    >
        <svg className="w-3.5 h-3.5 translate-x-px" viewBox="0 0 24 24" fill="white">
            <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
        </svg>
    </button>
)}
```

This replaces `disabled:opacity-20` with a background color swap (`var(--color-primary)` when active, `var(--color-send-inactive)` when empty), matching the Chat module's send button behavior.

- [ ] **Step 5: Fix font sizes in AgentInput**

- `text-sm` → `text-[12px]`
- `text-xs` → `text-[11px]`

- [ ] **Step 6: Remove `dark:` classes from AgentInput**

Search for every `dark:` prefixed class in `AgentInput.tsx` and delete them (e.g., `dark:hover:bg-white/5`).

- [ ] **Step 7: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/pages/sidepanel/components/agent/AgentLayout.tsx src/pages/sidepanel/components/agent/AgentInput.tsx
git commit -m "feat: fix AgentLayout font, AgentInput radius/button/dark classes"
```

---

### Task 12: Update AgentStepList and AgentStepCard

**Files:**
- Modify: `src/pages/sidepanel/components/agent/AgentStepList.tsx`
- Modify: `src/pages/sidepanel/components/agent/AgentStepCard.tsx`

- [ ] **Step 1: Read both files in full**

Read `AgentStepList.tsx` and `AgentStepCard.tsx`.

- [ ] **Step 2: Fix AgentStepList step avatar background**

Find the element with classes `bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700` in `AgentStepList.tsx`. Replace all four classes with `bg-[var(--color-surface)]`.

- [ ] **Step 3: Fix font sizes in AgentStepList**

- `text-sm` → `text-[12px]`
- `text-xs` → `text-[11px]`

- [ ] **Step 4: Remove `dark:` classes from AgentStepList**

Remove `dark:from-gray-600`, `dark:to-gray-700`, `dark:text-gray-300`, and any other `dark:` prefixed classes.

- [ ] **Step 5: Fix font sizes in AgentStepCard**

In `AgentStepCard.tsx`, the font sizing is handled by CSS classes (`.action-card`, `.agent-step-card`, etc.) defined in `index.css` rather than Tailwind classes in the TSX. No Tailwind font-size changes are needed in this file. Skip to Step 6.

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/pages/sidepanel/components/agent/AgentStepList.tsx src/pages/sidepanel/components/agent/AgentStepCard.tsx
git commit -m "feat: fix AgentStepList avatar bg, font sizes, remove dark classes"
```

---

### Task 13: Update AgentWelcomeScreen and AgentHistoryPanel

**Files:**
- Modify: `src/pages/sidepanel/components/agent/AgentWelcomeScreen.tsx`
- Modify: `src/pages/sidepanel/components/agent/AgentHistoryPanel.tsx`

- [ ] **Step 1: Read both files in full**

Read `AgentWelcomeScreen.tsx` and `AgentHistoryPanel.tsx`.

- [ ] **Step 2: Fix AgentWelcomeScreen title font size**

Find `text-2xl` on the `<h1>` element. Replace with `text-[13px]`.

- [ ] **Step 3: Fix AgentWelcomeScreen subtitle and body font sizes**

- `text-sm` → `text-[12px]`
- `text-xs` → `text-[11px]`

- [ ] **Step 4: Fix AgentWelcomeScreen suggestion chip border radius**

Find `rounded-xl` on the suggestion chip `<button>` elements. Replace with `rounded-[8px]`.

- [ ] **Step 5: Remove shadow from AgentWelcomeScreen icon badge only**

Find the icon badge `<div>` element that has `shadow-lg shadow-violet-500/25` (the element with `from-violet-500 to-purple-600`). Remove **only** the `shadow-lg shadow-violet-500/25` classes. **Keep the gradient `from-violet-500 to-purple-600`** — the spec preserves the gradient on the badge, only removing its shadow.

- [ ] **Step 6: Remove all `dark:` classes from AgentWelcomeScreen**

Search for and delete every `dark:` prefixed class.

- [ ] **Step 7: Fix AgentHistoryPanel font sizes**

- `text-lg` → `text-[13px]`
- `text-sm` → `text-[12px]`
- `text-xs` → `text-[11px]`

- [ ] **Step 8: Fix AgentHistoryPanel border radius**

- `rounded-md` → `rounded-[6px]`
- `rounded-lg` → `rounded-[8px]`
- `rounded-l-lg` → `rounded-l-[8px]`
- `rounded-full` on the search input → `rounded-[6px]` (search inputs are not send buttons or avatars; apply the control scale)

- [ ] **Step 9: Remove all `dark:` classes from AgentHistoryPanel**

- [ ] **Step 10: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 11: Commit**

```bash
git add src/pages/sidepanel/components/agent/AgentWelcomeScreen.tsx src/pages/sidepanel/components/agent/AgentHistoryPanel.tsx
git commit -m "feat: fix AgentWelcomeScreen and AgentHistoryPanel styles"
```

---

## Chunk 6: Debug Module

### Task 14: Update DebugLayout and debug CSS

**Files:**
- Modify: `src/pages/sidepanel/components/debug/DebugLayout.tsx`
- Modify: `src/pages/sidepanel/index.css` (debug class section)

- [ ] **Step 1: Read DebugLayout in full**

Read `src/pages/sidepanel/components/debug/DebugLayout.tsx`.

- [ ] **Step 2: Remove Inter font from DebugLayout**

Find the wrapper div with `font-['Inter',system-ui,sans-serif]` in `DebugLayout.tsx`. Remove that class.

- [ ] **Step 3: Fix font sizes in DebugLayout**

- `text-sm` → `text-[12px]`
- `text-xs` → `text-[11px]`

- [ ] **Step 4: Remove shadow from `.debug-btn-run` in CSS**

In `index.css`, find `.debug-btn-run`. It currently has no explicit `box-shadow` property (the gradient is `linear-gradient(135deg, #f59e0b, #d97706)`). Confirm no shadow is present — if one exists, remove it. The amber gradient stays.

- [ ] **Step 5: Confirm `.debug-output` is unconditionally dark**

The `.debug-output` rule already has `background: #1e1e1e` as its default. The `@media (prefers-color-scheme: light)` override was deleted in Task 1 Step 2. Verify the rule now reads:

```css
.debug-output {
    margin-top: 10px;
    border: 1px solid var(--chrome-border);
    border-radius: 8px;
    background: #1e1e1e;
    max-height: 400px;
    overflow: auto;
    animation: debug-output-enter 0.2s ease-out;
}
```

If any light-mode background override remains, remove it.

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/pages/sidepanel/components/debug/DebugLayout.tsx src/pages/sidepanel/index.css
git commit -m "feat: fix DebugLayout font sizes, Inter font, confirm dark output"
```

---

## Chunk 7: OCR Module

### Task 15: Update OCR CSS classes

**Files:**
- Modify: `src/pages/sidepanel/index.css` (ocr class section, lines ~900+)

- [ ] **Step 1: Fix `.ocr-dropzone` border and radius**

Note: the CSS class is `.ocr-dropzone` (no hyphen — confirmed from source). Find it and update:

```css
.ocr-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 48px 24px;
    border: 1px dashed var(--color-border);    /* was: 2px dashed rgba(124,58,237,0.35) */
    border-radius: 10px;                         /* was: 16px */
    background: rgba(124, 58, 237, 0.04);
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
}
```

- [ ] **Step 2: Remove shadow from `.ocr-dropzone-icon`**

Note: the CSS class is `.ocr-dropzone-icon` (confirmed from source). Find it and remove `box-shadow`:

```css
.ocr-dropzone-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    /* box-shadow removed */
}
```

- [ ] **Step 3: Flatten `.ocr-screenshot-btn`**

Find `.ocr-screenshot-btn` and replace:

```css
.ocr-screenshot-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 8px;                         /* was: 12px */
    font-size: 13px;                             /* was: 14px */
    font-weight: 600;
    color: white;
    border: none;
    background: var(--color-primary);            /* was: linear-gradient */
    cursor: pointer;
    transition: background 0.2s;
}

.ocr-screenshot-btn:hover {
    background: #6d28d9;
    /* no box-shadow, no transform */
}

.ocr-screenshot-btn:active {
    background: #5b21b6;
}
```

- [ ] **Step 4: Fix image preview border radius and background**

Find the image preview container class (check exact name in `index.css` around line 968+). Update:
- `border-radius: 12px` → `border-radius: 8px`
- Remove any dark background (`#1a1a2e`) — set unconditionally to `background: var(--color-surface)`

- [ ] **Step 5: Fix result panel border radius**

Find `.ocr-result-panel` or `.ocr-result-container`. Change `border-radius: 12px` → `border-radius: 8px`.

- [ ] **Step 6: Remove `backdrop-filter` from `.ocr-zoom-btn`**

Find `.ocr-zoom-btn`. Remove `backdrop-filter: blur(8px)`. Keep all other properties. Any dark-mode overrides were already deleted in Task 1.

- [ ] **Step 7: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/pages/sidepanel/index.css
git commit -m "feat: fix OCR CSS — 1px border, flat button, radii, no shadows"
```

---

### Task 16: Update OCR TSX components

**Files:**
- Modify: `src/pages/sidepanel/components/ocr/OcrLayout.tsx`
- Modify: `src/pages/sidepanel/components/ocr/OcrDropZone.tsx`

- [ ] **Step 1: Read both files in full**

Read `OcrLayout.tsx` and `OcrDropZone.tsx`.

- [ ] **Step 2: Remove Inter font from OcrLayout**

Find the wrapper div with `font-['Inter',system-ui,sans-serif]` in `OcrLayout.tsx`. Remove that class.

- [ ] **Step 3: Fix font sizes in OcrLayout**

- `text-base` → `text-[13px]`
- `text-sm` → `text-[12px]`
- `text-xs` → `text-[11px]`

- [ ] **Step 4: Remove `dark:` classes from OcrLayout**

Remove any `dark:hover:bg-white/5` and other `dark:` prefixed classes found.

- [ ] **Step 5: Fix font sizes in OcrDropZone**

- `text-sm` → `text-[12px]`
- `text-xs` → `text-[11px]`

(Note: `OcrDropZone.tsx` contains no `dark:` classes — no dark: cleanup needed.)

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/sidepanel/components/ocr/OcrLayout.tsx src/pages/sidepanel/components/ocr/OcrDropZone.tsx
git commit -m "feat: fix OCR component font sizes, Inter font, remove dark classes"
```

---

## Chunk 8: Final Verification

### Task 17: Load extension and verify all modules visually

- [ ] **Step 1: Final build**

```bash
cd /home/boltbolt/Desktop/agent-extension && npm run build
```

Expected: Build succeeds, `dist/` fully populated.

- [ ] **Step 2: Load in Chrome**

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" → select `/home/boltbolt/Desktop/agent-extension/dist/`
4. Open any webpage, click the AnyTools extension icon to open the side panel

- [ ] **Step 3: Verify Chat module**

- White background throughout, no dark surfaces
- Header: small gradient dot + "Any Tools" title (or conversation title), no buttons on right
- Right rail: 4 icons, no text labels. Active mode = soft purple tint background + purple icon. Inactive = muted gray icon.
- Messages: AI = full-width left with 20px purple square avatar dot; User = right-aligned max 68% with purple tint rounded bubble
- Input area: no top separator line; toolbar row has 5 icon buttons with borders; chatbox contains placeholder text, then Custom + (model dot) GPT label + send button at bottom (all inside one unbordered area inside the box)

- [ ] **Step 4: Verify Agent module**

- White background, no dark surfaces
- No text larger than 13px visible anywhere
- AgentInput send button is solid purple (not gradient, not dark)
- No shadows on the welcome screen icon badge (gradient on badge itself is fine)
- Suggestion chips have 8px radius
- No large font headings

- [ ] **Step 5: Verify Debug module**

- White background on panels and header
- Amber accent retained: icon backgrounds, run button gradient, focus borders remain amber
- Code output area (`.debug-output`) is dark (`#1e1e1e`) — intentional, verify it is not white
- No shadows on the run button

- [ ] **Step 6: Verify OCR module**

- White background
- Drop zone: thin 1px dashed border, 10px radius, no shadow on icon
- Screenshot button: flat purple, no shadow, no lift on hover
- No dark image preview background
- Consistent 8px radii on preview and result panels

- [ ] **Step 7: Switch between all modes and verify the rail**

Click Chat → Agent → Debug → OCR. Each time the newly active icon should show the soft purple tint. No text labels should be visible on any icon. The rail should be 44px wide.

- [ ] **Step 8: Final commit**

```bash
git add src/pages/sidepanel/index.css src/pages/sidepanel/components/layout/Sidebar.tsx src/pages/sidepanel/components/layout/ChatLayout.tsx src/pages/sidepanel/components/layout/ChatHeader.tsx src/pages/sidepanel/components/chat/MessageList.tsx src/pages/sidepanel/components/chat/MessageBubble.tsx src/pages/sidepanel/components/chat/WelcomeScreen.tsx src/pages/sidepanel/components/chat/ChatInput.tsx src/pages/sidepanel/components/shared/ToolbarDropdown.tsx src/pages/sidepanel/components/agent/AgentLayout.tsx src/pages/sidepanel/components/agent/AgentInput.tsx src/pages/sidepanel/components/agent/AgentStepList.tsx src/pages/sidepanel/components/agent/AgentStepCard.tsx src/pages/sidepanel/components/agent/AgentWelcomeScreen.tsx src/pages/sidepanel/components/agent/AgentHistoryPanel.tsx src/pages/sidepanel/components/debug/DebugLayout.tsx src/pages/sidepanel/components/ocr/OcrLayout.tsx src/pages/sidepanel/components/ocr/OcrDropZone.tsx
git commit -m "feat: complete sidebar redesign across all modules"
```
