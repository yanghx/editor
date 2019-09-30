import BaseProperty from "./BaseProperty";
import { editor } from "../../../editor/editor";
import { DEBOUNCE } from "../../../util/Event";
import { EVENT } from "../../../util/UIElement";
import { Transform } from "../../../editor/css-property/Transform";



const blend_list = [
  '',
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity"
].join(',');


export default class BackgroundColorProperty extends BaseProperty {

  getTitle() {
    return "Common";
  }

  getBody() {
    return /*html*/`
        <div class='property-item animation-property-item'>
          <span class='add-timeline-property' data-property='background-color'></span>
          <ColorViewEditor ref='$color' label="color" key='background-color' onchange="changeColor" />
        </div>

        <div class='property-item animation-property-item'>
          <span class='add-timeline-property' data-property='opacity'></span>
          <NumberRangeEditor 
            ref='$opacity' 
            key='opacity' 
            label='opacity'
            min="0"
            max="1"
            step="0.01"
            selected-unit=' '
            removable="true"
            onchange="changeSelect" />
        </div>
        
        <div class='property-item animation-property-item'>
          <span class='add-timeline-property' data-property='mix-blend-mode'></span>
          <SelectEditor 
            label='blend'
            ref='$mixBlend' 
            key='mix-blend-mode' 
            icon="true" 
            options="${blend_list}" 
            onchange="changeSelect" />
        </div>        
      `;
  }  

  refresh () {
    var current = editor.selection.current; 

    if (current) {
      this.children.$color.setValue(current['background-color'] || 'rgba(0, 0, 0, 1)')
      this.children.$opacity.setValue(current.opacity || '1')
      this.children.$mixBlend.setValue(current['mix-blend-mode'])
    }
  }


  [EVENT('changeSelect')] (key, value) {
       editor.selection.reset({
        [key]: value
      })
 
    this.emit("refreshSelectionStyleView");
  }

  [EVENT('changeColor')] (key, color) {
    this.trigger('changeSelect', key, color);
  }

  [EVENT('refreshSelection') + DEBOUNCE(100)]() {
    this.refreshShowIsNot('project');
  }
}
