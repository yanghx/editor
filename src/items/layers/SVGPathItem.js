import PathParser from "@parser/PathParser";
import { clone } from "@core/functions/func";
import { hasSVGProperty, hasCSSProperty, hasSVGPathProperty } from "@util/Resource";
import icon from "@icon/icon";
import { ComponentManager } from "@manager/ComponentManager";
import { SVGItem } from "./SVGItem";

export class SVGPathItem extends SVGItem {

  getIcon () {
    return icon.edit;
  }  
  getDefaultObject(obj = {}) {
    return super.getDefaultObject({
      itemType: 'svg-path',
      name: "New Path",   
      'stroke-width': 5,
      d: '',        // 이건 최종 결과물로만 쓰고 나머지는 모두 segments 로만 사용한다. 
      segments: [],
      totalLength: 0,
      ...obj
    });
  }

  enableHasChildren() {
    return false; 
  }
 

  setCache () {
    this.rect = {
      width: this.json.width.clone(),
      height: this.json.height.clone()
    }
    if (!this.json.path) {
      this.json.path = new PathParser(this.json.d);
    }

    if (!this.cachePath) {
      this.cachePath = this.json.path.clone()
    } else if (this.json.path.d !== this.cachePath.d) {
      this.cachePath = this.json.path.clone()
    }
  }

  recover () {

    // 캐쉬가 없는 상태에서는 초기 캐쉬를 생성해준다. 
    if (!this.rect) this.setCache();

    var baseWidth = this.rect.width.value
    if (baseWidth === 0) baseWidth = 1; 

    var baseHeight = this.rect.height.value
    if (baseHeight === 0) baseHeight = 1;     

    var sx = this.json.width.value / baseWidth 
    var sy = this.json.height.value / baseHeight

    this.scale(sx, sy);
  }

  scale (sx, sy) {
    this.json.d = this.cachePath.clone().scaleTo(sx, sy)
    this.json.path.reset(this.json.d)
  }

  convert(json) {
    json = super.convert(json);
    if (json.d)  {
      json.path = new PathParser(json.d);
    }

    return json;
  }

  toCloneObject() {
    var json = this.json; 
    return {
      ...super.toCloneObject(),
      totalLength: json.totalLength,
      d: json.d,
      segments: clone(this.json.segments)
    }
  }

  getDefaultTitle() {
    return "Path";
  }

  toAnimationKeyframes (properties) {

    var svgProperties = properties.filter(it => hasSVGProperty(it.property) && hasSVGPathProperty(it.property));
    var cssProperties = properties.filter(it => hasCSSProperty(it.property));

    return [
      { selector: `[data-id="${this.json.id}"]`, properties: cssProperties  },
      { selector: `[data-id="${this.json.id}"] path`, properties: svgProperties }
    ] 
  }  

}

ComponentManager.registerComponent('svg-path', SVGPathItem)