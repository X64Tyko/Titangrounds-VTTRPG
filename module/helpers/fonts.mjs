/**
 * Build a shared font definition structure.
 *
 * @param path {string} Path to the font file, including extension, within the assets/fonts/ folder.
 * @param style {'normal'|'italic'} Font Style
 * @param weight {string} Font weights
 */
function buildDefinition(path, style = 'normal', weight = '400') {
    return {
        urls: [`systems/monhunsys/data/${path}`],
        style,
        weight,
    };
}

/**
 * Registers all fonts used by the system so that they are available in the text editor.
 */
export function registerFonts() {
    CONFIG.fontDefinitions['Monster Hunter'] = {
        editor: true,
        fonts: [
            buildDefinition('MonsterHunterFont/Monster hunter.ttf', 'normal', '100'),
        ],
    };
    CONFIG.fontDefinitions['Monster Hunter Rotal'] = {
        editor: true,
        fonts: [
            buildDefinition('MonsterHunterFont/monsterhunterrotal.ttf', 'normal', '100'),
        ],
    };
}