/**
 * @name EmojiSizeAdjuster
 * @author taru
 * @version 1.0.0
 * @description Allows you to adjust the size of emojis in Discord messages.
 */

const { Webpack, Filters, Data, Patcher } = BdApi;
const React = BdApi.React;

module.exports = class EmojiSizeAdjuster {
    constructor(meta) {
        this.meta = meta;
        this.defaultSize = 1.5;
        this.emojiSize = Data.load(this.meta.name, "emojiSize") || this.defaultSize;
    }

    start() {
        this.patchMessages();
    }

    stop() {
        Patcher.unpatchAll(this.meta.name);
    }

    patchMessages() {
        const MessageContent = Webpack.getModule(Filters.byStrings("emoji", "userSelect"), { searchExports: true });
        if (!MessageContent) {
            console.error("MessageContent module not found");
            return;
        }

        Patcher.after(this.meta.name, MessageContent.prototype, "render", (thisObject, args, returnValue) => {
            const emojiElements = this.findEmojiElements(returnValue);
            emojiElements.forEach(emoji => {
                if (emoji && emoji.props) {
                    if (!emoji.props.style) emoji.props.style = {};
                    emoji.props.style.width = `${this.emojiSize}em`;
                    emoji.props.style.height = `${this.emojiSize}em`;
                }
            });
        });
    }

    findEmojiElements(tree) {
        const result = [];
        const search = node => {
            if (!node) return;
            if (node.type && node.type.displayName === "Emoji") {
                result.push(node);
            } else if (node.props && node.props.children) {
                if (Array.isArray(node.props.children)) {
                    node.props.children.forEach(search);
                } else {
                    search(node.props.children);
                }
            }
        };
        search(tree);
        return result;
    }

    getSettingsPanel() {
        return () => {
            const [emojiSize, setEmojiSize] = React.useState(this.emojiSize);

            const handleChange = e => {
                const newSize = parseFloat(e.target.value);
                setEmojiSize(newSize);
                this.emojiSize = newSize;
                Data.save(this.meta.name, "emojiSize", newSize);
            };

            return React.createElement(
                "div",
                { style: { padding: "10px" } },
                React.createElement("h3", null, "Emoji Size Adjuster Settings"),
                React.createElement("div", null, "Adjust the size of emojis in messages:"),
                React.createElement("input", {
                    type: "range",
                    min: "0.5",
                    max: "5",
                    step: "0.1",
                    value: emojiSize,
                    onChange: handleChange,
                    style: { width: "100%" },
                }),
                React.createElement("div", null, `${emojiSize}em`)
            );
        };
    }
};
