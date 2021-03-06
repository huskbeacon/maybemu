class Keyboard {
    constructor(opts) {
        if (!opts.layout || !opts.container) throw "Missing options";

        const layout = JSON.parse(require("fs").readFileSync(opts.layout, {encoding: "utf-8"}));
        this.ctrlseq = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
        this.container = document.getElementById(opts.container);

        this.linkedToTerm = true;
        this.detach = () => {
            this.linkedToTerm = false;
        };
        this.attach = () => {
            this.linkedToTerm = true;
        };

        // Set default keyboard properties
        this.container.dataset.isShiftOn = false;
        this.container.dataset.isCapsLckOn = false;
        this.container.dataset.isAltOn = false;
        this.container.dataset.isCtrlOn = false;
        this.container.dataset.isFnOn = false;

        this.container.dataset.passwordMode = false;

        // Build arrays for enabling keyboard shortcuts
        this._shortcuts = {
            CtrlAltShift: [],
            CtrlAlt: [],
            CtrlShift: [],
            AltShift: [],
            Ctrl: [],
            Alt: [],
            Shift: []
        };
        window.shortcuts.forEach(scut => {
            let cut = Object.assign({}, scut);
            let mods = cut.trigger.split("+");
            cut.trigger = mods.pop();

            let order = ["Ctrl", "Alt", "Shift"];
            mods.sort((a, b) => {
                return order.indexOf(a) - order.indexOf(b);
            });

            let cat = mods.join("");
            
            if (cut.type === "app" && cut.action === "TAB_X" && cut.trigger === "X") {
                for (let i = 1; i <= 5; i++) {
                    let ncut = Object.assign({}, cut);
                    ncut.trigger = `${i}`;
                    ncut.action = `TAB_${i}`;
                    this._shortcuts[cat].push(ncut);
                }
            } else {
                this._shortcuts[cat].push(cut);
            }
        });

        // Parse keymap and create DOM
        Object.keys(layout).forEach(row => {
            this.container.innerHTML += `<div class="keyboard_row" id="`+row+`"></div>`;
            layout[row].forEach(keyObj => {

                let key = document.createElement("div");
                key.setAttribute("class", "keyboard_key");

                if (keyObj.cmd === " ") {
                    key.setAttribute("id", "keyboard_spacebar");
                } else if (keyObj.cmd === "\r") {
                    key.setAttribute("class", "keyboard_key keyboard_enter");
                    key.innerHTML = `<h1>${keyObj.name}</h1>`;
                } else {
                    key.innerHTML = `
                        <h5>${keyObj.altshift_name || ""}</h5>
                        <h4>${keyObj.fn_name || ""}</h4>
                        <h3>${keyObj.alt_name || ""}</h3>
                        <h2>${keyObj.shift_name || ""}</h2>
                        <h1>${keyObj.name || ""}</h1>`;
                }

                // Icon support, overrides previously defined innerHTML
                // Arrow and other icons
                let icon = null;
                if (keyObj.name.startsWith("ESCAPED|-- ICON: ")) {
                    keyObj.name = keyObj.name.substr(17);
                    switch(keyObj.name) {
                        case "ARROW_UP":
                            icon = `<svg viewBox="0 0 24.00 24.00"><path fill-opacity="1" d="m12.00004 7.99999 4.99996 5h-2.99996v4.00001h-4v-4.00001h-3z"/><path stroke-linejoin="round" fill-opacity="0.65" d="m4 3h16c1.1046 0 1-0.10457 1 1v16c0 1.1046 0.1046 1-1 1h-16c-1.10457 0-1 0.1046-1-1v-16c0-1.10457-0.10457-1 1-1zm0 1v16h16v-16z"/></svg>`;
                            break;
                        case "ARROW_LEFT":
                            icon = `<svg viewBox="0 0 24.00 24.00"><path fill-opacity="1" d="m7.500015 12.499975 5-4.99996v2.99996h4.00001v4h-4.00001v3z"/><path stroke-linejoin="round" fill-opacity="0.65" d="m4 3h16c1.1046 0 1-0.10457 1 1v16c0 1.1046 0.1046 1-1 1h-16c-1.10457 0-1 0.1046-1-1v-16c0-1.10457-0.10457-1 1-1zm0 1v16h16v-16z"/></svg>`;
                            break;
                        case "ARROW_DOWN":
                            icon = `<svg viewBox="0 0 24.00 24.00"><path fill-opacity="1" d="m12 17-4.99996-5h2.99996v-4.00001h4v4.00001h3z"/><path stroke-linejoin="round" fill-opacity="0.65" d="m4 3h16c1.1046 0 1-0.10457 1 1v16c0 1.1046 0.1046 1-1 1h-16c-1.10457 0-1 0.1046-1-1v-16c0-1.10457-0.10457-1 1-1zm0 1v16h16v-16z"/></svg>`;
                            break;
                        case "ARROW_RIGHT":
                            icon = `<svg viewBox="0 0 24.00 24.00"><path fill-opacity="1" d="m16.500025 12.500015-5 4.99996v-2.99996h-4.00001v-4h4.00001v-3z"/><path stroke-linejoin="round" fill-opacity="0.65" d="m4 3h16c1.1046 0 1-0.10457 1 1v16c0 1.1046 0.1046 1-1 1h-16c-1.10457 0-1 0.1046-1-1v-16c0-1.10457-0.10457-1 1-1zm0 1v16h16v-16z"/></svg>`;
                            break;
                        default:
                            icon = `<svg viewBox="0 0 24.00 24.00"><path fill="#ff0000" fill-opacity="1" d="M 8.27125,2.9978L 2.9975,8.27125L 2.9975,15.7275L 8.27125,21.0012L 15.7275,21.0012C 17.485,19.2437 21.0013,15.7275 21.0013,15.7275L 21.0013,8.27125L 15.7275,2.9978M 9.10125,5L 14.9025,5L 18.9988,9.10125L 18.9988,14.9025L 14.9025,18.9988L 9.10125,18.9988L 5,14.9025L 5,9.10125M 9.11625,7.705L 7.705,9.11625L 10.5912,12.0025L 7.705,14.8825L 9.11625,16.2937L 12.0025,13.4088L 14.8825,16.2937L 16.2938,14.8825L 13.4087,12.0025L 16.2938,9.11625L 14.8825,7.705L 12.0025,10.5913"/></svg>`;
                    }

                    key.innerHTML = icon;
                }

                Object.keys(keyObj).forEach(property => {
                    for (let i = 1; i < this.ctrlseq.length; i++) {
                        keyObj[property] = keyObj[property].replace("~~~CTRLSEQ"+i+"~~~", this.ctrlseq[i]);
                    }
                    if (property.endsWith("cmd")) {
                        key.dataset[property] = keyObj[property];
                    }
                });

                document.getElementById(row).appendChild(key);
            });
        });

        this.container.childNodes.forEach(row => {
            row.childNodes.forEach(key => {

                let enterElements = document.querySelectorAll(".keyboard_enter");

                if (key.attributes["class"].value.endsWith("keyboard_enter")) {
                    // The enter key is divided in two dom elements, so we bind their animations here

                    key.onmousedown = e => {
                        this.pressKey(key);
                        key.holdTimeout = setTimeout(() => {
                            key.holdInterval = setInterval(() => {
                                this.pressKey(key);
                            }, 70);
                        }, 400);

                        enterElements.forEach(key => {
                            key.setAttribute("class", "keyboard_key active keyboard_enter");
                        });

                        // Keep focus on the terminal
                        if (window.keyboard.linkedToTerm) window.term[window.currentTerm].term.focus();
                        if (this.container.dataset.passwordMode == "false")
                            window.audioManager.granted.play();
                        e.preventDefault();
                    };
                    key.onmouseup = () => {
                        clearTimeout(key.holdTimeout);
                        clearInterval(key.holdInterval);

                        enterElements.forEach(key => {
                            key.setAttribute("class", "keyboard_key blink keyboard_enter");
                        });
                        setTimeout(() => {
                            enterElements.forEach(key => {
                                key.setAttribute("class", "keyboard_key keyboard_enter");
                            });
                        }, 100);
                    };
                } else {
                    key.onmousedown = e => {
                        if (/^ESCAPED\|-- (CTRL|SHIFT|ALT){1}.*/.test(key.dataset.cmd)) {
                            let cmd = key.dataset.cmd.substr(11);
                            if (cmd.startsWith("CTRL")) {
                                this.container.dataset.isCtrlOn = "true";
                            }
                            if (cmd.startsWith("SHIFT")) {
                                this.container.dataset.isShiftOn = "true";
                            }
                            if (cmd.startsWith("ALT")) {
                                this.container.dataset.isAltOn = "true";
                            }
                        } else {
                            key.holdTimeout = setTimeout(() => {
                                key.holdInterval = setInterval(() => {
                                    this.pressKey(key);
                                }, 70);
                            }, 400);
                            this.pressKey(key);
                        }

                        // Keep focus on the terminal
                        if (window.keyboard.linkedToTerm) window.term[window.currentTerm].term.focus();
                        if(this.container.dataset.passwordMode == "false")
                            window.audioManager.stdin.play();
                        e.preventDefault();
                    };
                    key.onmouseup = e => {
                        if (/^ESCAPED\|-- (CTRL|SHIFT|ALT){1}.*/.test(key.dataset.cmd)) {
                            let cmd = key.dataset.cmd.substr(11);
                            if (cmd.startsWith("CTRL")) {
                                this.container.dataset.isCtrlOn = "false";
                            }
                            if (cmd.startsWith("SHIFT")) {
                                this.container.dataset.isShiftOn = "false";
                            }
                            if (cmd.startsWith("ALT")) {
                                this.container.dataset.isAltOn = "false";
                            }
                        } else {
                            clearTimeout(key.holdTimeout);
                            clearInterval(key.holdInterval);
                        }

                        key.setAttribute("class", "keyboard_key blink");
                        setTimeout(() => {
                            key.setAttribute("class", "keyboard_key");
                        }, 100);
                    };
                }

                // See #229
                key.onmouseleave = () => {
                    clearTimeout(key.holdTimeout);
                    clearInterval(key.holdInterval);
                };
            });
        });

        // Tactile multi-touch support (#100)
        this.container.addEventListener("touchstart", e => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                let key = e.changedTouches[i].target.parentElement;
                if (key.tagName === 'svg') key = key.parentElement;
                if (key.getAttribute("class").startsWith("keyboard_key")) {
                    key.setAttribute("class", key.getAttribute("class")+" active");
                    key.onmousedown({preventDefault: () => {return true}});
                } else {
                    key = e.changedTouches[i].target;
                    if (key.getAttribute("class").startsWith("keyboard_key")) {
                        key.setAttribute("class", key.getAttribute("class")+" active");
                        key.onmousedown({preventDefault: () => {return true}});
                    }
                }
            }
        });
        let dropKeyTouchHandler = e => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                let key = e.changedTouches[i].target.parentElement;
                if (key.tagName === 'svg') key = key.parentElement;
                if (key.getAttribute("class").startsWith("keyboard_key")) {
                    key.setAttribute("class", key.getAttribute("class").replace("active", ""));
                    key.onmouseup({preventDefault: () => {return true}});
                } else {
                    key = e.changedTouches[i].target;
                    if (key.getAttribute("class").startsWith("keyboard_key")) {
                        key.setAttribute("class", key.getAttribute("class").replace("active", ""));
                        key.onmouseup({preventDefault: () => {return true}});
                    }
                }
            }
        };
        this.container.addEventListener("touchend", dropKeyTouchHandler);
        this.container.addEventListener("touchcancel", dropKeyTouchHandler);

        // Bind actual keyboard actions to on-screen animations (for use without a touchscreen)
        let findKey = e => {
            // Fix incorrect querySelector error
            let physkey;
            (e.key === "\"") ? physkey = `\\"` : physkey = e.key;

            // Find basic keys (typically letters, upper and lower-case)
            let key = document.querySelector('div.keyboard_key[data-cmd="'+physkey+'"]');
            if (key === null) key = document.querySelector('div.keyboard_key[data-shift_cmd="'+physkey+'"]');

            // Find special keys (shift, control, arrows, etc.)
            if (key === null && e.code === "ShiftLeft") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- SHIFT: LEFT"]');
            if (key === null && e.code === "ShiftRight") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- SHIFT: RIGHT"]');
            if (key === null && e.code === "ControlLeft") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- CTRL: LEFT"]');
            if (key === null && e.code === "ControlRight") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- CTRL: RIGHT"]');
            if (key === null && e.code === "AltLeft") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- FN: ON"]');
            if (key === null && e.code === "AltRight") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- ALT: RIGHT"]');
            if (key === null && e.code === "CapsLock") key = document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- CAPSLCK: ON"]');
            if (key === null && e.code === "Escape") key = document.querySelector('div.keyboard_key[data-cmd=""]');
            if (key === null && e.code === "Backspace") key = document.querySelector('div.keyboard_key[data-cmd=""]');
            if (key === null && e.code === "ArrowUp") key = document.querySelector('div.keyboard_key[data-cmd="OA"]');
            if (key === null && e.code === "ArrowLeft") key = document.querySelector('div.keyboard_key[data-cmd="OD"]');
            if (key === null && e.code === "ArrowDown") key = document.querySelector('div.keyboard_key[data-cmd="OB"]');
            if (key === null && e.code === "ArrowRight") key = document.querySelector('div.keyboard_key[data-cmd="OC"]');
            if (key === null && e.code === "Enter") key = document.querySelectorAll('div.keyboard_key.keyboard_enter');

            // Find "rare" keys (ctrl and alt symbols)
            if (key === null) key = document.querySelector('div.keyboard_key[data-ctrl_cmd="'+e.key+'"]');
            if (key === null) key = document.querySelector('div.keyboard_key[data-alt_cmd="'+e.key+'"]');

            return key;
        };

        this.keydownHandler = e => {
            // See #330
            if (e.getModifierState("AltGraph") && e.code === "AltRight") {
                document.querySelector('div.keyboard_key[data-cmd="ESCAPED|-- CTRL: LEFT"]').setAttribute("class", "keyboard_key");
            }

            // See #440
            if (e.code === "ControlLeft" || e.code === "ControlRight") this.container.dataset.isCtrlOn = true;
            if (e.code === "ShiftLeft" || e.code === "ShiftRight") this.container.dataset.isShiftOn = true;
            if (e.code === "AltLeft" || e.code === "AltRight") this.container.dataset.isAltOn = true;
            if (e.code === "CapsLock" && this.container.dataset.isCapsLckOn !== "true") this.container.dataset.isCapsLckOn = true;
            if (e.code === "CapsLock" && this.container.dataset.isCapsLckOn === "true") this.container.dataset.isCapsLckOn = false;

            let key = findKey(e);
            if (key === null) return;
            if (key.length) {
                key.forEach(enterElement => {
                    enterElement.setAttribute("class", "keyboard_key active keyboard_enter");
                });
            } else {
                key.setAttribute("class", "keyboard_key active");
            }

            // See #516
            if (e.repeat === false || (e.repeat === true && !e.code.startsWith('Shift') && !e.code.startsWith('Alt') && !e.code.startsWith('Control') && !e.code.startsWith('Caps'))) {
                if(this.container.dataset.passwordMode == "false")
                    window.audioManager.stdin.play();
            }
        };

        document.onkeydown = this.keydownHandler;

        document.onkeyup = e => {
            // See #330
            if (e.key === "Control" && e.getModifierState("AltGraph")) return;

            // See #440
            if (e.code === "ControlLeft" || e.code === "ControlRight") this.container.dataset.isCtrlOn = false;
            if (e.code === "ShiftLeft" || e.code === "ShiftRight") this.container.dataset.isShiftOn = false;
            if (e.code === "AltLeft" || e.code === "AltRight") this.container.dataset.isAltOn = false;

            let key = findKey(e);
            if (key === null) return;
            if (key.length) {
                key.forEach(enterElement => {
                    enterElement.setAttribute("class", "keyboard_key blink keyboard_enter");
                });
                setTimeout(() => {
                    key.forEach(enterElement => {
                        enterElement.setAttribute("class", "keyboard_key keyboard_enter");
                    });
                }, 100);
            } else {
                key.setAttribute("class", "keyboard_key blink");
                setTimeout(() => {
                    key.setAttribute("class", "keyboard_key");
                }, 100);
            }

            if(this.container.dataset.passwordMode == "false" && e.key === "Enter")
                window.audioManager.granted.play();
        };

        window.addEventListener("blur", () => {
            document.querySelectorAll("div.keyboard_key.active").forEach(key => {
                key.setAttribute("class", key.getAttribute("class").replace("active", ""));
                key.onmouseup({preventDefault: () => {return true}});
            });
        });
    }
    pressKey(key) {
        let cmd = key.dataset.cmd || "";

        // Keyboard shortcuts
        let shortcutsCat = "";
        if (this.container.dataset.isCtrlOn === "true") shortcutsCat += "Ctrl";
        if (this.container.dataset.isAltOn === "true") shortcutsCat += "Alt";
        if (this.container.dataset.isShiftOn === "true") shortcutsCat += "Shift";

        let shortcutsTriggered = false;

        if (shortcutsCat.length > 1) {
            this._shortcuts[shortcutsCat].forEach(cut => {
                if (!cut.enabled) return;
        
                let trig = cut.trigger.toLowerCase()
                                    .replace("plus", "+")
                                    .replace("space", " ")
                                    .replace("tab", "\t")
                                    .replace(/backspace|delete/, "\b")
                                    .replace(/esc|escape/, this.ctrlseq[1])
                                    .replace(/return|enter/, "\r");

                if (cmd !== trig) return;

                if (cut.type === "app") {
                    window.useAppShortcut(cut.action);
                    shortcutsTriggered = true;
                } else if (cut.type === "shell") {
                    let fn = (cut.linebreak) ? writelr : write;
                    window.term[window.currentTerm][fn](cut.action);
                } else {
                    console.warn(`${cut.trigger} has unknown type`);
                }
            });
        }

        if (shortcutsTriggered) return;

        // Modifiers
        if (this.container.dataset.isShiftOn === "true" && key.dataset.shift_cmd || this.container.dataset.isCapsLckOn === "true" && key.dataset.shift_cmd) cmd = key.dataset.shift_cmd;
        if (this.container.dataset.isCapsLckOn === "true" && key.dataset.capslck_cmd) cmd = key.dataset.capslck_cmd;
        if (this.container.dataset.isCtrlOn === "true" && key.dataset.ctrl_cmd) cmd = key.dataset.ctrl_cmd;
        if (this.container.dataset.isAltOn === "true" && key.dataset.alt_cmd) cmd = key.dataset.alt_cmd;
        if (this.container.dataset.isAltOn === "true" && this.container.dataset.isShiftOn === "true" && key.dataset.altshift_cmd) cmd = key.dataset.altshift_cmd;
        if (this.container.dataset.isFnOn === "true" && key.dataset.fn_cmd) cmd = key.dataset.fn_cmd;
        if (this.container.dataset.isNextCircum === "true") {
            cmd = this.addCircum(cmd);
            this.container.dataset.isNextCircum = "false";
        }
        if (this.container.dataset.isNextTrema === "true") {
            cmd = this.addTrema(cmd);
            this.container.dataset.isNextTrema = "false";
        }
        if (this.container.dataset.isNextAcute === "true") {
            cmd = this.addAcute(cmd);
            this.container.dataset.isNextAcute = "false";
        }
        if (this.container.dataset.isNextGrave === "true") {
            cmd = this.addGrave(cmd);
            this.container.dataset.isNextGrave = "false";
        }
        if (this.container.dataset.isNextCaron === "true") {
            cmd = this.addCaron(cmd);
            this.container.dataset.isNextCaron = "false";
        }
        if (this.container.dataset.isNextBar === "true") {
            cmd = this.addBar(cmd);
            this.container.dataset.isNextBar = "false";
        }
        if (this.container.dataset.isNextBreve === "true") {
            cmd = this.addBreve(cmd);
            this.container.dataset.isNextBreve = "false";
        }
        if (this.container.dataset.isNextTilde === "true") {
            cmd = this.addTilde(cmd);
            this.container.dataset.isNextTilde = "false";
        }
        if (this.container.dataset.isNextMacron === "true") {
            cmd = this.addMacron(cmd);
            this.container.dataset.isNextMacron = "false";
        }
        if (this.container.dataset.isNextCedilla === "true") {
            cmd = this.addCedilla(cmd);
            this.container.dataset.isNextCedilla = "true";
        }
        if (this.container.dataset.isNextOverring === "true") {
            cmd = this.addOverring(cmd);
            this.container.dataset.isNextOverring = "false";
        }
        if (this.container.dataset.isNextGreek === "true") {
            cmd = this.toGreek(cmd);
            this.container.dataset.isNextGreek = "false";
        }
        if (this.container.dataset.isNextIotasub === "true") {
            cmd = this.addIotasub(cmd);
            this.container.dataset.isNextIotasub = "false";
        }

        // Escaped commands
        if (cmd.startsWith("ESCAPED|-- ")) {
            cmd = cmd.substr(11);
            switch(cmd) {
                case "CAPSLCK: ON":
                    this.container.dataset.isCapsLckOn = "true";
                    return true;
                case "CAPSLCK: OFF":
                    this.container.dataset.isCapsLckOn = "false";
                    return true;
                case "FN: ON":
                    this.container.dataset.isFnOn = "true";
                    return true;
                case "FN: OFF":
                    this.container.dataset.isFnOn = "false";
                    return true;
                case "CIRCUM":
                    this.container.dataset.isNextCircum = "true";
                    return true;
                case "TREMA":
                    this.container.dataset.isNextTrema = "true";
                    return true;
                case "ACUTE":
                    this.container.dataset.isNextAcute = "true";
                    return true;
                case "GRAVE":
                    this.container.dataset.isNextGrave = "true";
                    return true;
                case "CARON":
                    this.container.dataset.isNextCaron = "true";
                    return true;
                case "BAR":
                    this.container.dataset.isNextBar = "true";
                    return true;
                case "BREVE":
                    this.container.dataset.isNextBreve = "true";
                    return true;
                case "TILDE":
                    this.container.dataset.isNextTilde = "true";
                    return true;
                case "MACRON":
                    this.container.dataset.isNextMacron = "true";
                    return true;
                case "CEDILLA":
                    this.container.dataset.isNextCedilla = "true";
                    return true;
                case "OVERRING":
                    this.container.dataset.isNextOverring = "true";
                    return true;
                case "GREEK":
                    this.container.dataset.isNextGreek = "true";
                    return true;
                case "IOTASUB":
                    this.container.dataset.isNextIotasub = "true";
                    return true;
            }
        }


        if (cmd === "\n") {
            if (window.keyboard.linkedToTerm) {
                window.term[window.currentTerm].writelr("");
            } else {
                document.activeElement.dispatchEvent(new CustomEvent("change", {detail: "enter" }));
            }
            return true;
        }


        if (window.keyboard.linkedToTerm) {
            window.term[window.currentTerm].write(cmd);
        } else {
            let isDelete = false;
            if (typeof document.activeElement.value !== "undefined") {
                switch(cmd) {
                    case "":
                        document.activeElement.value = document.activeElement.value.slice(0, -1);
                        isDelete = true;
                        break;
                    case "OD":
                        document.activeElement.selectionStart--;
                        document.activeElement.selectionEnd = document.activeElement.selectionStart;
                        break;
                    case "OC":
                        document.activeElement.selectionEnd++;
                        document.activeElement.selectionStart = document.activeElement.selectionEnd;
                        break;
                    default:
                        if (this.ctrlseq.indexOf(cmd.slice(0, 1)) !== -1) {
                            // Prevent trying to write other control sequences
                        } else {
                            document.activeElement.value = document.activeElement.value+cmd;
                        }
                }
            }
            // Emulate oninput events
            document.activeElement.dispatchEvent(new CustomEvent("input", {detail: ((isDelete)? "delete" : "insert") }));
            document.activeElement.focus();
        }
    }
    togglePasswordMode() {
        let d = this.container.dataset.passwordMode;
        (d === "true") ? d = "false" : d = "true";
        this.container.dataset.passwordMode = d;
        window.passwordMode = d;
        return d;
    }
    addCircum(char) {
        switch(char) {
            case "a":
                return "??";
            case "A":
                return "??";
            case "z":
                return "???";
            case "Z":
                return "???";
            case "e":
                return "??";
            case "E":
                return "??";
            case "y":
                return "??";
            case "Y":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "i":
                return "??";
            case "I":
                return "??";
            case "o":
                return "??";
            case "O":
                return "??";
            case "s":
                return "??";
            case "S":
                return "??";
            case "g":
                return "??";
            case "G":
                return "??";
            case "h":
                return "??";
            case "H":
                return "??";
            case "j":
                return "??";
            case "J":
                return "??";
            case "w":
                return "??";
            case "W":
                return "??";
            case "c":
                return "??";
            case "C":
                return "??";
            // the circumflex can also be used for superscript numbers
            case "1":
                return "??";
            case "2":
                return "??";
            case "3":
                return "??";
            case "4":
                return "???";
            case "5":
                return "???";
            case "6":
                return "???";
            case "7":
                return "???";
            case "8":
                return "???";
            case "9":
                return "???";
            case "0":
                return "???";
            default:
                return char;
        }
    }
    addTrema(char) {
        switch(char) {
            case "a":
                return "??";
            case "A":
                return "??";
            case "e":
                return "??";
            case "E":
                return "??";
            case "t":
                return "???";
            // My keyboard says no uppercase ???
            case "y":
                return "??";
            case "Y":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "i":
                return "??";
            case "I":
                return "??";
            case "o":
                return "??";
            case "O":
                return "??";
            case "h":
                return "???";
            case "H":
                return "???";
            case "w":
                return "???";
            case "W":
                return "???";
            case "x":
                return "???";
            case "X":
                return "???";
            default:
                return char;
        }
    }
    addAcute(char) {
        switch(char) {
            case "a":
                return "??";
            case "A":
                return "??";
            case "c":
                return "??";
            case "C":
                return "??";
            case "e":
                return "??";
            case "E":
                return "E";
            case "g":
                return "??";
            case "G":
                return "??";
            case "i":
                return "??";
            case "I":
                return "??";
            case "j":
                return "????";
            case "J":
                return "J??";
            case "k":
                return "???";
            case "K":
                return "???";
            case "l":
                return "??";
            case "L":
                return "??";
            case "m":
                return "???";
            case "M":
                return "???";
            case "n":
                return "??";
            case "N":
                return "??";
            case "o":
                return "??";
            case "O":
                return "??";
            case "p":
                return "???";
            case "P":
                return "???";
            case "r":
                return "??";
            case "R":
                return "??";
            case "s":
                return "??";
            case "S":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "v":
                return "v??";
            case "V":
                return "V??";
            case "w":
                return "???";
            case "W":
                return "???";
            case "y":
                return "??";
            case "Y":
                return "??";
            case "z":
                return "??";
            case "Z":
                return "??";
            case "??":
                return "???";
            case "??":
                return "???";
            case "??":
                return "???";
            case "??":
                return "???";
            default:
                return char;
        }
    }
    addGrave(char) {
        switch (char) {
            case "a":
                return "??";
            case "A":
                return "??";
            case "e":
                return "??";
            case "E":
                return "??";
            case "i":
                return "??";
            case "I":
                return "??";
            case "m":
                return "m??";
            case "M":
                return "M??";
            case "n":
                return "??";
            case "N":
                return "??";
            case "o":
                return "??";
            case "O":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "v":
                return "v??";
            case "V":
                return "V??";
            case "w":
                return "???";
            case "W":
                return "???";
            case "y":
                return "???";
            case "Y":
                return "???";
            case "??":
                return "???";
            case "??":
                return "???";
            default:
                return char;
        }
    }
    addCaron(char) {
        switch (char) {
            case "a":
                return "??";
            case "A":
                return "??";
            case "c":
                return "??";
            case "C":
                return "??";
            case "d":
                return "??";
            case "D":
                return "??";
            case "e":
                return "??";
            case "E":
                return "??";
            case "g":
                return "??";
            case "G":
                return "??";
            case "h":
                return "??";
            case "H":
                return "??";
            case "i":
                return "??";
            case "I":
                return "??";
            case "j":
                return "??";
            case "k":
                return "??";
            case "K":
                return "??";
            case "l":
                return "??";
            case "L":
                return "??";
            case "n":
                return "??";
            case "N":
                return "??";
            case "o":
                return "??";
            case "O":
                return "??";
            case "r":
                return "??";
            case "R":
                return "??";
            case "s":
                return "??";
            case "S":
                return "??";
            case "t":
                return "??";
            case "T":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "z":
                return "??";
            case "Z":
                return "??";
            // caron can also be used for subscript numbers
            case "1":
                return "???";
            case "2":
                return "???";
            case "3":
                return "???";
            case "4":
                return "???";
            case "5":
                return "???";
            case "6":
                return "???";
            case "7":
                return "???";
            case "8":
                return "???";
            case "9":
                return "???";
            case "0":
                return "???";
            default:
                return char;
        }
    }
    addBar(char) {
        switch (char) {
            case "a":
                return "???";
            case "A":
                return "??";
            case "b":
                return "??";
            case "B":
                return "??";
            case "c":
                return "??";
            case "C":
                return "??";
            case "d":
                return "??";
            case "D":
                return "??";
            case "e":
                return "??";
            case "E":
                return "??";
            case "g":
                return "??";
            case "G":
                return "??";
            case "h":
                return "??";
            case "H":
                return "??";
            case "i":
                return "??";
            case "I":
                return "??";
            case "j":
                return "??";
            case "J":
                return "??";
            case "l":
                return "??";
            case "L":
                return "??";
            case "o":
                return "??";
            case "O":
                return "??";
            case "p":
                return "???";
            case "P":
                return "???";
            case "r":
                return "??";
            case "R":
                return "??";
            case "t":
                return "??";
            case "T":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "y":
                return "??";
            case "Y":
                return "??";
            case "z":
                return "??";
            case "Z":
                return "??";
            default:
                return char;
        }
    }
    addBreve(char) {
        switch (char) {
            case "a":
                return "??";
            case "A":
                return "??";
            case "e":
                return "??";
            case "E":
                return "??";
            case "g":
                return "??";
            case "G":
                return "??";
            case "i":
                return "??";
            case "I":
                return "??";
            case "o":
                return "??";
            case "O":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "??":
                return "???";
            case "??":
                return "???";
            default:
                return char;
        }
    }
    addTilde(char) {
        switch (char) {
            case "a":
                return "??";
            case "A":
                return "??";
            case "e":
                return "???";
            case "E":
                return "???";
            case "i":
                return "??";
            case "I":
                return "??";
            case "n":
                return "??";
            case "N":
                return "??";
            case "o":
                return "??";
            case "O":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "v":
                return "???";
            case "V":
                return "???";
            case "y":
                return "???";
            case "Y":
                return "???";
            case "??":
                return "???";
            case "??":
                return "???";
            default:
                return char;
        }
    }
    addMacron(char) {
        switch (char) {
            case "a":
                return "??";
            case "A":
                return "??";
            case "e":
                return "??";
            case "E":
                return "??";
            case "g":
                return "???";
            case "G":
                return "???";
            case "i":
                return "??";
            case "I":
                return "??";
            case "o":
                return "??";
            case "O":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "y":
                return "??";
            case "Y":
                return "??";
            case "??":
                return "???";
            case "??":
                return "???";
            case "??":
                return "???";
            case "??":
                return "???";
            default:
                return char;
        }
    }
    addCedilla(char) {
        switch (char) {
            case "c":
                return "??";
            case "C":
                return "??";
            case "d":
                return "???";
            case "D":
                return "???";
            case "e":
                return "??";
            case "E":
                return "??";
            case "g":
                return "??";
            case "G":
                return "??";
            case "h":
                return "???";
            case "H":
                return "???";
            case "k":
                return "??";
            case "K":
                return "??";
            case "l":
                return "??";
            case "L":
                return "??";
            case "n":
                return "??";
            case "N":
                return "??";
            case "r":
                return "??";
            case "R":
                return "??";
            case "s":
                return "??";
            case "S":
                return "??";
            case "t":
                return "??";
            case "T":
                return "??";
            default:
                return char;
        }
    }
    addOverring(char) {
        switch (char) {
            case "a":
                return "??";
            case "A":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "w":
                return "???"; // capital w with overring not supported on b??po layout apparently
            case "y":
                return "???"; // same for capital y with overring
            default:
                return char;
        }
    }
    toGreek(char) {
        switch (char) {
            case "b":
                return "??";
            case "p":
                return "??";
            case "P":
                return "??";
            case "d":
                return "??";
            case "D":
                return "??";
            case "l":
                return "??";
            case "L":
                return "??";
            case "j":
                return "??";
            case "J":
                return "??";
            case "z":
                return "??";
            case "w":
                return "??";
            case "W":
                return "??";
            case "A":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "i":
                return "??";
            case "e":
                return "??";
            case "t":
                return "??";
            case "s":
                return "??";
            case "S":
                return "??";
            case "r":
                return "??";
            case "R":
                return "??";
            case "n":
                return "??";
            case "m":
                return "??";
            case "y":
                return "??";
            case "Y":
                return "??";
            case "x":
                return "??";
            case "X":
                return "??";
            case "k":
                return "??";
            case "q":
                return "??";
            case "Q":
                return "??";
            case "g":
                return "??";
            case "G":
                return "??";
            case "h":
                return "??";
            case "f":
                return "??";
            case "F":
                return "??";
            default:
                return char;
        }
    }
    addIotasub(char) {
        switch (char) {
            case "o":
                return "??";
            case "O":
                return "??";
            case "a":
                return "??";
            case "A":
                return "??";
            case "u":
                return "??";
            case "U":
                return "??";
            case "i":
                return "??";
            case "I":
                return "??";
            case "e":
                return "??";
            case "E":
                return "??";
            default:
                return char;
        }
    }
}

module.exports = {
    Keyboard
};
