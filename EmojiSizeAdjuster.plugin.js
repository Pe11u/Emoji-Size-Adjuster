/**
 * @name Emoji Size Adjuster
 * @author tarutaru
 * @authorId 904135183555522591
 * @version 1.0.4
 * @description Adjusts the size of sent/received emojis with separate sliders for default and external emojis.
 * 
 * @website https://github.com/Pe11u/Emoji-Size-Adjuster
 * @source https://raw.githubusercontent.com/Pe11u/Emoji-Size-Adjuster/refs/heads/main/EmojiSizeAdjuster.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Pe11u/Emoji-Size-Adjuster/refs/heads/main/EmojiSizeAdjuster.plugin.js
 */

const React = BdApi.React;
const { Data } = BdApi;

const config = {};

module.exports = class EmojiSizeAdjuster {
    constructor(meta) {
        config.info = meta;
    }

    start() {
        this.defaultEmojiSize = 32; // Default emoji size
        this.currentEmojiSize = Data.load(config.info.name, "emojiSize") || this.defaultEmojiSize;

        // Apply initial size
        this.applyEmojiSize();
    }

    stop() {
        this.resetEmojiSize();
    }

    getSettingsPanel() {
        return () => {
            const [emojiSize, setEmojiSize] = React.useState(this.currentEmojiSize);

            const resetSize = () => {
                this.currentEmojiSize = this.defaultEmojiSize;
                setEmojiSize(this.defaultEmojiSize);
                Data.save(config.info.name, "emojiSize", this.defaultEmojiSize);
                this.applyEmojiSize();
            };

            // CSS for text styling
            const textStyle = {
                color: "white",
                textShadow: "1px 1px 5px black, 0 0 25px rgba(0,0,0,0.7), 0 0 5px black",
                fontWeight: "bold"
            };

            return React.createElement("div", { style: { padding: "20px" } }, [

                React.createElement("h4", { style: textStyle }, "Emoji Size:"),
                React.createElement("p", { style: textStyle }, `Current size: ${emojiSize}px`),
                React.createElement("input", {
                    type: "range",
                    value: emojiSize,
                    min: 16,
                    max: 128,
                    step: 1,
                    onChange: (e) => {
                        const newSize = parseInt(e.target.value, 10);
                        if (!isNaN(newSize)) {
                            this.currentEmojiSize = newSize;
                            setEmojiSize(newSize);
                            Data.save(config.info.name, "emojiSize", newSize);
                            this.applyEmojiSize();
                        }
                    },
                    style: { width: "100%", margin: "10px 0" }
                }),
                React.createElement("button", {
                    onClick: resetSize,
                    style: {
                        marginTop: "10px",
                        padding: "8px 12px",
                        backgroundColor: "#7289da",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }
                }, "Reset Emoji Size"),

                // Description for the emoji size setting
                React.createElement("p", { style: { marginTop: "20px", ...textStyle } }, "Use the slider above to adjust the size of all emojis in the chat.")
            ]);
        };
    }

    applyEmojiSize() {
        const emojiStyle = `img.emoji { width: ${this.currentEmojiSize}px !important; height: ${this.currentEmojiSize}px !important; }`;

        const styleSheet = document.getElementById("emoji-size-adjuster-style");
        if (styleSheet) {
            styleSheet.textContent = emojiStyle;
        } else {
            const newStyleSheet = document.createElement("style");
            newStyleSheet.id = "emoji-size-adjuster-style";
            newStyleSheet.textContent = emojiStyle;
            document.head.appendChild(newStyleSheet);
        }
    }

    resetEmojiSize() {
        const styleSheet = document.getElementById("emoji-size-adjuster-style");
        if (styleSheet) {
            styleSheet.remove();
        }
    }
};
