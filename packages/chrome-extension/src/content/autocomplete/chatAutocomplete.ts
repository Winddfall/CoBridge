import {NanoEngine} from './nanoEngine';
import {getCachedProfile} from './profileLoader';

interface AdapterConfig {
    input_selector: string;
    history_selector: string;
}

interface Adapters {
    default: AdapterConfig;
    [host: string]: AdapterConfig;
}

// 适配器逻辑：存储不同 AI 网页的元素选择规则
const ADAPTERS: Adapters = {
    default: {
        input_selector: '',
        history_selector: ''
    },
    'gemini': {
        input_selector: '.ql-editor.textarea.new-input-ui',
        history_selector: 'div.user-query-container'
    },
    'claude': {
        input_selector: '/* TODO: Fill in Claude input selector */',
        history_selector: '/* TODO: Fill in Claude history selector */'
    },
    'chatgpt': {
        input_selector: '/* TODO: Fill in ChatGPT input selector */',
        history_selector: '/* TODO: Fill in ChatGPT history selector */'
    },
    'doubao': {
        input_selector: '/* TODO: Fill in Doubao input selector */',
        history_selector: '/* TODO: Fill in Doubao history selector */'
    },
    'deepseek': {
        input_selector: '/* TODO: Fill in DeepSeek input selector */',
        history_selector: '/* TODO: Fill in DeepSeek history selector */'
    },
};

function getAdapterConfig(): AdapterConfig {
    const hostname = window.location.hostname;
    for (const key of Object.keys(ADAPTERS)) {
        if (key !== 'default' && hostname.includes(key)) {
            return ADAPTERS[key];
        }
    }
    return ADAPTERS.default;
}

class ChatAutocomplete {
    private config = getAdapterConfig();
    private engine = new NanoEngine();
    private inputElement: HTMLElement | null = null;
    private ghostElement: HTMLSpanElement | null = null;
    private currentCompletion: string = '';
    private debounceTimer: number | null = null;
    // 与语义搜索一致：每次输入生成一个新序列号，过期请求绝不能更新 ghost。
    private requestGeneration = 0;
    // ghost 生成时对应的完整输入，用于在 Gemini 静默改写 DOM 时立即失效。
    private ghostInputText = '';
    private inputDomObserver: MutationObserver | null = null;

    async start() {
        if (!this.config.input_selector) {
            console.log('[CoBridge] Autocomplete: No valid adapter config for this platform.');
            return;
        }

        // 读取 background 预生成的用户画像（可能还没生成，空串也无所谓）
        const profile = await getCachedProfile();

        const initialized = await this.engine.init(profile);
        if (!initialized) return;

        this.attachGlobalInputListener();
        this.observeInputDom();
        this.observeInput();
    }

    /**
     * Gemini 偶尔会替换整个编辑器节点。监听 document 的捕获阶段可以避免
     * 旧节点上的监听器随节点一起丢失，确保清空输入也会使旧请求失效。
     */
    private attachGlobalInputListener() {
        document.addEventListener('input', (event) => {
            const currentInput = document.querySelector(this.config.input_selector) as HTMLElement | null;
            if (!currentInput || !(event.target instanceof Node) || !currentInput.contains(event.target)) {
                return;
            }

            this.setInputElement(currentInput);
            this.handleInput(event);
        }, true);
    }

    /**
     * Gemini 有时会直接替换/清空 Quill 的 DOM，而不触发我们能收到的 input
     * 事件。只要当前编辑器与生成 ghost 时的文本不一致，就立刻撤销 ghost。
     */
    private observeInputDom() {
        this.inputDomObserver?.disconnect();
        this.inputDomObserver = new MutationObserver(() => {
            const liveInput = document.querySelector(this.config.input_selector) as HTMLElement | null;
            if (!liveInput) return;

            if (liveInput !== this.inputElement) {
                this.setInputElement(liveInput);
                this.invalidateGhost();
                return;
            }

            if (this.ghostInputText && this.getElementValue(liveInput) !== this.ghostInputText) {
                this.invalidateGhost();
            }
        });
        this.inputDomObserver.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    }

    private invalidateGhost() {
        if (!this.ghostInputText) return;
        ++this.requestGeneration;
        this.hideGhost();
    }

    private observeInput() {
        const findInput = () => {
            const el = document.querySelector(this.config.input_selector) as HTMLElement;
            if (el) this.setInputElement(el);
            setTimeout(findInput, 2000);
        };
        findInput();
    }

    private setInputElement(el: HTMLElement) {
        if (el === this.inputElement) return;
        this.inputElement = el;
        this.attachListeners(el);
        this.setupGhostElement(el);
        console.log('[CoBridge] Autocomplete attached to input.');
    }

    private setupGhostElement(inputEl: HTMLElement) {
        const parent = inputEl.parentElement;
        if (!parent) return;

        if (getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
        }

        if (!this.ghostElement) {
            this.ghostElement = document.createElement('span');
            this.ghostElement.className = 'cobridge-ghost-text';
            this.ghostElement.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
                color: rgba(150, 150, 150, 0.6);
                white-space: pre-wrap;
                word-break: break-word;
                z-index: 10;
                display: none;
                background: transparent;
            `;
            parent.appendChild(this.ghostElement);
        }
    }

    private attachListeners(el: HTMLElement) {
        el.addEventListener('keydown', this.handleKeydown.bind(this));
        el.addEventListener('blur', () => this.hideGhost());

        el.addEventListener('scroll', () => {
            if (this.ghostElement) {
                this.ghostElement.style.transform = `translate(-${el.scrollLeft}px, -${el.scrollTop}px)`;
            }
        });
    }

    private handleInput(_e: Event) {
        const text = this.getInputValue();
        const generation = ++this.requestGeneration;
        // 用户任意编辑后，旧补全不再对应当前文本。
        this.hideGhost();

        if (text.trim().length < 2) {
            this.hideGhost();
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            return;
        }

        if (this.debounceTimer) clearTimeout(this.debounceTimer);

        this.debounceTimer = window.setTimeout(() => {
            const context = this.getChatContext();
            this.requestCompletion(text, context, generation);
        }, 150) as unknown as number;
    }

    private async requestCompletion(input: string, context: string, generation: number) {
        // 防抖计时器触发前，用户可能已经继续输入或清空。
        if (generation !== this.requestGeneration) return;

        const completion = await this.engine.getCompletion(input, context);
        // 请求返回时，只接受仍对应当前 DOM 中编辑器的最新结果。
        if (generation !== this.requestGeneration || !this.isCurrentLiveInput(input)) {
            this.hideGhost();
            return;
        }

        const normalized = this.normalizeCompletionBoundary(input, completion);
        if (normalized) {
            this.showGhost(input, normalized);
        }
    }

    /**
     * 模型看到完整输入也可能重复输出衔接标点。Ghost 文本是直接拼接的，
     * 因此前端必须保证两个片段的边界不会形成“。，”“！！”这类重复。
     */
    private normalizeCompletionBoundary(input: string, completion: string): string {
        let result = completion.trimStart();
        const lastChar = input.trimEnd().slice(-1);

        if (/[，。！？；：、,.!?;:]/.test(lastChar)) {
            result = result.replace(/^[，。！？；：、,.!?;:]+\s*/, '');
        }

        return result;
    }

    private handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Tab' && this.currentCompletion) {
            e.preventDefault();
            this.acceptCompletion();
        } else if (e.key === 'Escape' || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Enter') {
            this.hideGhost();
        }
    }

    private acceptCompletion() {
        if (!this.inputElement || !this.currentCompletion) return;

        if (this.inputElement instanceof HTMLTextAreaElement || this.inputElement instanceof HTMLInputElement) {
            this.inputElement.value += this.currentCompletion;
            // 光标移到末尾
            const end = this.inputElement.value.length;
            this.inputElement.setSelectionRange(end, end);
        } else {
            this.inputElement.innerText += this.currentCompletion;
            // contentEditable 光标移到末尾
            const range = document.createRange();
            range.selectNodeContents(this.inputElement);
            range.collapse(false);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }

        this.inputElement.dispatchEvent(new Event('input', {bubbles: true}));
        this.hideGhost();
    }

    private getInputValue(): string {
        if (!this.inputElement) return '';
        return this.getElementValue(this.inputElement);
    }

    private getElementValue(element: HTMLElement): string {
        if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
            return element.value;
        }
        return element.innerText;
    }

    /** 只信任此刻 DOM 中仍存在、且文本未变化的 Gemini 编辑器。 */
    private isCurrentLiveInput(expectedText: string): boolean {
        const liveInput = document.querySelector(this.config.input_selector) as HTMLElement | null;
        return !!liveInput
            && liveInput === this.inputElement
            && liveInput.isConnected
            && this.getElementValue(liveInput).trim().length >= 2
            && this.getElementValue(liveInput) === expectedText;
    }

    private getChatContext(): string {
        if (!this.config.history_selector) return '';
        const historyElements = document.querySelectorAll(this.config.history_selector);
        const history = Array.from(historyElements)
            .slice(-3)
            .map(el => {
                const text = (el as HTMLElement).innerText || '';
                return text.length > 50 ? text.slice(0, 50) + '...' : text;
            });
        return history.join('\n');
    }

    private showGhost(inputText: string, completion: string) {
        // Gemini 可能在请求期间替换 .ql-editor；不能向缓存的旧节点显示结果。
        if (!this.ghostElement || !this.inputElement || !completion || !this.isCurrentLiveInput(inputText)) {
            this.hideGhost();
            return;
        }

        this.currentCompletion = completion;
        this.ghostInputText = inputText;

        const styles = window.getComputedStyle(this.inputElement);
        const ghost = this.ghostElement.style;
        const textStyles = [
            'fontFamily', 'fontSize', 'fontStyle', 'fontWeight',
            'lineHeight', 'letterSpacing', 'wordSpacing',
            'textIndent', 'textTransform', 'textRendering',
            'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
            'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
            'boxSizing',
        ] as const;
        for (const prop of textStyles) {
            (ghost as any)[prop] = styles[prop];
        }

        ghost.textAlign = 'left';
        ghost.top = this.inputElement.offsetTop + 'px';
        ghost.left = this.inputElement.offsetLeft + 'px';
        ghost.width = this.inputElement.offsetWidth + 'px';
        ghost.height = this.inputElement.offsetHeight + 'px';
        ghost.display = 'block';

        this.ghostElement.innerHTML = `<span style="color: transparent;">${this.escapeHtml(inputText)}</span>${this.escapeHtml(completion)}`;
    }

    private hideGhost() {
        if (this.ghostElement) {
            this.ghostElement.style.display = 'none';
        }
        this.currentCompletion = '';
        this.ghostInputText = '';
    }

    private escapeHtml(unsafe: string) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
}

// Ensure the script runs when DOM is somewhat ready
setTimeout(() => {
    const controller = new ChatAutocomplete();
    controller.start();
}, 1000);
