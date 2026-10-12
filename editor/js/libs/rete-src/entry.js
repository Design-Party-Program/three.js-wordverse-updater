// Re-exports the subset of rete.js v2 the WordVerse Rete graph editor uses, as one
// vendored ESM bundle (no framework render adapter - see ReteGraphRenderer.js for the
// hand-written vanilla DOM renderer plugged into AreaPlugin's render pipe).
export { NodeEditor, ClassicPreset } from 'rete';
export { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
export { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
